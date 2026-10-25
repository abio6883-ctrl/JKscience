// 녹화 중 실험실 페이지에 주입하는 모션그래픽 레이어 (window.VK)
// 챕터 카드 · 하단 자막 바 · 챕터 칩 · 진행 막대 · 터치 포인터 · 스포트라이트 · 말풍선 스티커
(() => {
  if (window.VK) return;
  const css = `
  #vk{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font-family:'Noto Sans CJK KR','Noto Sans KR','Apple SD Gothic Neo',sans-serif}
  #vk *{box-sizing:border-box}
  #vk-cap{position:absolute;left:50%;bottom:30px;transform:translateX(-50%) translateY(16px);max-width:900px;padding:12px 26px;border-radius:18px;
    background:rgba(24,18,60,.86);color:#fff;font-size:27px;font-weight:800;line-height:1.35;text-align:center;letter-spacing:-.01em;opacity:0;
    box-shadow:0 10px 30px rgba(20,10,60,.35);transition:opacity .25s,transform .35s cubic-bezier(.2,.9,.3,1.2);backdrop-filter:blur(6px)}
  #vk-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #vk-cap b{color:#ffd43b}
  #vk-chip{position:absolute;left:18px;bottom:36px;padding:9px 16px;border-radius:14px;background:linear-gradient(135deg,#7048e8,#e64980);color:#fff;
    font-size:17px;font-weight:900;box-shadow:0 8px 20px rgba(112,72,232,.35);transform:translateX(-130%);transition:transform .5s cubic-bezier(.2,.9,.3,1.15);max-width:200px;line-height:1.3}
  #vk-chip.on{transform:none}
  #vk-chip small{display:block;font-size:12px;font-weight:800;opacity:.85}
  #vk-bar{position:absolute;left:0;bottom:0;height:7px;width:0;background:linear-gradient(90deg,#20c997,#4dabf7,#7048e8,#e64980,#ffd43b);transition:width .6s linear}
  #vk-cur{position:absolute;left:0;top:0;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;background:rgba(255,255,255,.6);
    border:3px solid #7048e8;box-shadow:0 4px 14px rgba(0,0,0,.25);transform:translate(640px,520px);transition:transform .38s cubic-bezier(.3,.8,.3,1)}
  #vk-cur.tap::after{content:"";position:absolute;inset:-16px;border-radius:50%;border:4px solid rgba(112,72,232,.7);animation:vkr .55s ease-out forwards}
  @keyframes vkr{from{transform:scale(.35);opacity:1}to{transform:scale(1.5);opacity:0}}
  .vk-spot{position:absolute;border-radius:18px;box-shadow:0 0 0 4px #ffd43b,0 0 0 9999px rgba(20,14,50,.45);transition:all .45s cubic-bezier(.2,.9,.3,1);opacity:0}
  .vk-spot.on{opacity:1}
  .vk-call{position:absolute;padding:10px 18px;border-radius:16px;font-size:24px;font-weight:900;color:#1b1d4a;background:#ffd43b;
    box-shadow:0 8px 0 rgba(0,0,0,.12),0 12px 24px rgba(0,0,0,.18);transform:scale(0) rotate(-8deg);transition:transform .45s cubic-bezier(.3,1.6,.5,1);white-space:nowrap}
  .vk-call.on{transform:scale(1) rotate(-4deg)}
  .vk-call::after{content:"";position:absolute;left:24px;bottom:-12px;border:8px solid transparent;border-top:12px solid #ffd43b}
  #vk-chap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;
    background:linear-gradient(125deg,#5f3dc4 0%,#9c36b5 45%,#e64980 75%,#f59f00 100%);clip-path:circle(0% at 50% 50%);transition:clip-path .7s cubic-bezier(.7,0,.2,1)}
  #vk-chap.on{clip-path:circle(150% at 50% 50%)}
  #vk-chap .n{font-size:150px;font-weight:900;line-height:1;opacity:.95;transform:translateY(40px);opacity:0;transition:all .6s .25s cubic-bezier(.2,.9,.3,1.2);text-shadow:0 10px 40px rgba(0,0,0,.25)}
  #vk-chap .t{font-size:64px;font-weight:900;margin-top:10px;transform:translateY(40px);opacity:0;transition:all .6s .38s cubic-bezier(.2,.9,.3,1.2);letter-spacing:-.02em}
  #vk-chap .s{font-size:28px;font-weight:700;margin-top:14px;opacity:0;transition:opacity .6s .55s;background:rgba(255,255,255,.18);padding:8px 20px;border-radius:999px}
  #vk-chap.on .n,#vk-chap.on .t{transform:none;opacity:1} #vk-chap.on .s{opacity:1}
  #vk-chap i{position:absolute;border-radius:50%;background:rgba(255,255,255,.14);animation:vkf 4s ease-in-out infinite}
  @keyframes vkf{50%{transform:translateY(-26px) scale(1.08)}}
  #vk-chap.out{clip-path:circle(0% at 50% 50%)}
  `;
  const root = document.createElement('div'); root.id = 'vk';
  root.innerHTML = `<style>${css}</style><div id="vk-bar"></div><div id="vk-chip"></div><div id="vk-cap"></div><div id="vk-cur"></div>`;
  document.documentElement.appendChild(root);
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let capTimers = [];
  window.VK = {
    cursor(x, y, instant) { const c = $('vk-cur'); if (instant) c.style.transition = 'none'; c.style.transform = `translate(${x}px,${y}px)`; if (instant) { void c.offsetWidth; c.style.transition = ''; } },
    tapFx() { const c = $('vk-cur'); c.classList.remove('tap'); void c.offsetWidth; c.classList.add('tap'); },
    caption(html) { const c = $('vk-cap'); if (!html) { c.classList.remove('on'); return; } c.classList.remove('on'); void c.offsetWidth; c.innerHTML = html; c.classList.add('on'); },
    // [[텍스트, 시작초, 길이초], ...] 를 받아 순서대로 자막을 띄운다
    captions(list) { capTimers.forEach(clearTimeout); capTimers = []; list.forEach(([t, s, d]) => { capTimers.push(setTimeout(() => VK.caption(t), s * 1000)); capTimers.push(setTimeout(() => { if ($('vk-cap').innerHTML === t) VK.caption(''); }, (s + d) * 1000 + 150)); }); },
    chip(title, small) { const c = $('vk-chip'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = (small ? `<small>${small}</small>` : '') + title; c.classList.add('on'); }, 250); },
    progress(p) { $('vk-bar').style.width = (Math.max(0, Math.min(1, p)) * 100) + '%'; },
    async chapter(num, title, sub, ms = 2300) {
      const d = document.createElement('div'); d.id = 'vk-chap';
      let bubbles = ''; for (let i = 0; i < 9; i++) { const z = 60 + Math.random() * 180; bubbles += `<i style="width:${z}px;height:${z}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${-Math.random() * 4}s"></i>`; }
      d.innerHTML = bubbles + `<div class="n">${num}</div><div class="t">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}`;
      root.appendChild(d); void d.offsetWidth; d.classList.add('on'); await wait(ms); d.classList.add('out'); await wait(700); d.remove();
    },
    spot(r, ms = 1800, pad = 10) { const s = document.createElement('div'); s.className = 'vk-spot'; Object.assign(s.style, { left: (r.x - pad) + 'px', top: (r.y - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' }); root.appendChild(s); requestAnimationFrame(() => s.classList.add('on')); setTimeout(() => { s.classList.remove('on'); setTimeout(() => s.remove(), 500); }, ms); },
    callout(r, text, color, ms = 1800) { const c = document.createElement('div'); c.className = 'vk-call'; c.textContent = text; if (color) c.style.background = color; c.style.left = Math.max(10, r.x + r.width / 2 - 40) + 'px'; c.style.top = Math.max(10, r.y - 64) + 'px'; root.appendChild(c); requestAnimationFrame(() => c.classList.add('on')); setTimeout(() => { c.classList.remove('on'); setTimeout(() => c.remove(), 500); }, ms); }
  };
})();
