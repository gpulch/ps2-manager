import { Button } from '../ui/Button'
type Props = {
  roots: string[]
  scanning: boolean
  selectedRoot: string | null
  onValidate: (path: string) => Promise<void>
  onFix: (path: string) => Promise<void>
  onScan: (path: string) => Promise<void>
  onSelect: (path: string) => void
}

export const OplRoots = ({ roots, scanning, selectedRoot, onValidate, onFix, onScan, onSelect }: Props) => (
  <div className="section">
    <h2>Detected OPL roots</h2>
    <ul>
      {roots.map((r) => (
        <li key={r} className="row">
          <code className="code-mini">{r}</code>
          <Button onClick={() => onValidate(r)}>Validate</Button>
          <Button onClick={() => onFix(r)}>Fix missing dirs</Button>
          <Button onClick={() => { onSelect(r); onScan(r) }} disabled={scanning}>
            {scanning && selectedRoot === r ? 'Scanning...' : 'Scan games'}
          </Button>
        </li>
      ))}
    </ul>
  </div>
)
