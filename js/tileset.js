console.log("Fichier js/tileset.js chargé");

let tilesetImages = [];
let tilesets = [];

function loadTilesets(tilesetDefs) {
    console.log("Appel à loadTilesets");
    let promises = tilesetDefs.map(ts => {
        let img = new Image();
        img.src = 'assets/' + ts.image;
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

        return new Promise(res => { img.onload = res; });
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
