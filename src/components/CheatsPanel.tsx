import { useState } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { loadCheat, saveCheat, importCheat, exportCheat } from '../actions/cheats'

type Props = { cheatRoot: string | null }

export const CheatsPanel = ({ cheatRoot }: Props) => {
  const [cheatId, setCheatId] = useState('')
  const [cheatText, setCheatText] = useState('')
  const [cheatMsg, setCheatMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onLoad = async () => {
    if (!cheatRoot || !cheatId) return
    setBusy(true); setCheatMsg(null)
    try { setCheatText(await loadCheat(cheatRoot, cheatId)) } catch (e: any) { setCheatMsg(String(e)) } finally { setBusy(false) }
  }

  const onSave = async () => {
    if (!cheatRoot || !cheatId) return
    setBusy(true); setCheatMsg(null)
    try { const p = await saveCheat(cheatRoot, cheatId, cheatText); setCheatMsg(`Saved to ${p}`) } catch (e: any) { setCheatMsg(String(e)) } finally { setBusy(false) }
  }

  const onImport = async () => {
    if (!cheatRoot) return
    const file = await open({ multiple: false, filters: [{ name: 'Cheat', extensions: ['cht'] }] })
    if (!file || Array.isArray(file)) return
    try { const p = await importCheat(cheatRoot, cheatId || null, file as string); setCheatMsg(`Imported to ${p}`); if (cheatId) onLoad() } catch (e: any) { setCheatMsg(String(e)) }
  }

  const onExport = async () => {
    if (!cheatRoot || !cheatId) return
    const dest = await save({ defaultPath: `${cheatId}.cht` })
    if (!dest) return
    try { const p = await exportCheat(cheatRoot, cheatId, dest); setCheatMsg(`Exported to ${p}`) } catch (e: any) { setCheatMsg(String(e)) }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Cheat manager (.CHT)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input placeholder="Game ID (e.g. SLUS_203.12)" value={cheatId} onChange={(e) => setCheatId(e.target.value)} />
        <button onClick={onLoad} disabled={busy}>{busy ? 'Loading...' : 'Load'}</button>
        <button onClick={onSave} disabled={busy || !cheatId}>{busy ? 'Saving...' : 'Save'}</button>
        <button onClick={onImport} disabled={busy}>Import (.CHT)</button>
        <button onClick={onExport} disabled={busy || !cheatId}>Export (.CHT)</button>
      </div>
      <textarea value={cheatText} onChange={(e) => setCheatText(e.target.value)} rows={10} style={{ width: '100%' }} />
      {cheatMsg && <div style={{ marginTop: 8 }}><code>{cheatMsg}</code></div>}
    </div>
  )
}
