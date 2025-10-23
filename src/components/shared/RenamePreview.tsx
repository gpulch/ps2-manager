import type { RenameProposal } from '../../types'
import { Button } from '../../ui/Button'

type Props = {
  preview: RenameProposal[] | null
  onPreview: () => void
  onApply: () => void
  busy: boolean
}

export const RenamePreview = ({ preview, onPreview, onApply, busy }: Props) => (
  <div className="section">
    <div className="row toolbar">
      <Button onClick={onPreview}>Preview renames (&lt;=80)</Button>
      <Button onClick={onApply} disabled={busy}>{busy ? 'Renaming...' : 'Apply renames'}</Button>
    </div>
    {preview && (
      <div className="section">
        <h3>Rename preview</h3>
        <table className="table">
          <thead>
            <tr>
              <th className="th-left">From</th>
              <th className="th-left">To</th>
              <th className="th-left">Change?</th>
              <th className="th-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((p) => (
              <tr key={p.from}>
                <td><code className="code-mini">{p.from}</code></td>
                <td><code className="code-mini">{p.to}</code></td>
                <td>{p.will_change ? 'Yes' : 'No'}</td>
                <td>{p.error ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)
