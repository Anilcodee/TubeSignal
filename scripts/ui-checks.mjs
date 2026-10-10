import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const dashboard = read('src/components/dashboard/AnalysisDashboard.tsx');
const transcript = read('src/components/dashboard/TranscriptLab.tsx');
const videos = read('src/components/dashboard/VideoTable.tsx');
const compare = read('src/app/compare/page.tsx');
const hookComparison = read('src/components/dashboard/HookComparison.tsx');

test('report tabs are shareable through the URL', () => {
  assert.match(dashboard, /searchParams\.get\('tab'\)/);
  assert.match(dashboard, /params\.set\('tab', targetTab\)/);
});

test('dense report surfaces use progressive disclosure and focused evidence controls', () => {
  assert.match(transcript, /className=\{styles\.transcriptDetails\}/);
  assert.match(videos, /filterMode/);
  assert.match(videos, /mobileVideoList/);
  assert.match(videos, /searchQuery/);
});

test('comparison exposes relative performance signals', () => {
  assert.match(compare, /comparisonRail/);
  assert.match(compare, /Upload cadence \/ week/);
  assert.match(compare, /Average video length/);
  assert.match(compare, /Content focus/);
  assert.match(compare, /HookComparison/);
  assert.match(hookComparison, /Opening style/);
});

console.log('UI contract checks passed.');
