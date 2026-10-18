const fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
for(const n of ['model','phases','exercise']){
 const s=fs.readFileSync(__dirname+'/src/'+n+'.ts','utf8');
 fs.writeFileSync(__dirname+'/'+n+'.js',stripTypeScriptTypes(s).replaceAll("from './model'","from './model.js'"));
}
