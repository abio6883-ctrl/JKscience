"""만든 음성을 한국어 음성 인식으로 되돌려 대본과 비교한다(직접 들을 수 없을 때의 품질 점검).
사용: python3 asr_check.py <작업폴더>   → 장면별 일치율(%)과 인식 결과. 85% 미만이면 문장을 바꿔 다시 만든다."""
import json, os, sys, glob, difflib, re, soundfile as sf, sherpa_onnx
M=os.environ.get('MODELS','/home/claude/vk-models'); d=M+'/sherpa-onnx-zipformer-korean-2024-06-24/'
f=lambda p,i: [x for x in glob.glob(d+p+'*.onnx') if ('int8' in x)==i][0]
r=sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f('encoder',True),decoder=f('decoder',False),joiner=f('joiner',True),tokens=d+'tokens.txt',num_threads=2)
W=sys.argv[1]; S=json.load(open(W+'/scenes.json')); norm=lambda s: re.sub(r'[^가-힣0-9a-zA-Z]','',s)
bad=0
for sc in S['scenes']:
    a,sr=sf.read(f"{W}/voice/{sc['key']}.wav",dtype='float32'); s=r.create_stream(); s.accept_waveform(sr,a); r.decode_stream(s)
    ratio=difflib.SequenceMatcher(None,norm(sc['narration']),norm(s.result.text)).ratio()*100
    flag='  ⚠️' if ratio<85 else ''; bad+=ratio<85
    print(f"{sc['key']:10s} {ratio:5.1f}%{flag}  {s.result.text}")
print('needs-fix:',bad)
