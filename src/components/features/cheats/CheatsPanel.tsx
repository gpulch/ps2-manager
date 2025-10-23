import { useState } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { loadCheat, saveCheat, importCheat, exportCheat } from '../../../actions/cheats'
import { Input } from '../../../ui/Input'
import { Button } from '../../../ui/Button'
import { PageLayout } from '../../layout/PageLayout'

type Props = { cheatRoot: string | null }

const CHEAT_FILTERS = [{ name: 'Cheat', extensions: ['cht'] }]

const handleCheatOperation = async <T,>(
  operation: () => Promise<T>,
  onSuccess: (result: T) => void,
  setMessage: (msg: string) => void,
  setBusy?: (busy: boolean) => void
): Promise<void> => {
  setBusy?.(true)
  setMessage('')
  try {
    const result = await operation()
    onSuccess(result)
  } catch (error) {
    setMessage(String(error))
  } finally {
    setBusy?.(false)
  }
}

export const CheatsPanel = ({ cheatRoot }: Props) => {
  const [cheatId, setCheatId] = useState('')
  const [cheatText, setCheatText] = useState('')
  const [cheatMsg, setCheatMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [openPanel, setOpenPanel] = useState(false)

  const onLoad = async (): Promise<void> => {
    if (!cheatRoot || !cheatId) return
    await handleCheatOperation(
      () => loadCheat(cheatRoot, cheatId),
      setCheatText,
      setCheatMsg,
      setBusy
    )
  }

  const onSave = async (): Promise<void> => {
    if (!cheatRoot || !cheatId) return
    await handleCheatOperation(
      () => saveCheat(cheatRoot, cheatId, cheatText),
      (path) => setCheatMsg(`Saved to ${path}`),
      setCheatMsg,
      setBusy
    )
  }

  const onImport = async (): Promise<void> => {
    if (!cheatRoot) return
    const file = await open({ multiple: false, filters: CHEAT_FILTERS })
    if (!file || Array.isArray(file)) return
    await handleCheatOperation(
      () => importCheat(cheatRoot, cheatId || null, file),
      async (path) => {
        setCheatMsg(`Imported to ${path}`)
        if (cheatId) await onLoad()
      },
      setCheatMsg
    )
  }

  const onExport = async (): Promise<void> => {
    if (!cheatRoot || !cheatId) return
    const dest = await save({ defaultPath: `${cheatId}.cht` })
    if (!dest) return
    await handleCheatOperation(
      () => exportCheat(cheatRoot, cheatId, dest),
      (path) => setCheatMsg(`Exported to ${path}`),
      setCheatMsg
    )
  }

  return (
    <PageLayout 
      title="Cheat Manager (.CHT)"
      actions={<Button onClick={() => setOpenPanel(v => !v)}>{openPanel ? 'Hide' : 'Show'}</Button>}
    >
      {openPanel && (
        <>
          <div className="row toolbar">
            <Input placeholder="Game ID (e.g. SLUS_203.12)" value={cheatId} onChange={(e) => setCheatId(e.target.value)} />
            <Button onClick={onLoad} disabled={busy}>{busy ? 'Loading...' : 'Load'}</Button>
            <Button onClick={onSave} disabled={busy || !cheatId}>{busy ? 'Saving...' : 'Save'}</Button>
            <Button onClick={onImport} disabled={busy}>Import (.CHT)</Button>
            <Button onClick={onExport} disabled={busy || !cheatId}>Export (.CHT)</Button>
          </div>
          <textarea className="textarea fullwidth" value={cheatText} onChange={(e) => setCheatText(e.target.value)} rows={10} />
          {cheatMsg && <div className="section"><code>{cheatMsg}</code></div>}
        </>
      )}
    </PageLayout>
  )
}
