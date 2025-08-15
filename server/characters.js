const express = require('express');
const { requireAuth } = require('./auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// -------------------------
// Persistance JSON simple
// -------------------------
const DATA_DIR = path.join(__dirname, 'data');
const CHAR_FILE = path.join(DATA_DIR, 'characters.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

function loadAllCharacters() {
  ensureDataDir();
  try {
    if (!fs.existsSync(CHAR_FILE)) return {};
    const raw = fs.readFileSync(CHAR_FILE, 'utf8');
    const json = JSON.parse(raw);
    return typeof json === 'object' && json ? json : {};
  } catch (_) {
    return {};
  }
}

function saveAllCharacters(obj) {
  ensureDataDir();
  try {
    fs.writeFileSync(CHAR_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (_) {}
}

// En mémoire: userId -> array; synchronisé avec disque à chaque mutation
const userCharacters = new Map();
let nextCharId = 1000;

// Chargement initial depuis disque
(function initFromDisk() {
  const all = loadAllCharacters();
  // all est un objet { [userId]: Character[] }
  Object.keys(all).forEach(userId => {
    const arr = Array.isArray(all[userId]) ? all[userId] : [];
    userCharacters.set(Number(userId), arr);
    // Ajuster nextCharId en fonction des IDs existants
    for (const ch of arr) {
      if (typeof ch.id === 'number' && ch.id >= nextCharId) nextCharId = ch.id + 1;
    }
  });
})();

function persistCurrentState() {
  // Recompose un objet sérialisable
  const out = {};
  for (const [uid, arr] of userCharacters.entries()) {
    out[uid] = arr;
  }
  saveAllCharacters(out);
}

router.get('/', requireAuth, (req, res) => {
  const arr = userCharacters.get(req.user.userId) || [];
  res.json(arr);
});

router.post('/', requireAuth, express.json(), (req, res) => {
  const { name, avatar } = req.body || {};
  if (!name || !avatar) return res.status(400).json({ error: 'name et avatar requis' });
  const arr = userCharacters.get(req.user.userId) || [];
  const ch = { id: nextCharId++, name: String(name), avatar: String(avatar), createdAt: Date.now() };
  arr.push(ch);
  userCharacters.set(req.user.userId, arr);
  persistCurrentState();
  res.status(201).json(ch);
});

router.delete('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'id invalide' });
  const arr = userCharacters.get(req.user.userId) || [];
  const idx = arr.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'introuvable' });
  arr.splice(idx, 1);
  userCharacters.set(req.user.userId, arr);
  persistCurrentState();
  res.json({ ok: true });
});

module.exports = { charactersRouter: router };


