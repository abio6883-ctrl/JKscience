"""녹화 타임라인에 맞춰 내레이션 트랙(narration.wav)과 유튜브 자막(subs.srt), 유튜브 목차(chapters.txt)를 만든다.
사용: python3 mix.py <작업폴더>"""
import json, sys, re, numpy as np, soundfile as sf
W=sys.argv[1]; S=json.load(open(W+'/scenes.json')); tl=json.load(open(W+'/timeline.json'))
st={x['k']:x['st'] for x in tl['log']}; T=tl['total']; SR=44100; LEAD=0.35
nar=np.zeros(int(SR*(T+1)),dtype='float32'); srt=[]; n=1
fmt=lambda t:f"{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int((t%1)*1000):03}"
for sc in S['scenes']:
    x,sr=sf.read(f"{W}/voice/{sc['key']}.wav",dtype='float32')
    if sr!=SR: raise SystemExit('sample rate mismatch')
    i=int((st[sc['key']]+LEAD)*SR); nar[i:i+len(x)]+=x[:len(nar)-i]; D=len(x)/SR
    parts=[]
    for p in re.split(r'(?<=[.?!])\s+',sc['narration']):
        p=p.strip()
        if not p: continue
        if len(p)>30 and ',' in p: a,b=p.split(',',1); parts+=[a.strip()+',',b.strip()]
        else: parts.append(p)
    tot=sum(map(len,parts)); t=st[sc['key']]+LEAD
    for c in parts:
        d=D*len(c)/tot; srt.append(f"{n}\n{fmt(t)} --> {fmt(t+d-0.05)}\n{c}\n"); n+=1; t+=d
nar/=max(1e-6,np.abs(nar).max())/0.95; sf.write(W+'/narration.wav',nar,SR)
open(W+'/subs.srt','w').write('\n'.join(srt))
# 유튜브 목차: 0:00 제목 + 챕터가 시작하는 장면(챕터 카드 3초 앞당김)
ch=['0:00 '+S['meta'].get('chapter0','소개')]
for sc in S['scenes']:
    if sc.get('chapter'):
        t=max(0,st[sc['key']]-3); c=sc['chapter']; ch.append(f"{int(t//60)}:{int(t%60):02} {c.get('yt',c['title'])}")
t=st['outro']; ch.append(f"{int(t//60)}:{int(t%60):02} 마무리")
open(W+'/chapters.txt','w').write('\n'.join(ch)); print('\n'.join(ch)); print('video length %.1fs'%T)
