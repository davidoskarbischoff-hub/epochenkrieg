import * as esbuild from 'esbuild';import path from 'path';
await esbuild.build({entryPoints:['entry.js'],bundle:true,minify:true,format:'iife',outfile:'gltf-bundle.js',
 plugins:[{name:'three-global',setup(b){b.onResolve({filter:/^three$/},()=>({path:path.resolve('three-shim.js')}))}}]});
