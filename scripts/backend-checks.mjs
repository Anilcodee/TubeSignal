// No paid calls or .env loading. Uses the repository's installed TypeScript, not a test dependency.
// Run: node scripts/backend-checks.mjs [--typecheck]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Module, { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.includes('--typecheck')) {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const files = ['src/app/api', 'src/services', 'src/types', 'src/utils'].flatMap((dir) => ts.sys.readDirectory(path.join(root, dir), ['.ts']));
  const program = ts.createProgram(files, { ...parsed.options, incremental: false, noEmit: true });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (name) => name, getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
  else console.log('Backend typecheck passed.');
  process.exit(diagnostics.length ? 1 : 0);
}

// Local TS loader; aliases resolve only against this checkout. No emitted build artifacts.
const require = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, ...args);
};
Module._extensions['.ts'] = function (module, filename) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, resolveJsonModule: true },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};

// Override inherited credentials before importing services; never inspect private env files.
delete process.env.SERPAPI_API_KEY;
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;
let fetchCount = 0;
let upstream = () => { throw new Error('Unexpected network request: all tests must mock fetch'); };
globalThis.fetch = async (...args) => { fetchCount++; return upstream(...args); };

const { normalizeChannelInput } = require('../src/utils/channel-input.ts');
const { parsePublishingDate } = require('../src/utils/publishing-date.ts');
const { parseCount, parseDurationToSeconds } = require('../src/utils/format.ts');
const { DataTransformerService: transform } = require('../src/services/data-transformer.ts');
const { cacheService, CacheService } = require('../src/services/cache.ts');
const { PaidRequestGuard } = require('../src/services/request-guard.ts');
const { SerpApiService } = require('../src/services/serpapi.ts');
const { AIAnalyzerService, validateAIAnalysis } = require('../src/services/ai-analyzer.ts');
const { buildSampleAnalysis, resolveSampleName } = require('../src/services/sample-analysis.ts');
const { calculateVelocity } = require('../src/utils/math-analytics.ts');
const { summarizeHooks } = require('../src/utils/hook-summary.ts');
const analyze = require('../src/app/api/analyze/route.ts').POST;
const search = require('../src/app/api/search/route.ts').POST;
const ID = 'UCBcRF18a7Qf58cCRy5xuWwQ';
const request = (body) => new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify(body) });
const send = async (handler, body) => {
  const response = await handler(request(body));
  return { status: response.status, data: await response.json() };
};
const sourceVideo = { video_id: 'abcdefghijk', title: 'Observed video 1?', views: '1.2K views', published_date: '2 weeks ago', length: '2:00' };
const channelPayload = { channel_results: { title: 'Actual channel', external_id: ID, handle: '@actual.handle', subscribers: 1200 }, videos_results: [sourceVideo] };
const video = (publishedDate, extra = {}) => ({ videoId: publishedDate, title: 'Observed title', views: 100, viewsFormatted: '100', publishedDate, length: '2:00', lengthSeconds: 120, thumbnail: '', url: '', ...extra });

await test('identifiers preserve UC case, distinguish names/handles, and reject unsafe URLs', () => {
  assert.equal(normalizeChannelInput(ID), ID);
  assert.equal(normalizeChannelInput(`https://www.youtube.com/channel/${ID}/videos?view=0`), ID);
  assert.equal(normalizeChannelInput('youtube.com/@Some.Creator/videos'), '@Some.Creator');
  assert.equal(normalizeChannelInput('@Some.Creator'), '@Some.Creator');
  for (const value of ['Marques Brownlee', 'mkbhd', '../mkbhd', 'https://evil.test/@mkbhd', 'https://youtube.com.evil.test/@mkbhd', 'https://youtube.com/watch?v=abcdefghijk', 'https://youtube.com/@mkbhd/../@fireship', 'https://youtube.com/%2e%2e/@mkbhd', 'https://youtube.com/@mkbhd%2f..', 'https://youtube.com@evil.test/@mkbhd', '@../mkbhd', '@', 'https://youtube.com/c/legacy']) {
    assert.equal(normalizeChannelInput(value), null, value);
  }
});

await test('sample allowlist rejects traversal, inherited keys, and substring impersonation', () => {
  assert.equal(resolveSampleName(ID), 'mkbhd');
  assert.equal(resolveSampleName('@Fireship'), 'fireship');
  for (const value of ['../mkbhd', '../../package', '%2e%2e/mkbhd', '__proto__', 'notmkbhd', 'fireship-copy', 'Marques Brownlee']) assert.equal(resolveSampleName(value), null);
});

await test('all sample counts, totals, duration medians, charts and provenance come from fixture videos', () => {
  for (const name of ['mkbhd', 'fireship', 'veritasium']) {
    const fixture = require(`../public/demo/${name}.json`);
    const report = buildSampleAnalysis(name);
    assert.equal(report.channel.totalVideosAnalyzed, fixture.videos.length);
    assert.equal(report.analytics.totalViews, fixture.videos.reduce((sum, item) => sum + item.views, 0));
    assert.equal(report.analytics.avgViews, Math.round(report.analytics.totalViews / fixture.videos.length));
    assert.notEqual(report.analytics.medianVideoLength, 'Unavailable');
    assert.equal(report.analytics.viewsGrowthTrend, 'unknown');
    assert.equal(report.meta.dataSource, 'sample');
    assert.equal(report.meta.analysisSource, 'computed');
    assert.match(report.meta.notice, /Illustrative sample/);
    assert.equal(report.chartData.publishingTimeline.datasets[0].data.reduce((sum, count) => sum + count, 0), fixture.videos.length);
    assert.ok(Array.isArray(report.aiAnalysis.contentThemes) && report.aiAnalysis.contentThemes.length > 0);
    assert.deepEqual(report.aiAnalysis.performanceInsights.viralFactors, []);
    assert.deepEqual(report.aiAnalysis.publishingStrategy.peakDays, []);
    assert.ok(report.videos.every((item) => item.relativeDate === undefined));
    assert.ok(fixture.channel.totalVideosAnalyzed > report.channel.totalVideosAnalyzed, 'fixture must not be mutated');
  }
});

await test('unknown samples and missing live credentials never fall through or masquerade as MKBHD', async () => {
  const start = fetchCount;
  for (const channelId of ['../../package', 'unknown', '__proto__', 'mkbhd-copy']) {
    assert.equal((await send(analyze, { channelId, isDemo: true })).status, 404);
  }
  const missing = await send(analyze, { channelId: '@unknown' });
  assert.equal(missing.status, 503);
  assert.match(missing.data.error, /sample report/);
  assert.equal(missing.data.channel, undefined);
  assert.equal((await send(analyze, { channelId: '@mkbhd', isDemo: 'true' })).status, 400);
  assert.equal((await send(analyze, { channelId: 'mkbhd', isDemo: true })).status, 200);
  assert.equal(fetchCount, start);
});

await test('invalid request bodies and oversized inputs fail safely', async () => {
  for (const handler of [analyze, search]) {
    assert.equal((await handler(new Request('http://localhost', { method: 'POST', body: '{' }))).status, 400);
    assert.equal((await send(handler, null)).status, 400);
    assert.equal((await send(handler, { query: 'x'.repeat(5000) })).status, 413);
  }
  assert.equal((await send(search, { query: '   ' })).status, 400);
});

await test('direct search identifiers bypass discovery, names do not become fake channels', async () => {
  const start = fetchCount;
  for (const identifier of [ID, '@real.handle', `https://youtube.com/channel/${ID}`]) {
    const response = await send(search, { query: identifier });
    assert.equal(response.status, 200);
    assert.equal(response.data.channels[0].channelId, normalizeChannelInput(identifier));
    assert.equal(response.data.channels[0].subscribers, 'Unavailable');
    assert.equal(response.data.channels[0].avatar, '');
  }
  const missing = await send(search, { query: 'unconfigured creator name' });
  assert.equal(missing.status, 503);
  assert.deepEqual(missing.data.channels, []);
  assert.equal((await send(search, { query: 'https://evil.test/@mkbhd' })).status, 400);
  assert.equal(fetchCount, start);
});

await test('numeric parsing and absent metadata never invent subscribers, durations, or views', () => {
  for (const value of [undefined, 'hidden', 'NaNK', '2 bananas', -1, Infinity]) assert.equal(parseCount(value), null);
  assert.equal(parseCount('1.2M subscribers'), 1200000);
  for (const value of ['live', '1:99', '-1:00', undefined]) assert.equal(parseDurationToSeconds(value), 0);
  const videos = transform.normalizeVideos([{ video_id: 'abcdefghijk', title: 'No metrics' }]);
  assert.equal(videos[0].viewsFormatted, 'Unavailable');
  assert.equal(videos[0].length, 'Unavailable');
  assert.equal(videos[0].publishedDate, 'Unavailable');
  assert.equal(transform.calculateAnalytics(videos).avgViewsFormatted, 'Unavailable');
  assert.equal(transform.toLengthVsViews(videos).datasets[0].data.length, 0);
  assert.equal(transform.toViewsDistribution(videos).datasets[0].data.length, 0);
  const profile = transform.normalizeChannel(ID, { channel_results: { title: 'No audience' } }, 1);
  assert.equal(profile.subscribers, 'Unavailable');
  assert.equal(profile.subscriberCount, undefined);
  assert.equal(profile.handle, '');
});

await test('publishing metrics use parsed dates; relative dates are approximate, not weekday evidence', () => {
  const now = Date.parse('2026-06-30T12:00:00Z');
  for (const value of ['Recently', 'Unavailable', '2026-02-30', '99', '25 months from now']) assert.equal(parsePublishingDate(value, now), null);
  assert.equal(parsePublishingDate('Jun 10, 2026', now).approximate, false);
  const precise = [video('2026-06-01'), video('2026-06-08'), video('2026-06-15')];
  assert.match(transform.calculateAnalytics(precise, now).publishingFrequency, /^1\.0 videos\/week/);
  assert.match(transform.calculateAnalytics(precise, now).mostActiveDay, /Monday/);
  const relative = [video('1 week ago'), video('2 weeks ago'), video('1 month ago')];
  assert.match(transform.calculateAnalytics(relative, now).publishingFrequency, /approximate/);
  assert.equal(transform.calculateAnalytics(relative, now).mostActiveDay, 'Unavailable');
  assert.match(transform.toPublishingTimeline(relative, now).datasets[0].label, /approximate/);
  assert.deepEqual(transform.toPublishingTimeline([video('Recently')], now).labels, []);
  assert.equal(transform.calculateAnalytics([video('Recently')]).publishingFrequency, 'Unavailable');
});

await test('velocity analytics exclude unknown dates and label approximate dates', () => {
  const now = Date.parse('2026-06-30T00:00:00Z');
  assert.equal(calculateVelocity(video('Unavailable'), now).available, false);
  assert.equal(calculateVelocity(video('Unavailable'), now).formatted, 'Unavailable');
  const exact = calculateVelocity(video('2026-06-20', { views: 1000 }), now);
  assert.equal(exact.available, true);
  assert.equal(exact.isApproximate, false);
  assert.equal(exact.viewsPerDay, 100);
  const approximate = calculateVelocity(video('1 week ago', { views: 700 }), now);
  assert.equal(approximate.isApproximate, true);
  assert.equal(approximate.viewsPerDay, 100);
  const analytics = transform.calculateAnalytics([video('2026-06-20', { views: 1000 }), video('Unavailable', { views: 99999 })], now);
  assert.equal(analytics.velocitySampleSize, 1);
  assert.equal(analytics.medianViewsPerDay, 100);
});

await test('hook summaries aggregate available analyses without fabricating empty results', () => {
  assert.equal(summarizeHooks([]), null);
  const sample = { wordCount: 10, hookArchetype: 'Curiosity Question', wordsPerMinute: 120, hookDurationSeconds: 30, questionCount: 1, audienceAddresses: 2 };
  const summary = summarizeHooks([sample, { ...sample, wordsPerMinute: 160, questionCount: 0 }]);
  assert.equal(summary.sampledVideoCount, 2);
  assert.equal(summary.averageWordsPerMinute, 140);
  assert.equal(summary.questionRate, 50);
  assert.equal(summary.directAddressRate, 100);
});

await test('AI validation rejects malformed nested fields and fabricated observed metrics', () => {
  const baseline = buildSampleAnalysis('mkbhd').aiAnalysis;
  assert.ok(validateAIAnalysis(structuredClone(baseline), baseline));
  const edits = [
    (value) => { value.summary = {}; },
    (value) => { value.recommendations = ['ok', {}]; },
    (value) => { value.titlePatterns.avgLength = NaN; },
    (value) => { value.titlePatterns.emotionalTriggers = [1]; },
    (value) => { value.publishingStrategy.peakDays = ['Tuesday']; },
    (value) => { value.performanceInsights.viralFactors = ['Made-up cause']; },
    (value) => { value.contentThemes = [{ theme: 'Made up', percentage: 120, videoCount: -1 }]; },
    (value) => { value.summary = 'Guaranteed CTR growth of 99999999%'; },
  ];
  for (const edit of edits) { const malformed = structuredClone(baseline); edit(malformed); assert.equal(validateAIAnalysis(malformed, baseline), null); }
  assert.equal(validateAIAnalysis(null, baseline), null);
});

await test('cache is size- and TTL-bounded; quota handles concurrency and rate limits', () => {
  const cache = new CacheService(2, 1000);
  cache.set('a', 1); cache.set('b', 2); assert.equal(cache.get('a'), 1); cache.set('c', 3);
  assert.equal(cache.get('b'), null);
  cache.set('expired', 4, -1); assert.equal(cache.get('expired'), null);
  const guard = new PaidRequestGuard(2, 3, 1);
  const release = guard.acquire(3600000);
  assert.throws(() => guard.acquire(3600000), /limit reached/);
  release(); release();
  guard.acquire(3600000)();
  assert.throws(() => guard.acquire(3600000), /limit reached/);
  guard.acquire(3660000)();
  assert.throws(() => guard.acquire(3720000), /limit reached/);
  guard.acquire(7200000)();
});

await test('live channel pipeline uses current SerpApi schema, preserves IDs, and reports computed fallback', async () => {
  process.env.SERPAPI_API_KEY = 'fake-test-key';
  cacheService.clear();
  upstream = async (url, options) => {
    assert.equal(new URL(url).searchParams.get('channel_id'), ID);
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(channelPayload);
  };
  const live = await send(analyze, { channelId: ID });
  assert.equal(live.status, 200);
  assert.equal(live.data.channel.name, 'Actual channel');
  assert.equal(live.data.channel.channelId, ID);
  assert.equal(live.data.channel.handle, '@actual.handle');
  assert.equal(live.data.meta.dataSource, 'live');
  assert.equal(live.data.meta.analysisSource, 'computed');
  assert.equal(live.data.analytics.totalViews, 1200);
  assert.equal(live.data.analytics.viewsGrowthTrend, 'unknown');
});

await test('real discovery extracts IDs/handles from provider links instead of inventing from titles', async () => {
  cacheService.clear();
  upstream = async (url) => {
    assert.equal(new URL(url).searchParams.get('sp'), 'EgIQAg%3D%3D');
    return Response.json({ channel_results: [
      { title: 'Name Is Not The Handle', link: 'https://www.youtube.com/@Actual.Creator', subscribers: 1500 },
      { title: 'ID result', link: `https://www.youtube.com/channel/${ID}` },
      { title: 'Unresolvable name only' },
      { title: 'Unsafe URL', link: 'https://evil.test/@bad' },
    ] });
  };
  const response = await send(search, { query: 'creator discovery' });
  assert.equal(response.status, 200);
  assert.equal(response.data.channels.length, 2);
  assert.equal(response.data.channels[0].channelId, '@Actual.Creator');
  assert.equal(response.data.channels[0].handle, '@Actual.Creator');
  assert.equal(response.data.channels[0].subscribers, '1.5K');
  assert.equal(response.data.channels[1].channelId, ID);
  assert.equal(response.data.channels[1].handle, '');
});

await test('empty discovery and provider failures are friendly, contain no private payload, and do not fake results', async () => {
  cacheService.clear();
  upstream = async () => Response.json({ error: "YouTube hasn't returned any results for this query." });
  assert.deepEqual((await send(search, { query: 'no matches here' })).data.channels, []);
  upstream = async () => new Response('private api_key=fake-test-key payload', { status: 500 });
  const failed = await send(search, { query: 'failing upstream' });
  assert.equal(failed.status, 502);
  assert.deepEqual(failed.data.channels, []);
  assert.doesNotMatch(failed.data.error, /private|fake-test-key|api_key/);
  const failedAnalysis = await send(analyze, { channelId: '@failing-upstream' });
  assert.equal(failedAnalysis.status, 502);
  assert.equal(failedAnalysis.data.channel, undefined);
  upstream = async () => { throw new DOMException('private URL', 'TimeoutError'); };
  assert.equal((await send(search, { query: 'slow upstream' })).status, 504);
});

await test('identical concurrent paid fetches coalesce and subsequent calls hit the cache', async () => {
  cacheService.clear();
  const service = new SerpApiService();
  const start = fetchCount;
  upstream = async () => { await new Promise((resolve) => setTimeout(resolve, 10)); return Response.json(channelPayload); };
  await Promise.all([service.getChannelData(ID), service.getChannelData(ID)]);
  await service.getChannelData(ID);
  assert.equal(fetchCount - start, 1);
});

await test('Gemini model override, validated response, invalid-output fallback, and content-based caching', async () => {
  cacheService.clear();
  process.env.GEMINI_API_KEY = 'fake-ai-key';
  process.env.GEMINI_MODEL = 'test-model-override';
  const service = new AIAnalyzerService();
  const { channel, videos } = buildSampleAnalysis('fireship');
  const baseline = service.generateFallbackAnalysis(channel, videos);
  upstream = async (url) => {
    assert.match(String(url), /test-model-override/);
    return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(baseline) }] }, finishReason: 'STOP' }] });
  };
  const valid = await service.analyzeChannel(channel, videos);
  assert.equal(valid.source, 'gemini');
  const start = fetchCount;
  await service.analyzeChannel(channel, videos);
  assert.equal(fetchCount, start);
  upstream = async () => Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify({ summary: 'invalid' }) }] }, finishReason: 'STOP' }] });
  const changedVideos = videos.map((item, index) => index ? item : { ...item, views: item.views + 100 });
  const invalid = await service.analyzeChannel(channel, changedVideos);
  assert.equal(fetchCount, start + 1, 'equal video counts with changed observations must not reuse AI cache');
  assert.equal(invalid.source, 'computed');
  assert.ok(Array.isArray(invalid.analysis.contentThemes) && invalid.analysis.contentThemes.length > 0);
});
