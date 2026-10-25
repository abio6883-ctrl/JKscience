"""밝고 경쾌한 배경 음악을 직접 합성한다(저작권 걱정 없음).
사용: python3 bgm.py <길이초> <출력.wav> [bright|calm] [seed]
bright: 112 BPM, C장조 I–V–vi–IV, 마림바 아르페지오 + 벨 멜로디 + 베이스 + 박수·셰이커
calm  : 92 BPM, 부드러운 전자피아노 + 패드 (설명이 많은 장면용)"""
import sys, numpy as np, soundfile as sf
from numpy.fft import rfft, irfft
T=float(sys.argv[1]); OUT=sys.argv[2]; STYLE=sys.argv[3] if len(sys.argv)>3 else 'bright'; SEED=int(sys.argv[4]) if len(sys.argv)>4 else 3
SR=44100; rng=np.random.default_rng(SEED)
BPM=112 if STYLE=='bright' else 92; beat=60/BPM; bar=beat*4
N=int(SR*(T+1)); L=np.zeros(N); R=np.zeros(N)
hz=lambda m: 440*2**((m-69)/12)
def add(start,sig,g=1.0,pan=0.5):
    i=int(start*SR); j=min(N,i+len(sig))
    if 0<=i<N: L[i:j]+=sig[:j-i]*g*(1-pan)*2**.5; R[i:j]+=sig[:j-i]*g*pan*2**.5
def tt(d): return np.arange(int(SR*d))/SR
def marimba(f,d=0.45):
    t=tt(d); return (np.sin(2*np.pi*f*t)+0.25*np.sin(2*np.pi*f*4*t)*np.exp(-t*30))*np.exp(-t*9)*(1-np.exp(-t*800))
def bell(f,d=1.2):
    t=tt(d); return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*5)+0.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*9))*np.exp(-t*3.5)*(1-np.exp(-t*900))
def epiano(f,d):
    t=tt(d); return (np.sin(2*np.pi*f*t)+0.3*np.sin(4*np.pi*f*t)*np.exp(-t*5))*np.exp(-t*2.6)*(1-np.exp(-t*300))
def pad(f,d):
    t=tt(d); a=np.minimum(1,t/0.4)*np.minimum(1,(d-t)/0.4); return (np.sin(2*np.pi*f*t)+0.5*np.sin(2*np.pi*f*1.004*t))*a
def bass(f,d):
    t=tt(d); return (np.sin(2*np.pi*f*t)+0.3*np.sin(4*np.pi*f*t))*np.exp(-t*4)*(1-np.exp(-t*200))
def kick():
    t=tt(0.28); return np.sin(2*np.pi*(50+90*np.exp(-t*35))*t)*np.exp(-t*13)
def noise_hit(d,dec,hp=True):
    t=tt(d); n=rng.standard_normal(len(t))
    if hp: n=np.diff(np.concatenate([[0],n]))
    return n*np.exp(-t*dec)
def clap():
    L=int(SR*0.15); s=np.zeros(L)
    for k in range(3): h=np.pad(noise_hit(0.12,35),(int(SR*k*0.011),L))[:L]; s+=h
    return s
if STYLE=='bright':
    prog=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]      # C G Am F
    melody=[[76,None,79,None,81,79,76,None],[74,None,71,None,74,76,74,None],[72,None,76,None,79,None,76,74],[72,None,69,None,72,None,None,None]]
else:
    prog=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]]
    melody=None
nb=int(T/bar)+2
for b in range(nb):
    ch=prog[b%4]; s=b*bar; sec=(b//8)%4    # 8마디마다 편성을 조금씩 바꿔 지루하지 않게
    for f in ch: add(s,pad(hz(f),bar),0.022,0.5)
    if STYLE=='bright':
        for q in range(8):                             # 마림바 8분음표 아르페지오
            f=ch[[0,1,2,1,0,2,1,2][q]]+12; add(s+q*beat/2,marimba(hz(f)),0.16,0.35+0.3*(q%2))
        for q in [0,1.5,2,3.5]: add(s+q*beat,bass(hz(ch[0]-24),beat*0.9),0.20)
        if b>=2:
            for q in [0,2]: add(s+q*beat,kick(),0.26)
            for q in [1,3]: add(s+q*beat,clap(),0.07,0.55)
            for q in range(8): add(s+q*beat/2+beat/4,noise_hit(0.04,90),0.018,0.65)
        if b>=4 and sec in (1,3):                      # 벨 멜로디(후렴 느낌)
            for q,m in enumerate(melody[b%4]):
                if m: add(s+q*beat/2,bell(hz(m)),0.10,0.45)
    else:
        add(s,epiano(hz(ch[0]),beat*2),0.14); add(s+beat*2,epiano(hz(ch[1]),beat*2),0.10)
        for q in range(8): add(s+q*beat/2,epiano(hz(ch[q%len(ch)]+12),beat),0.05,0.3+0.4*(q%2))
        if b>=4:
            for q in [0,2]: add(s+q*beat,kick(),0.18)
            for q in range(4): add(s+q*beat+beat/2,noise_hit(0.05,70),0.02,0.6)
ir_t=tt(0.9); ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*6)*0.015; ir[0]=1
def conv(x):
    n=len(x)+len(ir); m=1<<(n-1).bit_length(); return irfft(rfft(x,m)*rfft(ir,m),m)[:len(x)]
L=conv(L)[:int(SR*T)]; R=conv(R)[:int(SR*T)]; n=len(L)
fade=np.ones(n); fi=int(SR*1.5); fo=int(SR*3.5); fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
st=np.stack([L*fade,R*fade],1); st=np.tanh(st/np.abs(st).max()*1.2)/np.tanh(1.2)*0.85
sf.write(OUT,st.astype('float32'),SR); print('bgm',STYLE,BPM,'bpm',round(T,1),'s')
