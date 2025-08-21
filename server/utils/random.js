function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function makeId(prefix='m') { return prefix + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*1e6).toString(36); }

module.exports = { randInt, makeId };


