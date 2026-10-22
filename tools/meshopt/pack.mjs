// Modelle verkleinern (Meshopt): npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer; Dateiliste used.txt (eine Datei je Zeile), Ausgabe nach packed/. Skin-Meshes: Position NICHT quantisieren (sonst kaputte Figuren). gltfpack taugt nicht (benennt Meshes um, resampelt Animationen).
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {reorder,quantize} from '@gltf-transform/functions';
import {EXTMeshoptCompression} from '@gltf-transform/extensions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'fs';import path from 'path';
await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const S='/tmp/claude-0/-home-user-epochenkrieg/69c8489a-2fbd-5d9c-8744-c05459ace21d/scratchpad';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const files=fs.readFileSync(S+'/used.txt','utf8').split('\n').filter(Boolean);
let a=0,b=0;
for(const f of files){
  const o=S+'/packed/'+f;fs.mkdirSync(path.dirname(o),{recursive:true});
  try{
    const doc=await io.read(f);
    const skinned=doc.getRoot().listSkins().length>0;
    const q={quantizePosition:16,quantizeTexcoord:14,quantizeNormal:10,quantizeColor:8,quantizeWeight:8,quantizeGeneric:12};
    await doc.transform(reorder({encoder:MeshoptEncoder}),quantize(skinned?{...q,pattern:/^(NORMAL|TANGENT|TEXCOORD_\d|COLOR_0|WEIGHTS_0)$/}:q));
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
    await io.write(o,doc);
  }catch(e){console.log('FAIL',f,e.message);continue}
  const s1=fs.statSync(f).size,s2=fs.statSync(o).size;a+=s1;b+=s2;
}
console.log('sum',a,b);
