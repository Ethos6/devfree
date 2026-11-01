#!/usr/bin/env node
// Checks that every url and pricing_url still responds.
//   node scripts/check-links.mjs [--report report.md]
// Exits with code 1 if any link is broken. Bot-protection responses (401/403/429)
// are reported as warnings, not failures, because many sites block automated requests.
import { writeFileSync } from 'node:fs';
import { allServices } from './lib.mjs';

const reportArg = process.argv.indexOf('--report');
const reportFile = reportArg > -1 ? process.argv[reportArg + 1] : undefined;
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 8;
const SOFT = new Set([401, 403, 405, 406, 429, 503]);

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': 'devfree-link-checker (+https://github.com/Ethos6/devfree)', Accept: 'text/html,*/*' },
      });
      if (res.ok) return { ok: true, status: res.status };
      if (method === 'GET') return { ok: false, soft: SOFT.has(res.status), status: res.status };
    } catch (err) {
      if (method === 'GET') return { ok: false, soft: false, status: err.name === 'AbortError' ? 'timeout' : err.message };
    } finally {
      clearTimeout(timer);
    }
  }
}

const jobs = allServices().flatMap((s) => [
  { s, field: 'url', url: s.url },
  { s, field: 'pricing_url', url: s.pricing_url },
]);
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      results.push({ ...job, ...(await probe(job.url)) });
    }
  }),
);

const broken = results.filter((r) => !r.ok && !r.soft);
const blocked = results.filter((r) => !r.ok && r.soft);
const line = (r) => `- **${r.s.name}** (\`${r.s.id}\`, ${r.field}): ${r.url} → ${r.status}`;
const report = [
  `Checked ${results.length} links for ${results.length / 2} services.`,
  '',
  `### Broken (${broken.length})`,
  ...(broken.length ? broken.map(line) : ['None 🎉']),
  '',
  `### Blocked automated check, verify by hand (${blocked.length})`,
  ...(blocked.length ? blocked.map(line) : ['None']),
].join('\n');

console.log(report);
if (reportFile) writeFileSync(reportFile, `${report}\n`);
process.exit(broken.length ? 1 : 0);
