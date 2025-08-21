let tilesetImages = [];
let tilesets = [];

function loadTilesets(tilesetDefs) {
    let promises = tilesetDefs.map(ts => {
        let img = new Image();
        // Gérer les différents chemins de tilesets
        let tilesetPath;
        if (ts.image.startsWith('../../')) {
            // Chemin absolu (comme ../../Downloads/portail.png) - utiliser le chemin tel quel
            tilesetPath = ts.image;
        } else if (ts.image === 'map.png') {
            // Tileset map.png dans le dossier maps
            tilesetPath = 'assets/maps/' + ts.image;
        } else {
            // Autres tilesets dans le dossier maps
            tilesetPath = 'assets/maps/' + ts.image;
        }
        img.src = tilesetPath;
        tilesetImages.push(img);

        tilesets.push({
            firstgid: ts.firstgid,
            columns: ts.columns,
            tilecount: ts.tilecount,
            tilewidth: ts.tilewidth,
            tileheight: ts.tileheight,
            image: img,
            imagewidth: ts.imagewidth,
            imageheight: ts.imageheight,
        });

        return new Promise((resolve, reject) => {
            img.onload = () => {
                resolve();
            };
            img.onerror = () => {
                console.error(`✗ Erreur de chargement du tileset: ${tilesetPath}`);
                console.error(`  - Chemin original: ${ts.image}`);
                console.error(`  - Chemin résolu: ${tilesetPath}`);
                // Pour les tilesets optionnels (comme portail.png), on continue sans erreur
                if (ts.image.includes('portail.png')) {
                    console.warn(`⚠ Tileset optionnel non trouvé: ${tilesetPath} - continuation...`);
                    // Ne pas ajouter ce tileset à la liste s'il ne peut pas être chargé
                    tilesetImages.pop(); // Retirer l'image qu'on vient d'ajouter
                    tilesets.pop(); // Retirer le tileset qu'on vient d'ajouter
                    resolve();
                } else {
                    // Au lieu de rejeter, on crée une image vide pour éviter le crash
                    console.warn(`⚠ Tileset non trouvé: ${tilesetPath} - création d'une image vide`);
                    img.width = 32;
                    img.height = 32;
                    resolve();
                }
            };
        });
    });
    return Promise.all(promises);
}

function getTilesetForGid(gid) {
    let sorted = tilesets.slice().sort((a, b) => b.firstgid - a.firstgid);
    for (let ts of sorted) {
        if (gid >= ts.firstgid) return ts;
    }
    return null;
}

// Rendre les fonctions accessibles globalement
window.loadTilesets = loadTilesets;
window.getTilesetForGid = getTilesetForGid;
