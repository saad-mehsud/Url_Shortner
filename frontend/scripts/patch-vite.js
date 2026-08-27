import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteChunkDir = path.resolve(__dirname, '../node_modules/vite/dist/node/chunks');

if (fs.existsSync(viteChunkDir)) {
  const files = fs.readdirSync(viteChunkDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(viteChunkDir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('function cleanUrl(') && !content.includes('(?<!C)#')) {
        content = content.replace(
          /function cleanUrl\(url\) \{[\s\S]*?return url\.replace\(postfixRE, ""\);[\s\S]*?\}/,
          `function cleanUrl(url) {
  const q = url.indexOf("?");
  if (q !== -1) url = url.slice(0, q);
  return url.replace(/(?<!C)#.*$/, "");
}`
        );
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[patch-vite] Patched ${file} for C# directory paths.`);
      }
    }
  }
}
