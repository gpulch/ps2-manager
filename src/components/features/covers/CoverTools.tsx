import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { saveCoverFromUrl, saveCoverFromFile, autoFetchCover } from '../../../actions/covers'
import { Input } from '../../../ui/Input'
import { Button } from '../../../ui/Button'

type Props = {
  root: string | null
  onSaved: (id: string, path: string) => void
}

const IMAGE_FILTERS = [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]

const handleAsyncOperation = async (
  operation: () => Promise<string>,
  onSuccess: (dest: string) => void,
  setMsg: (msg: string) => void
): Promise<void> => {
  setMsg('')
  try {
    const dest = await operation()
    setMsg(`Saved to ${dest}`)
    onSuccess(dest)
  } catch (error) {
    setMsg(String(error))
  }
}

export const CoverTools = ({ root, onSaved }: Props) => {
  const [coverId, setCoverId] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const onSaveUrl = async (): Promise<void> => {
    if (!root || !coverId || !coverUrl) return
    await handleAsyncOperation(
      () => saveCoverFromUrl(root, coverId, coverUrl),
      (dest) => onSaved(coverId, dest),
      setMsg
    )
  }

  const onSaveFile = async (): Promise<void> => {
    if (!root || !coverId) return
    const file = await open({ multiple: false, filters: IMAGE_FILTERS })
    if (!file || Array.isArray(file)) return
    await handleAsyncOperation(
      () => saveCoverFromFile(root, coverId, file),
      (dest) => onSaved(coverId, dest),
      setMsg
    )
  }

  const onAutoFetch = async (): Promise<void> => {
    if (!root || !coverId) return
    await handleAsyncOperation(
      () => autoFetchCover(root, coverId, null, true),
      (dest) => onSaved(coverId, dest),
      setMsg
    )
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
