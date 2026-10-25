// 배설계 가상실험실 영상 동작 — scenes.json의 key와 1:1
const LAB = process.env.LAB_URL || 'https://abio6883-ctrl.github.io/JKscience/excretory-system/';
module.exports.LAB = LAB;
const waitSim = H => H.page.waitForFunction(() => !document.querySelector('#simNext').disabled, { timeout: 30000 });
const waitAuto = H => H.page.waitForFunction(() => document.querySelector('#simAuto').textContent.includes('자동 재생'), { timeout: 60000 });
// 개념 카드 열기: 탭이 빗나가도(펼침 애니메이션으로 위치가 밀림) 반드시 열린 상태로 만든다
const acc = async (H, i) => { await H.tap(`[data-i="${i}"] .head`, { after: 700 }); await H.eval(i => { const c = document.querySelector(`[data-i="${i}"]`); if (!c.classList.contains('open')) c.querySelector('.head').click(); }, i); await H.sleep(500); };
// 실험 탭 열기: 탭이 빗나가면 한 번 더 눌러 반드시 그 탭으로 이동
const tab = async (H, k, after = 700) => { await H.tap(`[data-tab="${k}"]`, { after }); await H.eval(k => { const t = document.getElementById('tab-' + k); if (!t || t.offsetParent === null) document.querySelector(`[data-tab="${k}"]`).click(); }, k); await H.sleep(300); await H.goto2(); };
// 단계 이동 버튼: 빗나가면 goTo(i)로 보정
const step = async (H, sel, i) => { await H.tap(sel, { after: 900 }); await H.eval(i => { const id = ['screen-intro','screen-concept','screen-experiment','screen-sticker','screen-life','screen-quiz'][i]; const e = document.getElementById(id); if (e && !e.classList.contains('active')) goTo(i); }, i); await H.sleep(400); await H.goto2(); };
const fresh = async H => { await H.goto(LAB); await H.eval(() => { try { localStorage.clear(); } catch (e) {} location.reload(); }); await H.sleep(500); await H.goto(LAB); };

module.exports.run = async H => {
  const { sleep } = H;
  await fresh(H);
  await H.scene('intro', async () => { await sleep(900); await H.callout('#drinkBtn', '눌러 보세요!'); for (let i = 0; i < 4; i++) await H.tap('#drinkBtn', { fast: true, after: 500 }); await H.view('#heroBox'); });
  await H.scene('nut', async () => { await step(H, '#startBtn', 1); await acc(H, 0); await H.tap('[data-nut="pro"]', { after: 900 }); await H.spot('#toxBox', 3200); await sleep(1600); await H.callout('#toxU', '독성 ↓', '#fd7e14'); });
  await H.scene('extour', async () => { await acc(H, 1); await H.view('#exWrap'); await H.tap('#exTour', { after: 300 }); await H.view('#exWrap'); await H.spot('#exWrap', 5000); await sleep(4800); });
  await H.scene('zoom', async () => { await acc(H, 2); await H.tap('#kidWrap [data-k="unit"]'); await H.tap('#zoomBtn', { after: 1000 }); if (await H.eval(() => document.getElementById('zoomBox').classList.contains('hidden'))) await H.tap('#zoomBtn', { after: 1000 }); await H.view('#nephLbl'); await H.callout('#nephLbl', '콩팥단위 = 토리 + 보먼주머니 + 세뇨관'); await H.tap('#nephLbl [data-k="glom"]'); });
  await H.scene('proc', async () => { await acc(H, 3); await H.view('#procWrap');
    for (const k of ['f', 'r', 's']) { await H.tap(`[data-proc="${k}"]`, { after: 300 }); await H.view('#procWrap'); await H.spot('#procWrap', 1900); await sleep(1900); } });
  await H.scene('myth', async () => { await H.view('#mythGrid'); const m = await H.page.$$('.myth'); await H.tap(m[0]); await H.tap(m[1]); await H.spot('#mythGrid', 2200); });
  await H.scene('route', async () => { await step(H, '#screen-concept [data-go="2"]', 2); await tab(H, 'route', 600);
    for (const n of ['콩팥동맥', '콩팥(콩팥단위)', '콩팥깔때기']) await H.tap(`[data-rc="${n}"]`, { fast: true, after: 350 }); });
  await H.scene('route2', async () => { for (const n of ['오줌관', '방광', '요도', '몸 밖']) await H.tap(`[data-rc="${n}"]`, { fast: true, after: 300 });
    await H.view('#routeWrap'); await H.spot('#routeWrap', 6000); await sleep(5500); });
  await H.scene('bladder', async () => { await H.view('#blAdd'); for (let i = 0; i < 6; i++) await H.tap('#blAdd', { fast: true, after: 250, noScroll: i > 0 });
    await H.callout('#blTxt', '600 mL 가득!', '#e5484d'); await sleep(900); await H.tap('#blOut', { after: 600 }); });
  await H.scene('neph0', async () => { await tab(H, 'neph', 700); await H.view('#predBox'); await H.spot('#predBox', 4200);
    await H.tap('[data-pq="glu"][data-pa="없다"]', { fast: true }); await H.tap('[data-pq="ure"][data-pa="있다"]', { fast: true }); await H.tap('[data-pq="pro"][data-pa="없다"]', { fast: true }); });
  await H.scene('neph1', async () => { await H.tap('[data-f="ure"]', { fast: true }); await H.view('#simWrap'); await H.tap('#simNext', { after: 200 }); await H.view('#simWrap'); await waitSim(H); });
  for (const k of ['neph2', 'neph3', 'neph4']) await H.scene(k, async () => { await H.tap('#simNext', { after: 100, noScroll: true }); await H.callout('#simWrap', { neph2: '① 여과', neph3: '② 재흡수', neph4: '③ 분비' }[k], { neph2: '#7048e8', neph3: '#12b886', neph4: '#f76707' }[k], 2000); await waitSim(H); });
  await H.scene('neph5', async () => { await H.tap('#simNext', { after: 100, noScroll: true }); await waitSim(H); await H.callout('#simWrap', '오줌 완성! 🎉', '#fab005'); await sleep(1500); await H.view('#predBox'); await H.spot('#predBox', 2000); await sleep(1800); });
  await H.scene('table', async () => { await H.view('#cntTbl'); await H.spot('#cntTbl', 6000); await sleep(4000); await H.callout('#cntTbl', '요소 농도 ↑↑', '#e5484d', 2200); });
  await H.scene('sugar', async () => { await H.tap('[data-f="glu"]', { fast: true }); await H.tap('[data-cond="sugar"]', { fast: true }); await H.tap('#simAuto', { after: 200 }); await H.view('#simWrap'); await waitAuto(H); await H.callout('#simWrap', '포도당이 오줌에!', '#e5484d', 2000); await sleep(1000); });
  await H.scene('glom', async () => { await H.tap('[data-f="pro"]', { fast: true }); await H.tap('[data-cond="glom"]', { fast: true }); await H.tap('#simAuto', { after: 200 }); await H.view('#simWrap'); await waitAuto(H); await H.view('#recCv'); await H.spot('#recCv', 3000); await sleep(2600); });
  await H.scene('lab', async () => { await tab(H, 'lab', 700); await H.view('#labGrid');
    for (const r of ['bi', 'be']) for (const s of ['가', '나', '다']) await H.tap(`#tb-${r}-${s}`, { fast: true, after: 420 }); });
  await H.scene('lab2', async () => { await H.tap('#heatBtn', { after: 2400 }); await H.view('#labGrid'); await H.spot('#labGrid', 2200); await sleep(1400);
    for (const [s, v] of [['가', '정상'], ['나', '여과'], ['다', '재흡수']]) await H.tap(`[data-ds="${s}"][data-dv="${v}"]`, { fast: true, after: 220 });
    await H.tap('#diagCheck', { after: 1200 }); });
  await H.scene('pad', async () => { const p = H.page; await tab(H, 'pad', 800);
    await H.eval(() => { const t = document.getElementById('padTools'); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 100, behavior: 'smooth' }); }); await sleep(1000);
    const bx = await (await p.$('#padCv')).boundingBox(); const P = (fx, fy) => [bx.x + bx.width * fx, bx.y + bx.height * fy];
    for (const [t, pts] of [['glu', [[.27, .51], [.36, .51]]], ['ure', [[.5, .51], [.58, .51]]], ['rbc', [[.33, .19]]]]) { await H.tap(`[data-stamp="${t}"]`, { fast: true, after: 150, noScroll: true });
      for (const q of pts) { const [x, y] = P(...q); await H.eval(([x, y]) => VK.cursor(x, y), [x, y]); await sleep(350); await H.eval(() => VK.tapFx()); await p.mouse.click(x, y); await sleep(250); } }
    await H.tap('[data-pen="#12b886"]', { fast: true, after: 150, noScroll: true });
    for (const s of [[[.42, .47], [.42, .27]], [[.47, .47], [.47, .27]]]) await H.drag(s.map(q => P(...q)));
    await H.tap('[data-pen="#e03131"]', { fast: true, after: 150, noScroll: true }); await H.drag([P(.56, .27), P(.56, .47)]);
    await H.callout('#padCv', '초록 = 재흡수 · 빨강 = 분비', '#12b886', 2200); await sleep(1200); });
  await H.scene('sticker', async () => { await step(H, '#tab-pad [data-go="3"]', 3);
    for (const [lab, id] of [['콩팥', 'kid'], ['오줌관', 'ure'], ['방광', 'bla'], ['콩팥동맥', 'art'], ['콩팥정맥', 'vei'], ['요도', 'uth']]) { await H.tap(await H.page.$(`#stkTray .sticker >> text="${lab}"`), { fast: true, after: 150 }); await H.tap(`#slot-0-${id}`, { fast: true, after: 220 }); }
    await H.tap('#stkCheck', { after: 900 }); await H.view('#stkDone'); await H.callout('#stkDone', '완성 도장 쾅!', '#e5484d', 2000); await sleep(1500); });
  await H.scene('life', async () => { await H.eval(() => goTo(4)); await sleep(800); await H.goto2(); const c = await H.page.$$('.life-card'); await H.tap(c[0], { after: 900 }); await H.tap(c[4], { after: 900 }); });
  await H.scene('quiz', async () => { await step(H, '#toQuiz', 5);
    for (let i = 0; i < 2; i++) { await H.tap('#qCard .opt[data-oi="0"]', { after: 1500 }); await H.tap('#qNext', { after: 700 }); } });
};

// 썸네일·제목 카드에 넣을 실험실 화면 캡처(shot.png)
module.exports.shot = async H => {
  const p = H.page; await H.goto(LAB); await H.eval(() => { try { localStorage.clear(); } catch (e) {} goTo(2); }); await H.sleep(600);
  await p.click('[data-tab="neph"]'); await H.sleep(500); await p.click('[data-f="ure"]');
  for (let i = 0; i < 3; i++) { await p.click('#simNext'); await waitSim(H); }
  await H.eval(() => document.querySelectorAll('#vk-cur,#vk-cap,#vk-chip,#vk-prog').forEach(e => e.style.display = 'none'));
  await H.eval(() => document.querySelectorAll('body *').forEach(e => { const ps = getComputedStyle(e).position; if (ps === 'sticky' || ps === 'fixed') e.style.position = 'static'; }));
  const el = await p.$('#simWrap'); await el.scrollIntoViewIfNeeded(); await H.sleep(300);
  await el.screenshot({ path: H.W + '/shot.png' });
};
