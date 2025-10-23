import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { saveCoverFromUrl, saveCoverFromFile, autoFetchCover } from '../actions/covers'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

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
    <div className="section">
      <h3>Cover tools</h3>
      <div className="row toolbar">
        <Input placeholder="Game ID (e.g. SLUS_203.12)" value={coverId} onChange={(e) => setCoverId(e.target.value)} />
        <Input className="w-full" placeholder="Image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
        <Button onClick={onSaveUrl}>Save cover from URL</Button>
        <Button onClick={onSaveFile}>Save cover from file</Button>
        <Button onClick={onAutoFetch}>Auto-fetch cover</Button>
      </div>
      {msg && <div className="section"><code>{msg}</code></div>}
    </div>
  )
}
