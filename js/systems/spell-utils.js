// Utilitaires de sorts: cooldown visuel, calcul de dégâts, helpers d'affichage

function startSpellCooldown(slotId, duration) {
  const slot = document.getElementById(slotId);
  const cooldown = slot ? slot.querySelector('.spell-cooldown') : null;
  if (!slot || !cooldown) return;
  if (slot._cooldownInterval) { clearInterval(slot._cooldownInterval); slot._cooldownInterval = null; }
  slot.classList.add('cooldown');
  let remaining = duration; cooldown.textContent = remaining.toFixed(1);
  slot._cooldownInterval = setInterval(() => {
    remaining -= 0.1;
    if (remaining <= 0) { slot.classList.remove('cooldown'); cooldown.textContent = ''; clearInterval(slot._cooldownInterval); slot._cooldownInterval = null; }
    else { cooldown.textContent = remaining.toFixed(1); }
  }, 100);
}

function computeSpellDamage(baseMin, baseMax) {
  const base = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
  const bonus = 1 + (player.force * 0.05);
  let damage = Math.floor(base * bonus);
  let isCrit = false;
  if (typeof isPlayerCrit === 'function' && isPlayerCrit()) {
    const critMultiplier = 1.5; const critBonus = (typeof getPlayerCritDamage === 'function') ? getPlayerCritDamage() : 0;
    damage = Math.floor(damage * critMultiplier * (1 + critBonus)); isCrit = true;
  }
  return { damage, isCrit };
}

// Exports globaux (pour compatibilité immédiate)
window.startSpellCooldown = startSpellCooldown;
window.computeSpellDamage = computeSpellDamage;

