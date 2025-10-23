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
  <div style={{ marginTop: 16 }}>
    <h2>Detected OPL roots</h2>
    <ul>
      {roots.map((r) => (
        <li key={r} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <code style={{ fontSize: 12 }}>{r}</code>
          <button onClick={() => onValidate(r)}>Validate</button>
          <button onClick={() => onFix(r)}>Fix missing dirs</button>
          <button onClick={() => { onSelect(r); onScan(r) }} disabled={scanning}>
            {scanning && selectedRoot === r ? 'Scanning...' : 'Scan games'}
          </button>
        </li>
      ))}
    </ul>
  </div>
)
