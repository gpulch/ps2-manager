import { useState } from 'react'
import type { OrganizeProposal } from '../types'
import { previewOrganize, applyOrganize } from '../actions/organizer'
import { Button } from '../ui/Button'

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
    <div className="section">
      <h3>Organizer (CD/DVD)</h3>
      <div className="row toolbar">
        <Button onClick={doPreview}>Preview organization</Button>
        <Button onClick={doApply} disabled={busy}>{busy ? 'Organizing...' : 'Apply organization'}</Button>
      </div>
      {preview && (
        <table className="table">
          <thead>
            <tr>
              <th className="th-left">From</th>
              <th className="th-left">To</th>
              <th className="th-left">Move?</th>
              <th className="th-left">Reason</th>
              <th className="th-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {preview.map(p => (
              <tr key={p.from + '->' + p.to}>
                <td><code className="code-mini">{p.from}</code></td>
                <td><code className="code-mini">{p.to}</code></td>
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
