import { readFileSync, writeFileSync } from 'node:fs';
const src=readFileSync('index.html','utf8').replace('<head>','<head>\n  <meta name="robots" content="noindex,follow">');
for(const file of ['studio.html','klassisch.html'])writeFileSync(file,src);
console.log('Synced older entry URLs to the current experience.');
