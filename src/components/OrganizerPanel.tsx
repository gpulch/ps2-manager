import { useState } from 'react'
import type { OrganizeProposal } from '../types'
import { previewOrganize, applyOrganize } from '../actions/organizer'

type Props = { oplRoot: string | null }

export const OrganizerPanel = ({ oplRoot }: Props) => {
  const [preview, setPreview] = useState<OrganizeProposal[] | null>(null)
  const [busy, setBusy] = useState(false)

  const doPreview = async () => {
    if (!oplRoot) return
    setPreview(await previewOrganize(oplRoot))
  }

  const doApply = async () => {
    if (!oplRoot) return
    setBusy(true)
    try { setPreview(await applyOrganize(oplRoot)) } finally { setBusy(false) }
  }

  if (!oplRoot) return null

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Organizer (CD/DVD)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={doPreview}>Preview organization</button>
        <button onClick={doApply} disabled={busy}>{busy ? 'Organizing...' : 'Apply organization'}</button>
      </div>
      {preview && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>From</th>
              <th style={{ textAlign: 'left' }}>To</th>
              <th style={{ textAlign: 'left' }}>Move?</th>
              <th style={{ textAlign: 'left' }}>Reason</th>
              <th style={{ textAlign: 'left' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {preview.map(p => (
              <tr key={p.from + '->' + p.to}>
                <td><code style={{ fontSize: 12 }}>{p.from}</code></td>
                <td><code style={{ fontSize: 12 }}>{p.to}</code></td>
                <td>{p.will_move ? 'Yes' : 'No'}</td>
                <td>{p.reason}</td>
                <td>{p.error ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
