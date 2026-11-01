#!/usr/bin/env node
// Sorts services by name and rewrites every data file with consistent formatting.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, loadCategories } from './lib.mjs';

const ORDER = ['id', 'name', 'url', 'pricing_url', 'description', 'free_tier', 'credit_card_required', 'notes', 'tags', 'open_source', 'checked'];

for (const cat of loadCategories()) {
  const services = [...cat.services]
    .sort((a, b) => String(a.name).toLowerCase().localeCompare(String(b.name).toLowerCase()))
    .map((s) => Object.fromEntries([...ORDER.filter((k) => k in s), ...Object.keys(s).filter((k) => !ORDER.includes(k))].map((k) => [k, s[k]])));
  const out = `${JSON.stringify({ category: cat.category, description: cat.description, services }, null, 2)}\n`;
  if (out !== cat.raw) {
    writeFileSync(join(DATA_DIR, cat.file), out);
    console.log(`formatted ${cat.file}`);
  }
}
