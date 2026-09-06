// Vérifie que toutes les classes utilisées (HTML + template literals JS)
// sont bien présentes dans le CSS Tailwind statique.
import fs from 'node:fs/promises';
import fsSync from 'node:fs';

const root = '/home/lokojosaphat/Images/Delos Org';
const files = ['index.html', 'admin.html', 'admin/index.html', 'delos-data.js'];
const css = await fs.readFile(root + '/assets/delos-tailwind.css', 'utf8');

// Classes déjà définies dans les <style> internes (custom CSS) => OK par définition.
const custom = new Set();
for (const f of files) {
  const src = await fs.readFile(root + '/' + f, 'utf8');
  const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  for (const st of styles) {
    const selRe = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g;
    let m;
    while ((m = selRe.exec(st)) !== null) custom.add(m[1]);
  }
}

// Collecte des classes utilisées (attributs class="...")
const used = new Set();
for (const f of files) {
  const src = await fs.readFile(root + '/' + f, 'utf8');
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    for (const c of m[1].split(/\s+/)) if (c && !c.startsWith('${')) used.add(c);
  }
}

// Échappe un nom de classe tel qu'il apparaît dans le CSS (sélecteur).
function cssEscape(name) {
  return name.replace(/%/g, '\\%').replace(/\./g, '\\.').replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]').replace(/:/g, '\\:').replace(/\//g, '\\/')
    .replace(/#/g, '\\#').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    .replace(/,/g, '\\,').replace(/\s/g, '_');
}

const missing = [];
for (const t of used) {
  const sel = cssEscape(t);
  if (!css.includes('.' + sel) && !css.includes('\\' + sel)) missing.push(t);
}
console.log('Classes utilisées:', used.size);
console.log('Classes custom (déjà dans <style>):', custom.size);
const realMissing = missing.filter(m => !custom.has(m));
console.log('MANQUANTES réelles:', realMissing.length);
for (const m of realMissing) console.log('  -', m);