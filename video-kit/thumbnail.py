"""클릭을 부르는 유튜브 썸네일(1280×720)을 만든다.
원칙: 큰 훅 문구 2줄(최대 12자 내외) · 진한 테두리 글자 · 노란 강조어 · 실제 실험실 화면(기울인 태블릿) · 스티커 배지 · 선명한 대비
사용: python3 thumbnail.py <작업폴더>   → thumbnail.png, thumbnail_small.png(실제 목록 크기 미리보기)
scenes.json meta.thumb = {line1, line2, hl(강조할 단어), badge, corner, emoji}"""
import json, sys, base64, os
from playwright.sync_api import sync_playwright
W=sys.argv[1]; m=json.load(open(W+'/scenes.json'))['meta']; t=m['thumb']
shot=base64.b64encode(open(W+'/shot.png','rb').read()).decode()
def hl(s): return s.replace(t.get('hl',''),f"<span class='y'>{t.get('hl','')}</span>") if t.get('hl') and t['hl'] in s else s
html=f"""<!DOCTYPE html><html><head><meta charset=utf-8><style>
*{{margin:0;box-sizing:border-box}}body{{width:1280px;height:720px;overflow:hidden;font-family:'Noto Sans CJK KR',sans-serif;position:relative;
background:radial-gradient(circle at 78% 40%,#ff8cc6 0,#c2409a 30%,transparent 62%),linear-gradient(135deg,#4c1fb8 0%,#7b2fd6 45%,#e0408f 100%)}}
.rays{{position:absolute;inset:-200px;background:repeating-conic-gradient(from 0deg at 72% 45%,rgba(255,255,255,.09) 0 8deg,transparent 8deg 18deg)}}
.tab{{position:absolute;right:-30px;top:110px;width:690px;padding:18px;border-radius:40px;background:#16132e;transform:rotate(6deg);box-shadow:0 30px 70px rgba(20,0,60,.6),0 0 0 6px rgba(255,255,255,.15)}}
.tab img{{width:100%;display:block;border-radius:24px}}
.txt{{position:absolute;left:52px;top:175px;width:720px}}
.l{{font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1.02;-webkit-text-stroke:14px #1b0b45;paint-order:stroke fill;text-shadow:0 10px 0 rgba(20,0,60,.45);white-space:nowrap;width:max-content}}
.l1{{font-size:128px}} .l2{{font-size:112px;margin-top:6px}}
.y{{color:#ffe14d}}
.corner{{position:absolute;left:52px;top:44px;background:#ffe14d;color:#1b0b45;font-weight:900;font-size:40px;padding:10px 26px;border-radius:18px;box-shadow:0 8px 0 #1b0b45;transform:rotate(-3deg)}}
.badge{{position:absolute;left:60px;bottom:58px;background:#20e3a2;color:#0b2b22;font-weight:900;font-size:46px;padding:14px 30px;border-radius:999px;border:6px solid #1b0b45;box-shadow:0 10px 0 #1b0b45;transform:rotate(-4deg)}}
.emo{{position:absolute;right:40px;top:6px;font-size:150px;filter:drop-shadow(0 12px 18px rgba(0,0,0,.45));transform:rotate(12deg)}}
.arrow{{position:absolute;left:600px;bottom:110px;font-size:120px;transform:rotate(-20deg);filter:drop-shadow(0 8px 0 #1b0b45)}}
</style></head><body><div class="rays"></div>
<div class="tab"><img src="data:image/png;base64,{shot}"></div>
<div class="corner">{t['corner']}</div><div class="emo">{t.get('emoji','')}</div>
<div class="txt"><div class="l l1">{hl(t['line1'])}</div><div class="l l2">{hl(t['line2'])}</div></div>
<div class="badge">{t['badge']}</div><div class="arrow">👉</div>
<script>/* 한 줄이 넘치면 글자를 줄여 줄바꿈 없이 맞춤 */document.querySelectorAll('.l').forEach(e=>{{let f=parseFloat(getComputedStyle(e).fontSize);while(e.getBoundingClientRect().width>700&&f>60){{f-=4;e.style.fontSize=f+'px';}}}});</script>
</body></html>"""
open(W+'/thumbnail.html','w').write(html)
with sync_playwright() as pw:
    b=pw.chromium.launch(); p=b.new_page(viewport={'width':1280,'height':720})
    p.goto('file://'+os.path.abspath(W)+'/thumbnail.html'); p.wait_for_timeout(500); p.screenshot(path=W+'/thumbnail.png'); b.close()
from PIL import Image
Image.open(W+'/thumbnail.png').resize((320,180),Image.LANCZOS).save(W+'/thumbnail_small.png'); print('thumbnail ok')
