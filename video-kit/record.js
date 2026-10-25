// 장면 대본(scenes.json) + 실험실별 동작(actions.js)으로 화면을 녹화한다.
// 사용: node record.js <작업폴더> [shot]   — shot: 썸네일·제목 카드용 실험실 캡처만 찍기
// 결과: <작업폴더>/raw/*.webm, timeline.json(장면 시작 시각), shot.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const W = path.resolve(process.argv[2]); const SHOT_ONLY = process.argv[3] === 'shot';
const S = JSON.parse(fs.readFileSync(W + '/scenes.json'));
const DUR = fs.existsSync(W + '/voice/dur.json') ? JSON.parse(fs.readFileSync(W + '/voice/dur.json')) : {};
const OVERLAY = fs.readFileSync(__dirname + '/overlay.js', 'utf8');
const actions = require(W + '/actions.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const VOICE_LEAD = 0.35; // 장면 시작 후 음성이 나오기까지(초)

// 자막 조각: 문장(. ? !) 단위, 긴 문장은 쉼표에서 한 번 더 나눔. 길이는 글자 수 비례
function chunks(text, dur) {
  const parts = []; text.split(/(?<=[.?!])\s+/).forEach(p => { p = p.trim(); if (!p) return;
    if (p.length > 30 && p.includes(',')) { const i = p.indexOf(','); parts.push(p.slice(0, i + 1).trim(), p.slice(i + 1).trim()); } else parts.push(p); });
  const tot = parts.reduce((a, c) => a + c.length, 0); let t = VOICE_LEAD; return parts.map(c => { const d = dur * c.length / tot; const r = [c, t, d]; t += d; return r; });
}

(async () => {
  if (!SHOT_ONLY) fs.rmSync(W + '/raw', { recursive: true, force: true }); // 지난 녹화 지우기
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, ...(SHOT_ONLY ? { deviceScaleFactor: 2 } : { recordVideo: { dir: W + '/raw', size: { width: 1280, height: 720 } } }) });
  const t0 = Date.now(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const log = []; let sceneIdx = 0; const nScenes = S.scenes.length;
  const inject = async () => { await p.evaluate(OVERLAY); };
  const H = {
    page: p, sleep, S, W,
    async goto2() { await inject(); }, // 같은 페이지에서 화면이 바뀐 뒤 오버레이 확인(중복 주입 안전)
    async goto(url) { await p.goto(url); await sleep(300); await inject(); },
    async eval(fn, arg) { return p.evaluate(fn, arg); },
    async el(sel) { return typeof sel === 'string' ? p.waitForSelector(sel, { state: 'visible', timeout: 10000 }) : sel; },
    async settle(el) { // 부드러운 스크롤·펼침 애니메이션이 끝날 때까지 위치가 3번 연속 같을 때까지 기다림
      await sleep(140); let bx = await el.boundingBox(), same = 0; for (let i = 0; i < 40; i++) { await sleep(70); const b2 = await el.boundingBox(); if (b2 && bx && Math.abs(b2.y - bx.y) < .5 && Math.abs(b2.x - bx.x) < .5) { if (++same >= 3) return b2; } else same = 0; bx = b2; } return bx; },
    async view(sel) { const el = await H.el(sel); await el.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'smooth' })); await H.settle(el); return el; },
    async tap(sel, o = {}) {
      const el = await H.el(sel); if (!o.noScroll) await el.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      const bx = await H.settle(el); let x = bx.x + bx.width / 2, y = bx.y + bx.height / 2;
      await p.evaluate(([x, y]) => VK.cursor(x, y), [x, y]); await sleep(o.fast ? 300 : 430);
      const b3 = await el.boundingBox(); if (b3) { x = b3.x + b3.width / 2; y = b3.y + b3.height / 2; }
      await p.evaluate(() => VK.tapFx()); await p.mouse.click(x, y); await sleep(o.after ?? 350); return el;
    },
    async drag(points, o = {}) { // 화면 좌표 점들을 따라 끌기(그리기)
      let [x, y] = points[0]; await p.evaluate(([x, y]) => VK.cursor(x, y), [x, y]); await sleep(380); await p.mouse.move(x, y); await p.mouse.down();
      for (const [x2, y2] of points.slice(1)) { for (let k = 1; k <= (o.steps || 12); k++) { const xx = x + (x2 - x) * k / (o.steps || 12), yy = y + (y2 - y) * k / (o.steps || 12); await p.mouse.move(xx, yy); await p.evaluate(([a, b]) => VK.cursor(a, b, true), [xx, yy]); await sleep(26); } x = x2; y = y2; }
      await p.mouse.up(); await sleep(200);
    },
    async spot(sel, ms = 1800) { const el = await H.el(sel); const r = await el.boundingBox(); await p.evaluate(([r, ms]) => VK.spot(r, ms), [r, ms]); },
    async callout(sel, text, color, ms = 1800) { const el = await H.el(sel); const r = await el.boundingBox(); await p.evaluate(([r, t, c, ms]) => VK.callout(r, t, c, ms), [r, text, color || null, ms]); },
    async scene(key, fn) {
      const sc = S.scenes.find(s => s.key === key); if (!sc) throw new Error('scene not in scenes.json: ' + key);
      if (sc.chapter) { await p.evaluate(c => VK.chapter(c.num, c.title, c.sub), sc.chapter); await sleep(1500); await p.evaluate(c => VK.chip(c.chip || c.title, c.tag || ''), sc.chapter); await sleep(1500); }
      const st = (Date.now() - t0) / 1000; log.push({ k: key, st }); sceneIdx++;
      const D = DUR[key] || 0; await p.evaluate(([c, pr]) => { VK.captions(c); VK.progress(pr); }, [chunks(sc.narration, D), sceneIdx / nScenes]);
      await fn();
      const need = st + VOICE_LEAD + D + (sc.pad ?? 0.6), now = (Date.now() - t0) / 1000; if (now < need) await sleep((need - now) * 1000);
    }
  };
  if (SHOT_ONLY) { await actions.shot(H); await b.close(); console.log('shot saved'); return; }
  // 제목 카드
  await p.goto('file://' + W + '/title.html'); await inject(); await p.evaluate(() => { document.getElementById('vk-chip').style.display = 'none'; });
  await H.scene('title', async () => { await sleep(1200); });
  await actions.run(H);
  // 마무리 카드
  await p.goto('file://' + W + '/outro.html'); await inject(); await p.evaluate(() => { document.getElementById('vk-chip').style.display = 'none'; VK.progress(1); });
  await H.scene('outro', async () => { await sleep(1200); });
  await sleep(1800);
  const total = (Date.now() - t0) / 1000; await ctx.close(); await b.close();
  fs.writeFileSync(W + '/timeline.json', JSON.stringify({ log, total }, null, 1));
  console.log(log.map(x => x.k + '@' + x.st.toFixed(1)).join(' '), '| total', total.toFixed(1) + 's', '| errors', errs.length ? errs : 'none');
})();
