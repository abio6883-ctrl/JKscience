"""장면 대본(scenes.json)의 narration을 밝은 한국어 음성으로 만든다.
사용: python3 tts.py <작업폴더>   →  <작업폴더>/voice/<key>.wav, voice/dur.json
기본 목소리 sid=1(밝은 여성, 약 228Hz), 속도 1.08. scenes.json의 "voice":{"sid":..,"speed":..}로 바꿀 수 있다."""
import json, os, sys, numpy as np, soundfile as sf, sherpa_onnx
M=os.environ.get('MODELS','/home/claude/vk-models'); D=M+'/sherpa-onnx-supertonic-3-tts-int8-2026-05-11/'
def make():
    c=sherpa_onnx.OfflineTtsSupertonicModelConfig(duration_predictor=D+'duration_predictor.int8.onnx',text_encoder=D+'text_encoder.int8.onnx',
      vector_estimator=D+'vector_estimator.int8.onnx',vocoder=D+'vocoder.int8.onnx',tts_json=D+'tts.json',unicode_indexer=D+'unicode_indexer.bin',voice_style=D+'voice.bin')
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(supertonic=c,num_threads=2,provider='cpu')))
def say(tts,text,out,sid=1,speed=1.08,steps=12):
    g=sherpa_onnx.GenerationConfig(); g.sid=sid; g.num_steps=steps; g.speed=speed; g.extra['lang']='ko'
    a=tts.generate(text,g); x=np.array(a.samples,dtype='float32'); x=x/max(1e-6,np.abs(x).max())*0.92
    sf.write(out,x,a.sample_rate,subtype='PCM_16'); return len(x)/a.sample_rate
if __name__=='__main__':
    W=sys.argv[1]; S=json.load(open(W+'/scenes.json')); v=S.get('voice',{}); os.makedirs(W+'/voice',exist_ok=True)
    tts=make(); dur={}
    only=set(sys.argv[2:])
    old=json.load(open(W+'/voice/dur.json')) if os.path.exists(W+'/voice/dur.json') else {}
    for sc in S['scenes']:
        k=sc['key']
        if only and k not in only: dur[k]=old.get(k,0); continue
        dur[k]=say(tts,sc.get('say',sc['narration']),f"{W}/voice/{k}.wav",sid=v.get('sid',1),speed=v.get('speed',1.08))
    json.dump(dur,open(W+'/voice/dur.json','w'),indent=0)
    print('total narration %.1fs'%sum(dur.values()))
