import type { ValidationReport } from '../types'
import { OplRoots } from '../components/OplRoots'
import { ValidationPanel } from '../components/ValidationPanel'
import { VmcPanel } from '../components/VmcPanel'

type Props = {
  roots: string[]
  scanning: boolean
  selectedRoot: string | null
  onValidate: (path: string) => Promise<void>
  onFix: (path: string) => Promise<void>
  onScan: (path: string) => Promise<void>
  onSelect: (path: string) => void
  report: ValidationReport | null
}

export const DiskView = ({ roots, scanning, selectedRoot, onValidate, onFix, onScan, onSelect, report }: Props) => (
  <div className="section">
    <h2>OPL Disks</h2>
    {roots.length > 0 && (
      <OplRoots
        roots={roots}
        scanning={scanning}
        selectedRoot={selectedRoot}
        onValidate={onValidate}
        onFix={onFix}
        onScan={onScan}
        onSelect={onSelect}
      />
    )}

    {report && (
      <div className="section">
        <ValidationPanel report={report} oplRoot={selectedRoot} />
        <VmcPanel oplRoot={selectedRoot} />
      </div>
    )}
  </div>
)
