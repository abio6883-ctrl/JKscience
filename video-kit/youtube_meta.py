"""유튜브 업로드 정보(제목·설명·태그·고정 댓글)를 만든다. 더보기란 첫 줄에 가상실험실 주소를 넣는다.
사용: python3 youtube_meta.py <작업폴더>  → youtube.json, youtube_설명.txt"""
import json, sys
W=sys.argv[1]; S=json.load(open(W+'/scenes.json')); m=S['meta']; y=m['youtube']
chap=open(W+'/chapters.txt').read().strip()
desc=f"""🔬 {y['hook']}
👉 가상실험실 바로 가기(태블릿·PC·휴대폰): {m['url']}

{y['about']}

⏱ 목차
{chap}

📌 성취기준 {m['standard']}
🧪 이렇게 활용해요: {y['howto']}

{m.get('credit','')} · 내레이션: AI 음성(Supertonic 3) · 배경 음악: 직접 제작(저작권 걱정 없음)

{' '.join('#'+h for h in y['hashtags'])}"""
title=y['title']
if len(title)>100: raise SystemExit('title too long (>100)')
out={'title':title,'description':desc,'tags':y['tags'],'pinned_comment':f"📌 실험실 주소: {m['url']}  — {y.get('pin','직접 눌러 보며 따라 해 보세요!')}",
     'category':'교육','audience':'아동용 아님(교사·학생 대상 교육 영상) — 업로드 시 직접 확인','visibility':y.get('visibility','unlisted')}
json.dump(out,open(W+'/youtube.json','w'),ensure_ascii=False,indent=1)
open(W+'/youtube_설명.txt','w').write(f"[제목]\n{title}\n\n[설명]\n{desc}\n\n[태그]\n{', '.join(y['tags'])}\n\n[고정 댓글]\n{out['pinned_comment']}\n")
print(title); print(len(desc),'chars')
