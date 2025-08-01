// Système de pathfinding A* - Core
// Nettoyé et validé le 30/07/2025 - par Cursor

function initPathfinding() {
    // Le pathfinding est déjà configuré avec la fonction findPath
    // Cette fonction peut être utilisée pour des initialisations supplémentaires si nécessaire
}

function findPath(start, end, isBlocked, width, height) {
    const open = [];
    const closed = new Set();
    const parent = {};
    const key = (x, y) => x + "," + y;

    open.push({
        x: start.x, y: start.y,
        g: 0,
        h: Math.abs(end.x - start.x) + Math.abs(end.y - start.y),
    });

    while (open.length > 0) {
        open.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        const current = open.shift();
        if (current.x === end.x && current.y === end.y) {
            // Reconstitue le chemin :
            const path = [];
            let cur = key(current.x, current.y);
            let n = cur;
            while (n !== key(start.x, start.y)) {
                const [px, py] = parent[n].split(',').map(Number);
                path.push({ x: Number(n.split(',')[0]), y: Number(n.split(',')[1]) });
                n = key(px, py);
            }
            path.reverse();
            return path;
        }
        closed.add(key(current.x, current.y));

        // 4 directions
        for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            if (
                nx < 0 || nx >= width ||
                ny < 0 || ny >= height ||
                isBlocked(nx, ny) ||
                closed.has(key(nx, ny))
            ) continue;
            // déjà dans open ?
            if (open.find(n => n.x === nx && n.y === ny)) continue;
            open.push({
                x: nx, y: ny,
                g: current.g + 1,
                h: Math.abs(end.x - nx) + Math.abs(end.y - ny),
            });
            parent[key(nx, ny)] = key(current.x, current.y);
        }
    }
    return null; // aucun chemin trouvé
}
