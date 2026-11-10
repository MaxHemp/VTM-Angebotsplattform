import { build } from 'esbuild';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
const result=await build({
  entryPoints:{experience:'scripts/experience.mjs'}, outdir:'assets',
  chunkNames:'generated/[name]-[hash]', bundle:true, splitting:true,
  format:'esm', target:'es2020', minify:true, legalComments:'linked', metafile:true
});
const generated=path.resolve('assets/generated');
const keep=new Set(Object.keys(result.metafile.outputs).map(p=>path.resolve(p)));
for(const file of await readdir(generated)){
  const target=path.resolve(generated,file);
  if(path.dirname(target)===generated && /^spatial-[A-Z0-9]+\.js(?:\.LEGAL\.txt)?$/.test(file) && !keep.has(target))await unlink(target);
}
console.log('Built local experience and lazy-loaded 3D scene (Three.js 0.187.0).');
