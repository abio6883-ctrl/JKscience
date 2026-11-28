// 저항의 연결·전기 에너지의 전환 가상실험실 영상 동작 — scenes.json의 key와 1:1
const LAB = process.env.LAB_URL || 'https://abio6883-ctrl.github.io/JKscience/resistance-connection-energy/';
module.exports.LAB = LAB;
const acc = async (H, i) => { await H.tap(`.concept-card[data-i="${i}"] .head`, { after: 700 }); await H.eval(i => { const c = document.querySelector(`.concept-card[data-i="${i}"]`); if (!c.classList.contains('open')) c.querySelector('.head').click(); }, i); await H.sleep(500); };
const tab = async (H, k, after = 700) => { await H.tap(`#expTabs [data-tab="${k}"]`, { after }); await H.eval(k => { const t = document.getElementById('tab-' + k); if (!t || t.offsetParent === null) setTab(k); }, k); await H.sleep(300); await H.goto2(); };
const step = async (H, sel, i) => { await H.tap(sel, { after: 900 }); await H.eval(i => { const id = ['screen-intro','screen-concept','screen-experiment','screen-sticker','screen-life','screen-quiz'][i]; const e = document.getElementById(id); if (e && !e.classList.contains('active')) goTo(i); }, i); await H.sleep(400); await H.goto2(); };
const fresh = async H => { await H.goto(LAB); await H.eval(() => { try { localStorage.clear(); } catch (e) {} location.reload(); }); await H.sleep(600); await H.goto(LAB); };
const rec = async (H, k, es) => { await H.tap(`.app[data-k="${k}"]`, { fast: true, after: 450 }); for (const e of es) await H.tap(`#pEng .chip[data-v="${e}"]`, { fast: true, after: 150 }); await H.tap('#pChk', { fast: true, after: 500 }); };

module.exports.run = async H => {
  const { sleep } = H;
  await fresh(H);
  await H.scene('intro', async () => { await H.view('#thinkBox'); await sleep(900); await H.tap('#thinkBox .tap-sw[data-i="1"]', { after: 600 }); await H.callout('#thinkMsg', '나머지는 그대로!', '#0ca678', 2400); await sleep(2600); await H.spot('#thinkBox', 3000); });
  await H.scene('ser', async () => { await step(H, '#startBtn', 1); await acc(H, 0); await H.view('#k1Net'); await sleep(1200);
    await H.tap('#k1N .chip[data-v="2"]', { after: 1800 }); await H.tap('#k1N .chip[data-v="3"]', { after: 900 }); await H.view('#k1M'); await H.callout('#k1M', '저항 ⬆ · 전류 ⬇ · 밝기 ⬇', '#e8590c', 2600); });
  await H.scene('par', async () => { await acc(H, 1); await H.view('#k2Net'); await sleep(900);
    await H.tap('#k2N .chip[data-v="2"]', { after: 1600 }); await H.tap('#k2N .chip[data-v="3"]', { after: 900 }); await H.view('#k2M'); await H.callout('#k2M', '밝기 그대로 · 전체 전류 ⬆', '#0ca678', 2600); });
  await H.scene('cut', async () => { await acc(H, 2); await H.view('.mini-net'); await sleep(900); await H.tap('#k3Btn', { after: 700 }); await H.view('.mini-net'); await H.spot('.mini-net', 4200); await sleep(2000); await H.callout('#k3b', '병렬은 그대로 켜짐!', '#0ca678', 2200); });
  await H.scene('power', async () => { await acc(H, 4); await H.view('#k5Run'); await H.tap('#k5Run', { after: 1500 }); await H.view('#k5Bars'); await H.callout('#k5Bars', '1초 동안 1500 J!', '#e03131', 2600); });
  await H.scene('conv', async () => { await acc(H, 5); await H.tap('#k6Btns .chip[data-v="6"]', { after: 800 }); await H.view('#k6Conv'); await H.spot('#k6Conv', 3200); await sleep(2600); await H.tap('#k6Btns .chip[data-v="5"]', { after: 600 }); await H.view('#k6Conv'); });
  await H.scene('myth', async () => { await H.view('#mythGrid'); const m = await H.page.$$('.myth'); await H.tap(m[1], { after: 700 }); await H.tap(m[4], { after: 500 }); await H.spot('#mythGrid', 2400); });
  await H.scene('conn1', async () => { await step(H, '#screen-concept [data-go="2"]', 2); await tab(H, 'conn', 600);
    await H.tap('#nMode .chip[data-v="one"]', { after: 1600 }); await H.view('#nNet'); await sleep(800); await H.tap('#nMode .chip[data-v="ser2"]', { after: 900 }); await H.view('#nNet'); await H.callout('#nNet', '어두워졌어요', '#e8590c', 2400); await sleep(1500); });
  await H.scene('conn2', async () => { await H.tap('#nNet .bulb-hit[data-b="0"]', { after: 900, noScroll: true }); await H.callout('#nNet', '😮 모두 꺼짐!', '#e5484d', 2600); await sleep(2400); await H.view('#nMeters'); await H.spot('#nMeters', 2600); });
  await H.scene('conn3', async () => { await H.tap('#nMode .chip[data-v="par2"]', { after: 900 }); await H.view('#nNet'); await sleep(1600); await H.tap('#nNet .bulb-hit[data-b="0"]', { after: 900, noScroll: true }); await H.callout('#nNet', '😀 남은 전구는 그대로!', '#0ca678', 2600); });
  await H.scene('conn4', async () => { await H.view('.compare-box'); await H.tap('#cmpS .chip[data-v=">"]', { fast: true }); await H.tap('#cmpP .chip[data-v="="]', { fast: true }); await H.tap('#cmpChk', { after: 900 });
    await H.view('#nTable'); await H.spot('#nTable', 3600); });
  await H.scene('tap1', async () => { await tab(H, 'tap', 700); await H.view('#tapFig'); await sleep(600); await H.tap('#tInside', { after: 700 }); await H.view('#tapFig'); await H.spot('#tapFig', 3400); await sleep(3200); await H.tap('#tAllOn', { after: 700 }); await H.view('#tapFig'); await H.callout('#tapFig', '모두 220 V', '#0ca678', 2400); });
  await H.scene('tap2', async () => { await H.tap('#tMode .chip[data-v="ser"]', { after: 900 }); await H.view('#tapFig'); await sleep(800); await H.tap('#tapFig .tap-sw[data-i="1"]', { after: 700, noScroll: true }); await H.callout('#tapFig', '😱 모두 꺼졌어요!', '#e5484d', 2600); await sleep(2200); await H.tap('#tMode .chip[data-v="par"]', { after: 500 }); });
  await H.scene('pow1', async () => { await tab(H, 'power', 700); await H.tap('.app[data-k="dryer"]', { after: 900 }); await H.view('#appDetail'); await H.callout('#appDetail .plate', '1700 W', '#e03131', 2000); await sleep(1600);
    await H.tap('#pEng .chip[data-v="운동"]', { fast: true }); await H.tap('#pEng .chip[data-v="열"]', { fast: true }); await H.tap('#pChk', { after: 900 }); await H.view('#pFb'); });
  await H.scene('pow2', async () => { await H.view('#appGrid'); await rec(H, 'kettle', ['열']); await rec(H, 'tv', ['빛', '소리']); await rec(H, 'lamp', ['빛']); await rec(H, 'iron', ['열']);
    await H.view('#pChart'); await H.spot('#pChart', 3200); await sleep(1400); await H.callout('#pChart', '🔥 열을 내는 기구가 커요', '#e03131', 2200); });
  await H.scene('eff1', async () => { await tab(H, 'eff', 700); await H.view('#eRun'); await H.tap('#eRun', { after: 300 }); await H.view('#eCv'); await sleep(3500); });
  await H.scene('eff2', async () => { await H.page.waitForFunction(() => !EFF.running, { timeout: 20000 }); await H.view('#eCv'); await H.callout('#eCv', '나: 빛 80 % ✨', '#e0a800', 2600); await sleep(2600); await H.view('#eBars'); await H.spot('#eBars', 3000); });
  await H.scene('standby', async () => { await H.view('#sbFig'); await H.tap('#sbMode .chip[data-v="standby"]', { after: 900 }); await H.view('#sbFig'); await H.callout('#sbFig', '대기 전력 🔴', '#e03131', 2400); await sleep(3000); await H.tap('#sbMode .chip[data-v="unplug"]', { after: 900 }); await H.view('#sbMeters'); });
  await H.scene('save1', async () => { await tab(H, 'save', 700); await H.view('#houseFig'); await sleep(500);
    for (const k of ['light', 'charger', 'ac']) await H.tap(`#houseFig .hs[data-k="${k}"]`, { fast: true, after: 900, noScroll: true }); await H.view('#hsList'); await H.spot('#hsList', 2000); });
  await H.scene('save2', async () => { await H.view('#cnPick'); await H.tap('#cnPick .chip[data-v="2"]', { fast: true }); await H.tap('#cnPick .chip[data-v="4"]', { fast: true }); await H.tap('#cnTheme .chip[data-v="green"]', { after: 500 }); await H.view('#cnCv'); await H.spot('#cnCv', 3000); await sleep(2200); await H.callout('#cnSave', '그림으로 저장!', '#3361e8', 2000); });
  await H.scene('sticker', async () => { await step(H, '#screen-experiment > .btn-row [data-go="3"]', 3);
    for (const [lab, id] of [['어두워진다', 's1'], ['같다', 'p1'], ['커진다', 's2'], ['작아진다', 'p2'], ['작아진다', 's3'], ['커진다', 'p3']]) { await H.tap(await H.page.$(`#stkTray .sticker >> text="${lab}"`), { fast: true, after: 150 }); await H.tap(`#slot-0-${id}`, { fast: true, after: 200 }); }
    await H.tap('#stkCheck', { after: 900 }); await H.view('#stkDone'); await H.callout('#stkDone', '완성 도장 쾅!', '#e5484d', 2000); await sleep(1200); });
  await H.scene('life', async () => { await H.eval(() => goTo(4)); await sleep(800); await H.goto2(); const c = await H.page.$$('.life-card'); await H.tap(c[2], { after: 1200 }); await H.tap(c[7], { after: 900 }); });
  await H.scene('quiz', async () => { await step(H, '#toQuiz', 5); for (let i = 0; i < 2; i++) { await H.tap('#qCard .opt[data-oi="0"]', { after: 1300 }); await H.tap('#qNext', { after: 600 }); } });
  await H.scene('answer', async () => { await H.eval(() => goTo(0)); await sleep(700); await H.goto2(); await H.view('#thinkBox'); await H.tap('#thinkAnsBtn', { after: 600 }); await H.view('#thinkBox'); await H.callout('#thinkBox', '정답: 병렬연결!', '#0ca678', 3000); await sleep(2000); });
};

// 썸네일·제목 카드용 실험실 캡처: 개념 카드 3(직렬·병렬에서 전구 하나 뺀 모습)
module.exports.shot = async H => {
  const p = H.page; await H.goto(LAB); await H.eval(() => { try { localStorage.clear(); } catch (e) {} goTo(1); }); await H.sleep(600);
  await H.eval(() => { const c = document.querySelector('.concept-card[data-i="2"]'); c.classList.add('open'); document.getElementById('k3Btn').click(); }); await H.sleep(900);
  await H.eval(() => document.querySelectorAll('#vk-cur,#vk-cap,#vk-chip,#vk-prog').forEach(e => e.style.display = 'none'));
  await H.eval(() => document.querySelectorAll('body *').forEach(e => { const ps = getComputedStyle(e).position; if (ps === 'sticky' || ps === 'fixed') e.style.position = 'static'; }));
  const el = await p.$('.concept-card[data-i="2"] .concept-body'); await el.scrollIntoViewIfNeeded(); await H.sleep(700);
  await el.screenshot({ path: H.W + '/shot.png' });
};
