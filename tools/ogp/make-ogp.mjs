// SNS共有用の OGP 画像（1200×630）を public/ogp.png に作る。
//   npm run ogp
// 1. ゲームを縦長の画面で開き、時計を止めて1コマずつ進めながら、目薬が黒目に入って
//    「PERFECT! +10」が出た瞬間を撮る（時計と乱数を固定しているので毎回同じ絵になる）
// 2. 1200×630 の台紙に、撮った画面・タイトル・遊び方・URL・大きな目薬を並べて撮る
// ファイルはサーバーを立てずに、ブラウザの通信を横取りしてこのフォルダから返す（public/ はルートのパスで返す）
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outFile = path.join(root, 'public/ogp.png');
const URL_TEXT = 'game.chozo.net/megusuri';
const ORIGIN = 'http://megusuri.local';
const PERFECTS = 3; // 撮るまでに PERFECT を何回出すか（回数が増えるほど目の充血がとれていく）

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 693 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.route(`${ORIGIN}/**`, (route) => {
  const p = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/$/, '/index.html');
  const file = [path.join(root, p), path.join(root, 'public', p)].find((f) => f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile());
  return file ? route.fulfill({ path: file }) : route.fulfill({ status: 404 });
});
await page.addInitScript(() => {
  let seed = 20261017;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
});
await page.clock.install({ time: 0 });
await page.goto(`${ORIGIN}/`);
await page.click('#startButton');
await page.clock.runFor(3600); // カウントダウン

// 目薬が目の真上に来たら一滴落とす。PERFECT になるまで繰り返す
const game = () => page.evaluate(() => ({ mode: s.mode, bx: s.bx, score: s.score, msg: s.message && s.message.text, drops: s.drops.length }));
let perfects = 0;
for (let frame = 0; frame < 3000 && perfects < PERFECTS; frame++) {
  const st = await game();
  if (st.mode !== 'play') throw new Error('撮影前にゲームが終わりました');
  if (st.drops === 0 && Math.abs(st.bx - 0.5) < 0.012) {
    await page.evaluate(() => shoot());
    // 着弾（0.85秒後）の少し後まで進めて結果を見る
    for (let t = 0; t < 880; t += 16) await page.clock.runFor(16);
    const after = await game();
    if (after.msg && after.msg.startsWith('PERFECT')) perfects++;
    if (perfects === PERFECTS) break;
    for (let t = 0; t < 400; t += 16) await page.clock.runFor(16);
  } else {
    await page.clock.runFor(16);
  }
}
for (let t = 0; t < 48; t += 16) await page.clock.runFor(16); // キラキラが少し広がるのを待つ（文字が薄くなる前に撮る）
console.log('撮った場面:', JSON.stringify(await game()));
const shot = await page.locator('.game-shell').screenshot({ type: 'png' });

// 2. 台紙に並べて撮る
const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const img = `data:image/png;base64,${shot.toString('base64')}`;
await card.setContent(`<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; }
  #ogp { position: relative; width: 1200px; height: 630px; overflow: hidden; color: #17344b;
    font-family: "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif; font-weight: 800;
    background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, .7), transparent 55%), linear-gradient(#73d8e9, #d4f5c0); }
  .shot { position: absolute; left: 820px; top: 26px; width: 330px; border-radius: 26px;
    transform: rotate(4deg); transform-origin: 50% 0;
    box-shadow: 0 0 0 7px #fff, 0 0 0 11px #17344b, 0 22px 44px rgba(23, 52, 75, .35); }
  .text { position: absolute; left: 70px; top: 0; bottom: 0; width: 720px;
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
  .logo { font-size: 124px; line-height: 1.1; letter-spacing: .02em; white-space: nowrap; color: #17344b;
    text-shadow: 6px 6px 0 #fff; }
  .lead { margin-top: 28px; font-size: 40px; line-height: 1.45; }
  .lead em { font-style: normal; color: #f04e48; }
  .url { margin-top: 30px; padding: 12px 32px; border-radius: 999px; color: #fff; font-size: 34px;
    background: #f05a50; box-shadow: 0 6px 0 #b8322b; }
  .bottle { position: absolute; left: 668px; top: 36px; width: 120px; transform: rotate(16deg); }
</style>
<div id="ogp">
  <img class="shot" src="${img}">
  <svg class="bottle" viewBox="0 0 100 150" aria-hidden="true">
    <rect x="12" y="6" width="76" height="80" rx="16" fill="#fff" stroke="#17344b" stroke-width="6"/>
    <rect x="24" y="20" width="52" height="44" rx="6" fill="#4cc1df"/>
    <text x="50" y="49" font-size="13" text-anchor="middle" fill="#17344b" font-weight="800">めぐすり</text>
    <path d="M30 86h40l-10 34H40z" fill="#eaf8fd" stroke="#17344b" stroke-width="6" stroke-linejoin="round"/>
    <path d="M50 128c7 9 7 14 0 14s-7-5 0-14z" fill="#249ee2"/>
  </svg>
  <div class="text">
    <div class="logo">目薬ゲーム</div>
    <div class="lead">まばたきを読んで、目のまん中へ。<br><em>一滴</em>で充血を治そう！</div>
    <div class="url">${URL_TEXT}</div>
  </div>
</div>`);
await card.waitForFunction(() => [...document.images].every((i) => i.complete));
await card.evaluate(() => document.fonts.ready);
await card.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1200, height: 630 } });

await browser.close();
console.log('OGP画像:', outFile);
