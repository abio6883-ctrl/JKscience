// scenes.json의 장면마다 Microsoft 자연 음성(SunHi)으로 MP3를 만든다.
// 실행: node tts.js [장면key ...]   (key를 주면 그 장면만 다시 만든다)
const path = require('path');
const fs = require('fs');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICE = process.env.VOICE || 'ko-KR-SunHiNeural';
const RATE = process.env.RATE || '+8%';
const { scenes } = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenes.json'), 'utf8'));
const only = process.argv.slice(2);

(async () => {
  const out = path.join(__dirname, 'audio');
  fs.mkdirSync(out, { recursive: true });
  for (const s of scenes) {
    if (only.length && !only.includes(s.key)) continue;
    const text = s.say || s.text;
    for (let tryN = 0; tryN < 10; tryN++) {
      try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
        const tmp = fs.mkdtempSync(path.join(out, 'tmp-'));
        const { audioFilePath } = await tts.toFile(tmp, text, { rate: RATE });
        const dest = path.join(out, s.key + '.mp3');
        fs.renameSync(audioFilePath, dest);
        fs.rmSync(tmp, { recursive: true, force: true });
        tts.close();
        console.log(s.key, (fs.statSync(dest).size / 12000).toFixed(2) + 's');
        break;
      } catch (e) { console.error('retry', s.key, e.message); }
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
