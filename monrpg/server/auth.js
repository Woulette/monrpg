// Auth simple: inscription, connexion, vérification de token
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// -------------------------
// Persistance JSON des utilisateurs
// -------------------------
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(_) {}
}

function loadUsersFromDisk() {
  ensureDataDir();
  try {
    if (!fs.existsSync(USERS_FILE)) return { nextUserId: 1, users: {} };
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const json = JSON.parse(raw);
    if (!json || typeof json !== 'object') return { nextUserId: 1, users: {} };
    const nextId = typeof json.nextUserId === 'number' ? json.nextUserId : 1;
    const obj = (json.users && typeof json.users === 'object') ? json.users : {};
    return { nextUserId: nextId, users: obj };
  } catch(_) { return { nextUserId: 1, users: {} }; }
}

function saveUsersToDisk(state) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch(_) {}
}

// Stockage en mémoire (persisté sur disque)
const users = new Map(); // username -> { id, username, passwordHash, createdAt }
let nextUserId = 1;



// Chargement initial
(function initUsers() {
  const state = loadUsersFromDisk();
  nextUserId = state.nextUserId || 1;
  
  // Charger les utilisateurs sauvegardés
  for (const username of Object.keys(state.users)) {
    const u = state.users[username];
    if (u && typeof u === 'object') users.set(username, u);
  }
  

})();

function persistUsers() {
  const out = { nextUserId, users: {} };
  for (const [uname, u] of users.entries()) out.users[uname] = u;
  saveUsersToDisk(out);
}

// Clé secrète JWT (en prod: variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

// Helpers
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Optionnel: vérifier que l'utilisateur existe encore (évite jetons "fantômes" après restart)
    const u = users.get(decoded.username);
    if (!u || u.id !== decoded.userId) return res.status(401).json({ error: 'Utilisateur inconnu' });
    req.user = { userId: u.id, username: u.username };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Inscription
router.post('/signup', express.json(), async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username et password requis' });
  if (users.has(username)) return res.status(409).json({ error: 'Utilisateur déjà existant' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nextUserId++, username, passwordHash, createdAt: Date.now() };
  users.set(username, user);
  persistUsers();
  return res.status(201).json({ message: 'Compte créé' });
});

// Connexion
router.post('/login', express.json(), async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username et password requis' });
  const user = users.get(username);
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
  const token = createToken({ userId: user.id, username: user.username });
  return res.json({ accessToken: token });
});

// Profil (test du token)
router.get('/me', requireAuth, (req, res) => {
  // req.user a été validé par requireAuth (existe bien côté serveur)
  return res.json({ userId: req.user.userId, username: req.user.username });
});



module.exports = { authRouter: router, requireAuth };


