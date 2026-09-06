const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'main', 'java');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith('.java')) check(full);
  }
}

function check(file) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^[\s\S]*?package\s+([\w\.]+)\s*;/m);
  if (!m) {
    console.log(`MISSING PACKAGE -> ${rel}`);
    return;
  }
  const declared = m[1];
  const expectedDir = declared.replace(/\./g, '/');
  const actualDir = path.posix.dirname(rel);
  if (actualDir !== expectedDir) {
    console.log(`MISMATCH -> ${rel}`);
    console.log(`  declared package: ${declared}`);
    console.log(`  expected path: ${expectedDir}`);
    console.log(`  actual path:   ${actualDir}`);
  }
}

walk(root);
console.log('done');
