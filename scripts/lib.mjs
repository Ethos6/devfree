import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = join(ROOT, 'data');

/** Loads every data/<category>.json file. */
export function loadCategories() {
  return readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(DATA_DIR, file), 'utf8');
      let json;
      try {
        json = JSON.parse(raw);
      } catch (err) {
        throw new Error(`${file}: invalid JSON (${err.message})`);
      }
      return { id: file.replace(/\.json$/, ''), file, raw, ...json };
    });
}

/** Flattens categories into one list of services with their category attached. */
export function allServices(categories = loadCategories()) {
  return categories.flatMap((c) => c.services.map((s) => ({ ...s, category: c.id, categoryTitle: c.category })));
}

export function daysSince(isoDate, now = new Date()) {
  return Math.floor((now - new Date(`${isoDate}T00:00:00Z`)) / 86_400_000);
}

export const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');
