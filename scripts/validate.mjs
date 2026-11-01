#!/usr/bin/env node
// Validates every entry in data/*.json. Exits with code 1 on any problem.
import { loadCategories } from './lib.mjs';

const ALLOWED_KEYS = new Set([
  'id', 'name', 'url', 'pricing_url', 'description', 'free_tier', 'credit_card_required',
  'notes', 'tags', 'open_source', 'checked',
]);
const errors = [];
const seen = new Map();
const today = new Date().toISOString().slice(0, 10);

const isHttps = (u) => {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
};

for (const cat of loadCategories()) {
  const where = (s, msg) => errors.push(`${cat.file}${s ? ` > ${s.id ?? s.name ?? '?'}` : ''}: ${msg}`);
  if (typeof cat.category !== 'string' || !cat.category) where(null, 'missing "category" title');
  if (typeof cat.description !== 'string' || !cat.description) where(null, 'missing "description"');
  if (!Array.isArray(cat.services) || cat.services.length === 0) {
    where(null, '"services" must be a non-empty array');
    continue;
  }

  // Keep files sorted by name so diffs stay small.
  const names = cat.services.map((s) => String(s.name).toLowerCase());
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  if (names.join('\n') !== sorted.join('\n')) where(null, 'services must be sorted by name (run `npm run format`)');

  // Formatting: 2-space indent and trailing newline.
  if (cat.raw !== `${JSON.stringify(JSON.parse(cat.raw), null, 2)}\n`) where(null, 'not formatted (run `npm run format`)');

  for (const s of cat.services) {
    for (const key of Object.keys(s)) if (!ALLOWED_KEYS.has(key)) where(s, `unknown field "${key}"`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? '')) where(s, '"id" must be lowercase-kebab-case');
    if (seen.has(s.id)) where(s, `duplicate id (also in ${seen.get(s.id)})`);
    seen.set(s.id, cat.file);
    if (!s.name || s.name.length > 60) where(s, '"name" is required (max 60 chars)');
    if (!isHttps(s.url)) where(s, '"url" must be an https URL');
    if (!isHttps(s.pricing_url)) where(s, '"pricing_url" must be an https URL to the page that states the free tier');
    if (!s.description || s.description.length > 160) where(s, '"description" is required (max 160 chars)');
    if (!Array.isArray(s.free_tier) || s.free_tier.length === 0) where(s, '"free_tier" must list at least one limit');
    else
      s.free_tier.forEach((l, i) => {
        if (typeof l !== 'string' || !l.trim() || l.length > 140) where(s, `free_tier[${i}] must be a string up to 140 chars`);
      });
    if ('credit_card_required' in s && typeof s.credit_card_required !== 'boolean') where(s, '"credit_card_required" must be true or false (omit if unknown)');
    if ('open_source' in s && typeof s.open_source !== 'boolean') where(s, '"open_source" must be a boolean');
    if ('notes' in s && (typeof s.notes !== 'string' || s.notes.length > 200)) where(s, '"notes" must be a string up to 200 chars');
    if ('tags' in s && (!Array.isArray(s.tags) || s.tags.some((t) => !/^[a-z0-9-]+$/.test(t)))) where(s, '"tags" must be lowercase-kebab-case strings');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked ?? '') || Number.isNaN(Date.parse(s.checked))) where(s, '"checked" must be a YYYY-MM-DD date');
    else if (s.checked > today) where(s, '"checked" cannot be in the future');
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s) found:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`✔ ${seen.size} services are valid`);
