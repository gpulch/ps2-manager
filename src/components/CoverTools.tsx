import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { saveCoverFromUrl, saveCoverFromFile, autoFetchCover } from '../actions/covers'

type Props = {
  root: string | null
  onSaved: (id: string, path: string) => void
}

export const CoverTools = ({ root, onSaved }: Props) => {
  const [coverId, setCoverId] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const onSaveUrl = async () => {
    if (!root || !coverId || !coverUrl) return
    setMsg(null)
    try { const dest = await saveCoverFromUrl(root, coverId, coverUrl); setMsg(`Saved to ${dest}`); onSaved(coverId, dest) } catch (e: any) { setMsg(String(e)) }
  }

  const onSaveFile = async () => {
    if (!root || !coverId) return
    setMsg(null)
    const file = await open({ multiple: false, filters: [{ name: 'Images', extensions: ['png','jpg','jpeg','gif','webp'] }] })
    if (!file || Array.isArray(file)) return
    try { const dest = await saveCoverFromFile(root, coverId, file as string); setMsg(`Saved to ${dest}`); onSaved(coverId, dest) } catch (e: any) { setMsg(String(e)) }
  }

  const onAutoFetch = async () => {
    if (!root || !coverId) return
    setMsg(null)
    try { const dest = await autoFetchCover(root, coverId, null, true); setMsg(`Fetched to ${dest}`); onSaved(coverId, dest) } catch (e: any) { setMsg(String(e)) }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Cover tools</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="Game ID (e.g. SLUS_203.12)" value={coverId} onChange={(e) => setCoverId(e.target.value)} />
        <input placeholder="Image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ minWidth: 320 }} />
        <button onClick={onSaveUrl}>Save cover from URL</button>
        <button onClick={onSaveFile}>Save cover from file</button>
        <button onClick={onAutoFetch}>Auto-fetch cover</button>
      </div>
      {msg && <div style={{ marginTop: 8 }}><code>{msg}</code></div>}
    </div>
  )
}
