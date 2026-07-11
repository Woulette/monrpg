const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib");
const payload=fs.readFileSync("payload.txt","utf8");
const files=JSON.parse(zlib.gunzipSync(Buffer.from(payload,"base64")).toString("utf8"));
for(const [name,data] of Object.entries(files)){const target=path.join(process.cwd(),name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}
console.log(`Restored ${Object.keys(files).length} Pixel Realms source files.`);
