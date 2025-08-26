import axios from 'axios'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'


export async function transcribeFile(blob: Blob, withTimestamp: boolean) {
const form = new FormData()
form.append('file', new File([blob], 'upload.bin'))
form.append('with_timestamp', String(withTimestamp))


const { data } = await axios.post(`${API_BASE}/transcribe`, form, {
headers: { 'Content-Type': 'multipart/form-data' }
})
return data as { text?: string; error?: string }
}