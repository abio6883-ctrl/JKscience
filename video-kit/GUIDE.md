---
name: lab-youtube-video
description: 가상실험실 웹주소로 밝은 AI 목소리·밝은 배경음악·모션그래픽이 들어간 10분 이내 유튜브 소개 영상, 클릭 유도 썸네일, 제목·설명(더보기란에 실험실 주소)·태그를 만들고 유튜브 업로드까지 도울 때 사용.
---

# 가상실험실 유튜브 영상 제작 지침서

이재광 선생님의 가상실험실(https://abio6883-ctrl.github.io/JKscience/<폴더명>/)을 **학생과 외부인이 보고 싶어지는 짧은 사용 안내 영상**으로 만든다. 결과물은 ① 영상(mp4, 1080p, 10분 이내) ② 썸네일(1280×720) ③ 유튜브 제목·설명·태그·고정 댓글 ④ (가능하면) 유튜브 업로드다.

```
0. 준비 → 1. 대본(scenes.json) → 2. 음성·발음 검사 → 3. 화면 동작(actions.js) → 4. 녹화·합성 → 5. 썸네일·설명 → 6. 검증 → 7. 업로드·전달
```

도구는 JKscience 저장소의 `video-kit/` 폴더에 있다(README 참고). 저장소는 `add_repo(abio6883-ctrl, JKscience, push)` 후 `/home/claude/jkscience`에 clone 한다.

---

## 0. 준비
- `cd /home/claude/jkscience/video-kit && ./setup.sh` → `export MODELS=/home/claude/vk-models`
  - Supertonic 3 TTS, 한국어 zipformer ASR을 **GitHub releases**에서 받는다(Hugging Face·Google TTS는 막혀 있음).
- 실험실 파일은 로컬 복제본을 쓴다: `export LAB_URL=file:///home/claude/jkscience/<폴더명>/index.html` (작업 환경에서 github.io 접속 불가).
- 새 작업 폴더: `video-kit/labs/<폴더명>/` (실험실 폴더명과 같게).
- 실험실 제작 노트(프로젝트 문서)를 읽고 교과서 실험명·탭 구성·셀렉터를 파악한다.

## 1. 대본 — `scenes.json`
```json
{ "meta": { "title","subtitle","grade","unit","emoji","tags":[3개],"credit":"Made by Lee Jae Kwang",
            "url","standard","chapter0":"소개 · 생각 열기",
            "thumb": {"line1","line2","hl","badge","corner","emoji"},
            "youtube": {"title","hook","about","howto","hashtags":[],"tags":[],"pin","visibility":"unlisted"} },
  "voice": {"sid":1,"speed":1.08},
  "scenes": [ {"key":"title","narration":"…"},
              {"key":"route","chapter":{"num":"02","title":"요소의 배설 경로","sub":"교과서 분석해 보기","tag":"실험 ①","yt":"실험 ① …"},"narration":"…"},
              {"key":"neph3","narration":"…","say":"발음용 문장(선택)","pad":0.6},
              {"key":"outro","narration":"…"} ] }
```
**길이 규칙**: 전체 10분 이내, 권장 3~8분. 내레이션 합계 약 1,200~2,500자(≈ 2.5~5분 음성) + 조작 시간. 장면 20~30개, 장면당 1~3문장.

**흐름**: 제목 → 생각 열기(질문으로 시작) → 01 개념 → 02~05 **교과서 실험마다 챕터 카드 1개** → 06 정리(스티커·실생활·퀴즈) → 마무리(QR·"더보기란 주소를 눌러 보세요").

**말투**: 밝고 친근한 해요체. "~볼까요?", "~네요!", "쾅!" 같은 리듬. 한 문장 40자 안팎. 과학 용어는 교과서 용어 그대로, 숫자는 한글로 읽히게("육백 밀리리터"). 과학 내용은 실험실과 같은 개념 검토 기준을 따른다.

## 2. 음성과 발음 검사
- `python3 tts.py $W` → `voice/<key>.wav`, `dur.json`
- 목소리: **sid 1(가장 밝은 여성, 중앙 피치 약 228Hz), 속도 1.08**. 남성 목소리를 원하면 sid 5~9.
- `python3 asr_check.py $W` → 장면별 일치율. **85% 미만은 `say`에 띄어쓰기·쉼표를 바꾼 발음용 문장을 넣고** `python3 tts.py $W <key…>`로 그 장면만 다시 만든다(예: "콩팥단위" → "콩팥 단위"). 전문 용어 몇 개가 ASR에서 틀리는 것은 정상이므로 85% 이상이면 통과.

## 3. 화면 동작 — `actions.js`
```js
module.exports.run  = async H => { await H.goto(LAB); await H.scene('intro', async () => { await H.tap('#drinkBtn'); await H.callout('#drinkBtn','눌러 보세요!'); }); … };
module.exports.shot = async H => { /* 핵심 실험 화면을 만들고 sticky 헤더를 static으로 바꾼 뒤 */ await el.screenshot({ path: H.W + '/shot.png' }); };
```
- `H.tap(sel,{fast,after,noScroll})`: 부드럽게 스크롤 → 위치가 멈출 때까지 기다림 → 포인터 이동 → 탭 효과 → 클릭.
- `H.drag(points)`, `H.view(sel)`, `H.eval(fn,arg)`, `H.goto2()`(오버레이 재확인)
- 모션그래픽: `H.spot(sel,ms)` 스포트라이트(주변 어둡게), `H.callout(sel,'문구',색,ms)` 노란 말풍선 스티커. **장면마다 1개 정도**, 실험 결과가 바뀌는 순간에 쓴다.
- 챕터 카드·자막 바·챕터 칩·진행 막대는 `scenes.json`만으로 자동으로 들어간다.
- **안정성 규칙**: 탭·아코디언·화면 이동은 빗나갈 수 있으니 보정 도우미를 둔다 — `acc(H,i)`(열림 확인 후 click), `tab(H,k)`(`#tab-k`가 안 보이면 click), `step(H,sel,i)`(`screen` 활성 아니면 `goTo(i)`). 시뮬레이션은 버튼 활성화(`waitForFunction`)를 기다린다.
- 한 장면 길이는 `max(조작 시간, 음성 길이 + pad)`. 조작이 음성보다 훨씬 길면(자동 재생 등) 대본을 늘리거나 조작을 줄인다.

## 4. 녹화와 합성
```bash
node record.js $W shot && python3 cards.py $W   # 썸네일용 캡처, 제목·마무리 카드
node record.js $W                               # 1280×720 DPR 1 녹화(DPR을 올리면 화면이 한쪽에 몰림)
python3 mix.py $W                               # narration.wav, subs.srt, chapters.txt
python3 bgm.py <총초+2> $W/bgm.wav bright       # 112BPM 마림바·벨, C–G–Am–F (차분하게: calm)
./render.sh $W $W/video.mp4 [음악볼륨 0.18]     # 1080p lanczos, 덕킹, -14 LUFS, x264 crf19
```
- 자막은 영상 안 오버레이로 들어가므로 따로 입히지 않는다. `subs.srt`는 유튜브 자막으로 올린다.
- 배경음악은 직접 생성한 것이라 저작권 문제가 없다(외부 음원 사용 금지).

## 5. 썸네일과 유튜브 문구
- `python3 thumbnail.py $W` → `thumbnail.png`(1280×720), `thumbnail_small.png`(320×180)
  - **디자인 규칙**: 보라→핑크 그라데이션 + 방사선 / 오른쪽에 기울어진 태블릿 속 실제 실험 화면 / 왼쪽에 **두 줄, 8~12자, 질문·반전형 문구**("콩팥이 / 오줌을 만든다고?"), 핵심 단어 1개 노란색 / 위 노란 코너 띠(학년·단원) / 아래 초록 배지(행동 유도: "직접 실험해 봐!") / 큰 이모지 + 👉.
  - 굵은 흰 글씨 + 짙은 외곽선(축소해도 읽힘). 줄이 넘치면 자동으로 글자를 줄여 한 줄 유지.
  - **320×180 축소본에서 문구가 읽히는지 반드시 눈으로 확인.**
- `python3 youtube_meta.py $W` → `youtube.json`, `youtube_설명.txt`
  - 제목: `질문형 훅 + 이모지 | 배설계 가상실험실 | 중2 과학 단원` (100자 이내, 앞 40자에 핵심어)
  - 설명 **첫 두 줄**: 한 줄 소개 + `👉 가상실험실 바로 가기: <주소>` (더보기 전에 보이도록)
  - 이어서: 무엇을 하는지(✔ 목록) → ⏱ 목차(chapters.txt, 0:00부터) → 📌 성취기준 → 🧪 활용법 → 크레딧(Made by Lee Jae Kwang · AI 음성 · 자체 제작 음악) → 해시태그 3~8개
  - 고정 댓글: 실험실 주소 한 줄. 태그 10~15개. 공개 범위 기본 **일부 공개(unlisted)**, 시청자층 "아동용 아님"(교사 대상 사용 안내).

## 6. 검증 (전달 전)
1. `asr_check` 전 장면 85% 이상
2. 영상 길이 600초 미만 (`ffprobe`)
3. 시점별 프레임 12장 시트를 만들어 직접 보기: 제목 카드 글자 줄바꿈, 자막과 화면 겹침, 스티커 완성·실험 결과가 실제로 보이는지, 회색 여백 없음
4. 음량: 통합 약 -14~-16 LUFS, 말 사이 음악이 말보다 확실히 작음
5. 썸네일 원본·축소본 확인
6. 녹화 로그 `errors none`

## 7. 업로드와 전달
- 유튜브 업로드 커넥터는 없다. 사용자가 원하면 **Claude in Chrome으로 YouTube Studio**(studio.youtube.com)를 열어 진행한다: 파일 선택(사용자가 다운로드한 mp4) → 제목·설명·태그 붙여넣기 → 썸네일 업로드 → 자막(srt) 추가 → "아동용 아님" → 공개 범위.
  - **공개 범위를 정하거나 게시 버튼을 누르기 전에는 반드시 사용자에게 확인**한다. 로그인은 사용자가 직접 한다.
  - 브라우저를 쓸 수 없으면 "업로드 꾸러미"(mp4·썸네일·설명 txt·srt)와 붙여넣기 순서를 안내한다.
- 사용자에게 보낼 것: 영상 mp4, 썸네일 png, 설명 txt, 자막 srt. 결과 보고는 영상 길이·구성(챕터)·검증 한 줄.
- `video-kit/labs/<폴더명>/`의 scenes.json·actions.js·썸네일·설명을 커밋한다(`Add <실험실> 소개 영상 대본` + attribution). 무거운 wav·mp4·raw는 .gitignore로 제외.
- 실험실 제작 노트에 "영상" 항목(길이·업로드 주소·날짜)을 한 줄 추가한다.

Made by Lee Jae Kwang
