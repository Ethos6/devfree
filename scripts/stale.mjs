#!/usr/bin/env node
// Lists entries whose free tier hasn't been re-checked recently.
//   node scripts/stale.mjs [--days 180] [--report report.md]
import { writeFileSync } from 'node:fs';
import { allServices, daysSince } from './lib.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const maxDays = Number(arg('--days', 180));
const reportFile = arg('--report');

const stale = allServices()
  .map((s) => ({ ...s, age: daysSince(s.checked) }))
  .filter((s) => s.age > maxDays)
  .sort((a, b) => b.age - a.age);

const report = [
  `${stale.length} entr${stale.length === 1 ? 'y has' : 'ies have'} not been checked for more than ${maxDays} days.`,
  '',
  'To re-check one: open its pricing page, update `free_tier` if anything changed, set `checked` to today, and open a pull request.',
  '',
  ...stale.map((s) => `- [ ] **${s.name}** (\`data/${s.category}.json\`), last checked ${s.checked} (${s.age} days ago): ${s.pricing_url}`),
].join('\n');

console.log(report);
if (reportFile) writeFileSync(reportFile, `${report}\n`);
