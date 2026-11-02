import {NodeIO} from '@gltf-transform/core';
import {EXTMeshoptCompression,ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const array=accessor=>accessor?sha(new Uint8Array(accessor.getArray().buffer,accessor.getArray().byteOffset,accessor.getArray().byteLength)):null;
function indexFingerprint(accessor,mode){
 if(!accessor)return null;
 const source=accessor.getArray(),output=new Uint32Array(source.length);
 if(mode===4){for(let i=0;i<source.length;i+=3){const triangle=[source[i],source[i+1],source[i+2]],rotations=[triangle,[triangle[1],triangle[2],triangle[0]],[triangle[2],triangle[0],triangle[1]]];rotations.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);output.set(rotations[0],i);}}
 else output.set(source);
 return sha(new Uint8Array(output.buffer));
}
function fingerprint(doc){
 const root=doc.getRoot(),nodes=root.listNodes(),nodeId=node=>nodes.indexOf(node),meshCache=new Map();
 const texture=tex=>tex?sha(tex.getImage()):null;
 const material=mat=>mat?{base:mat.getBaseColorFactor(),emissive:mat.getEmissiveFactor(),rough:mat.getRoughnessFactor(),metal:mat.getMetallicFactor(),alpha:mat.getAlphaMode(),cutoff:mat.getAlphaCutoff(),double:mat.getDoubleSided(),emissiveStrength:mat.getExtension('KHR_materials_emissive_strength')?.getEmissiveStrength(),textures:[mat.getBaseColorTexture(),mat.getNormalTexture(),mat.getMetallicRoughnessTexture(),mat.getEmissiveTexture(),mat.getOcclusionTexture()].map(texture)}:null;
 function mesh(mesh){if(!mesh)return null;if(!meshCache.has(mesh))meshCache.set(mesh,mesh.listPrimitives().map(p=>({mode:p.getMode(),indices:indexFingerprint(p.getIndices(),p.getMode()),attributes:Object.fromEntries(p.listSemantics().sort().map(semantic=>[semantic,array(p.getAttribute(semantic))])),material:material(p.getMaterial())})));return meshCache.get(mesh);}
 return {
  nodes:nodes.map(node=>({name:node.getName(),translation:node.getTranslation(),rotation:node.getRotation(),scale:node.getScale(),children:node.listChildren().map(nodeId),mesh:mesh(node.getMesh())})),
  animations:root.listAnimations().map(clip=>({name:clip.getName(),channels:clip.listChannels().map(channel=>({node:nodeId(channel.getTargetNode()),path:channel.getTargetPath(),interpolation:channel.getSampler().getInterpolation(),input:array(channel.getSampler().getInput()),output:array(channel.getSampler().getOutput())}))}))
 };
}
const root=new URL('../../',import.meta.url);
const manifestURL=new URL('ra/celula/visualizador/modelo-original-v3/manifest.json',root);
const manifest=JSON.parse(fs.readFileSync(manifestURL));
const original=Buffer.concat(manifest.parts.map(part=>{const b=fs.readFileSync(new URL(part.file,manifestURL));assert.equal(b.length,part.bytes);return b;}));
assert.equal(sha(original),manifest.sha256);assert.equal(original.length,manifest.bytes);
const paths=[
 ['ra/celula/visualizador/celula-desktop-meshopt.glb',original],
 ...['pelicula','travessias'].map(name=>['ra/celula/membrana/assets/'+name+'-v1-meshopt.glb',fs.readFileSync(new URL('ra/celula/membrana/assets/'+name+'-v1.glb',root))])
];
const results=[];
for(const [path,input] of paths){
 const doc=await io.readBinary(input),before=fingerprint(doc);
 // No quantize(), simplify(), resample() or texture conversion: preserve the source values.
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const output=await io.writeBinary(doc),reread=await io.readBinary(output);
 assert.deepEqual(fingerprint(reread),before,'Geometry, materials or animation changed: '+path);
 fs.writeFileSync(new URL(path,root),output);
 const result={path,before:input.length,after:output.length,gzip:zlib.gzipSync(output,{level:9}).length,sha256:sha(output),sameGeometryAndAnimationData:true,nodes:before.nodes.length,animations:before.animations.map(c=>({name:c.name,channels:c.channels.length}))};
 results.push(result);console.log(JSON.stringify(result));
}
fs.writeFileSync(new URL('ra/otimizacao-modelos.json',root),JSON.stringify(results,null,2)+'\n');
// Refresh the integrity inventory, including new delivery assets, without modifying native USDZ files.
const file=new URL('ra/manifesto.json',root),inventory=JSON.parse(fs.readFileSync(file));
const entries=new Map(inventory.arquivos.map(f=>[f.path,f]));
for(const path of ['meshopt.js','vendor/meshopt_decoder.js','vendor/meshopt_decoder.module.js','vendor/meshoptimizer-LICENSE.md',...results.map(x=>x.path.slice(3))])entries.set(path,{path});
inventory.arquivos=[...entries.values()].map(f=>{let b=fs.readFileSync(new URL('ra/'+f.path,root));if(/\.(js|mjs|cjs|json|html|css|md|txt|py)$/.test(f.path))b=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));return {...f,sha256:sha(b)};});
inventory.atualizacao={data:'2026-11-02',escopo:'Compressão sem perdas na entrega GLB; carregamento sob demanda e pausa de prévias ocultas. USDZ originais preservados.'};
fs.writeFileSync(file,JSON.stringify(inventory,null,2)+'\n');
