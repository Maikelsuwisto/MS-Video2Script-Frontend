import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'


let ffmpeg: any


export async function ensureFFmpeg() {
if (!ffmpeg) {
ffmpeg = createFFmpeg({ log: false })
await ffmpeg.load()
}
return ffmpeg
}


export async function videoToWavBlob(file: File): Promise<Blob> {
const ff = await ensureFFmpeg()
const inName = file.name
const outName = 'output.wav'


ff.FS('writeFile', inName, await fetchFile(file))
// 16kHz mono wav for Whisper
await ff.run('-i', inName, '-vn', '-ar', '16000', '-ac', '1', outName)
const data = ff.FS('readFile', outName)


// Cleanup (best effort)
try { ff.FS('unlink', inName) } catch {}
try { ff.FS('unlink', outName) } catch {}


return new Blob([data.buffer], { type: 'audio/wav' })
}