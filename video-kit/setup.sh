#!/usr/bin/env bash
# 영상 키트 준비: 파이썬 패키지 + 음성(Supertonic 3) + 음성 인식(한국어) 모델. 한 번만 하면 된다.
set -e
M=${MODELS:-/home/claude/vk-models}; mkdir -p "$M"
pip install --break-system-packages -q -U "sherpa-onnx>=2" soundfile numpy qrcode pillow 2>&1 | grep -vi warning || true
R=https://github.com/k2-fsa/sherpa-onnx/releases/download
if [ ! -d "$M/sherpa-onnx-supertonic-3-tts-int8-2026-05-11" ]; then
  curl -sL -m 900 -o "$M/st.tar.bz2" $R/tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2 && tar xjf "$M/st.tar.bz2" -C "$M" && rm "$M/st.tar.bz2"; fi
if [ ! -d "$M/sherpa-onnx-zipformer-korean-2024-06-24" ]; then
  curl -sL -m 900 -o "$M/asr.tar.bz2" $R/asr-models/sherpa-onnx-zipformer-korean-2024-06-24.tar.bz2 && tar xjf "$M/asr.tar.bz2" -C "$M" && rm "$M/asr.tar.bz2"; fi
echo "models ready in $M"
