const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib");
const payload=[0,1,2,3,4,5,6,7,8].map(i=>fs.readFileSync(`payload${i}.txt`,"utf8")).join("");
const files=JSON.parse(zlib.gunzipSync(Buffer.from(payload,"base64")).toString("utf8"));
for(const [name,data] of Object.entries(files)){const target=path.join(process.cwd(),name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}
console.log(`Restored ${Object.keys(files).length} Pixel Realms source files.`);
