"""제목 카드(title.html)·마무리 카드(outro.html)를 만든다. 실험실 캡처(shot.png)와 QR 코드를 넣고 모션을 준다.
사용: python3 cards.py <작업폴더>   (scenes.json의 meta, 작업폴더/shot.png 사용)"""
import json, sys, base64, io, os, qrcode
W = sys.argv[1]; m = json.load(open(W + '/scenes.json'))['meta']
_L = len(m['title']); tsz = 78 if _L <= 7 else 66 if _L <= 12 else 54; tsz2 = tsz - 6  # 제목 길이에 맞춰 글자 크기 자동 조절
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
shot = b64(W + '/shot.png') if os.path.exists(W + '/shot.png') else ''
q = io.BytesIO(); qrcode.make(m['url'], box_size=10, border=2).save(q, 'PNG'); qr = base64.b64encode(q.getvalue()).decode()
BASE = """*{margin:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;color:#1b1d4a;
background:linear-gradient(135deg,#fff8db 0%,#ffe8f3 45%,#e9e4ff 100%);position:relative}
.blob{position:absolute;border-radius:50%;filter:blur(2px);animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translate(20px,-24px) scale(1.06)}}
.g{background:linear-gradient(100deg,#6741d9,#e64980 55%,#f08c00);-webkit-background-clip:text;color:transparent}
.pill{display:inline-block;font-weight:900;border-radius:999px;padding:9px 20px;font-size:24px}
.up{animation:up .8s cubic-bezier(.2,.9,.3,1.2) both}@keyframes up{from{opacity:0;transform:translateY(40px)}}
.pop{animation:pop .7s cubic-bezier(.3,1.6,.5,1) both}@keyframes pop{from{opacity:0;transform:scale(.3) rotate(-10deg)}}
.slide{animation:sl 1s cubic-bezier(.2,.9,.3,1.1) both}@keyframes sl{from{opacity:0;transform:translateX(120px) rotate(8deg)}}
.tab{position:absolute;right:70px;top:120px;width:560px;border-radius:34px;background:#1b1d4a;padding:16px;box-shadow:0 30px 60px rgba(60,30,120,.35);transform:rotate(4deg)}
.tab img{width:100%;border-radius:20px;display:block}
.ft{position:absolute;bottom:20px;left:0;width:100%;text-align:center;color:#8a7fb0;font-size:17px;letter-spacing:.06em}
.spark{position:absolute;font-size:40px;animation:tw 1.6s ease-in-out infinite}@keyframes tw{50%{transform:scale(1.3) rotate(15deg);opacity:.6}}"""
blobs = '<div class="blob" style="width:420px;height:420px;left:-120px;top:-140px;background:#d0bfff;opacity:.55"></div><div class="blob" style="width:360px;height:360px;right:-90px;bottom:-130px;background:#ffc9de;opacity:.6;animation-delay:-2s"></div><div class="blob" style="width:220px;height:220px;left:44%;top:68%;background:#ffec99;opacity:.7;animation-delay:-4s"></div>'
title = f"""<!DOCTYPE html><html><head><meta charset=utf-8><style>{BASE}</style></head><body>{blobs}
<div style="position:absolute;left:80px;top:120px;width:600px">
 <div class="up"><span class="pill" style="background:#6741d9;color:#fff">{m['grade']}</span> <span class="pill" style="background:#fff;color:#6741d9">{m['unit']}</span></div>
 <div class="pop" style="font-size:90px;margin:6px 0 0;animation-delay:.2s">{m['emoji']}</div>
 <h1 class="up g" style="font-size:{tsz}px;word-break:keep-all;font-weight:900;line-height:1.12;letter-spacing:-.03em;animation-delay:.35s">{m['title']}</h1>
 <div class="up" style="font-size:34px;font-weight:800;margin-top:14px;color:#5a4f8a;animation-delay:.55s">{m['subtitle']}</div>
 <div class="up" style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap;animation-delay:.75s">{''.join(f'<span class="pill" style="background:#fff;font-size:20px;box-shadow:0 6px 16px rgba(80,50,160,.12)">{t}</span>' for t in m.get('tags', []))}</div>
</div>
{f'<div class="tab slide" style="animation-delay:.5s"><img src="data:image/png;base64,{shot}"></div>' if shot else ''}
<div class="spark" style="right:90px;top:70px">✨</div><div class="spark" style="right:600px;top:560px;animation-delay:-.8s">⭐</div>
<div class="ft">{m.get('credit', '')}</div></body></html>"""
outro = f"""<!DOCTYPE html><html><head><meta charset=utf-8><style>{BASE}</style></head><body>{blobs}
<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:70px">
 <div class="pop"><img src="data:image/png;base64,{qr}" style="width:330px;border-radius:26px;background:#fff;padding:12px;box-shadow:0 20px 50px rgba(80,50,160,.25)"></div>
 <div style="max-width:600px">
  <div class="up" style="font-size:32px;font-weight:900;color:#e64980">📱 태블릿으로 바로 시작!</div>
  <h1 class="up g" style="font-size:{tsz2}px;word-break:keep-all;font-weight:900;line-height:1.15;margin:10px 0 18px;animation-delay:.15s">{m['title']}<br>가상실험실</h1>
  <div class="up" style="font-size:19px;font-weight:800;word-break:break-all;background:#fff;border-radius:18px;padding:12px 18px;box-shadow:0 8px 22px rgba(80,50,160,.14);animation-delay:.3s">{m['url'].replace('https://', '')}</div>
  <div class="up" style="margin-top:20px;font-size:24px;color:#5a4f8a;font-weight:700;animation-delay:.45s">QR 코드를 찍거나 더보기란의 주소를 눌러 보세요 👇</div>
 </div></div><div class="ft">{m.get('credit', '')}</div></body></html>"""
open(W + '/title.html', 'w').write(title); open(W + '/outro.html', 'w').write(outro); print('cards ok')
