# video-kit — 가상실험실 유튜브 소개 영상 제작 도구

가상실험실 웹주소 하나로 **밝은 AI 목소리 + 밝은 배경음악 + 모션그래픽 + 클릭 유도 썸네일 + 유튜브 제목·설명·태그**를 만든다. 영상 길이는 10분 이내(권장 3~8분).

## 준비 (세션마다 한 번)
```bash
cd video-kit && ./setup.sh          # pip 패키지 + Supertonic 3 TTS + 한국어 ASR 모델(GitHub releases)
export MODELS=/home/claude/vk-models
```

## 새 실험실 영상 만들기
1. `labs/<폴더명>/scenes.json` — meta(제목·주소·썸네일·유튜브 문구) + voice + scenes(장면별 내레이션, 챕터)
2. `labs/<폴더명>/actions.js` — `run(H)`: 장면별 화면 조작, `shot(H)`: 썸네일용 실험실 캡처
3. 실행
```bash
W=labs/<폴더명>; export LAB_URL=file:///home/claude/jkscience/<폴더명>/index.html
python3 tts.py $W && python3 asr_check.py $W          # 85% 미만 장면은 "say"(발음용 문장) 추가 후 재생성
node record.js $W shot && python3 cards.py $W         # 실험실 캡처 → 제목·마무리 카드
node record.js $W                                     # 화면 녹화(모션그래픽 오버레이 포함)
python3 mix.py $W                                     # 내레이션 합치기 + subs.srt + chapters.txt
python3 bgm.py $(( $(python3 -c "import json;print(int(json.load(open('$W/timeline.json'))['total']))") + 2 )) $W/bgm.wav bright
./render.sh $W $W/video.mp4                           # 1080p, 음악 자동 덕킹, -14 LUFS
python3 thumbnail.py $W && python3 youtube_meta.py $W # 썸네일 1280×720 + 설명란 문구
```

## 파일
| 파일 | 역할 |
|---|---|
| tts.py / asr_check.py | Supertonic 3 한국어 음성(기본 sid 1, 속도 1.08) / 음성 인식으로 발음 검사 |
| bgm.py | 저작권 걱정 없는 자체 생성 음악 (`bright` 112BPM 마림바·벨 / `calm` 92BPM) |
| overlay.js | 녹화 중 주입: 챕터 카드, 자막 바, 챕터 칩, 진행 막대, 터치 포인터, 스포트라이트, 말풍선 |
| record.js | Playwright 녹화 엔진 (H.tap / H.drag / H.spot / H.callout / H.scene) |
| cards.py | 제목·마무리(QR) 카드 |
| mix.py / render.sh | 오디오·자막·챕터 / 최종 합성 |
| thumbnail.py | 클릭 유도 썸네일 (+ 320×180 축소본으로 가독성 확인) |
| youtube_meta.py | 제목·설명(첫 줄에 실험실 주소)·목차·태그·고정 댓글 |

Made by Lee Jae Kwang
