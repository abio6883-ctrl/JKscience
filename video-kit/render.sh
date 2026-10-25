#!/usr/bin/env bash
# 최종 영상: 1080p 업스케일 + 내레이션 + 밝은 배경음악(목소리 나올 때 자동으로 작아짐) + 유튜브 권장 음량(-14 LUFS)
# 사용: ./render.sh <작업폴더> <출력.mp4> [음악볼륨 기본 0.18]
set -e; W=$1; OUT=$2; MV=${3:-0.18}; V=$(ls -t $W/raw/*.webm | head -1)
ffmpeg -v error -y -i "$V" -i $W/narration.wav -i $W/bgm.wav -filter_complex "\
[0:v]scale=1920:1080:flags=lanczos,format=yuv420p[v];\
[1:a]aformat=channel_layouts=stereo,asplit=2[n1][n2];[2:a]volume=$MV[m];\
[m][n1]sidechaincompress=threshold=0.02:ratio=5:attack=30:release=650[md];\
[md][n2]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=14[a]" \
-map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 19 -r 30 -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
