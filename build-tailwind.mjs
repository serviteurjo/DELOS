// Génération du CSS Tailwind statique (remplace le CDN runtime)
// Usage: node build-tailwind.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import postcss from 'postcss';

const require = createRequire(import.meta.url);
const tailwind = require('tailwindcss');
const autoprefixer = require('autoprefixer');

const root = '/home/lokojosaphat/Images/Delos Org';
const inputPath = path.join(root, 'tailwind-input.css');
const configPath = path.join(root, 'tailwind.config.js');
const outputPath = path.join(root, 'assets', 'delos-tailwind.css');

const input = await fs.readFile(inputPath, 'utf8');
const config = require(configPath);

const processor = postcss([tailwind(config), autoprefixer()]);
const result = await processor.process(input, { from: inputPath });

// Minification simple (collapse whitespace dans les blocs)
let css = result.css;
const min = css.replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .trim();

await fs.writeFile(outputPath, min);
console.log('OK —', min.length, 'octets écrits dans', outputPath);