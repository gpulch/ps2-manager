import type { ValidationReport } from '../types'
import { OplRoots } from '../components/features/OplRoots'
import { ValidationPanel } from '../components/features/ValidationPanel'
import { VmcPanel } from '../components/features/vmc/VmcPanel'
import { PageLayout } from '../components/layout/PageLayout'

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
  <PageLayout title="OPL Disks">
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
      <>
        <ValidationPanel report={report} oplRoot={selectedRoot} />
        <VmcPanel oplRoot={selectedRoot} />
      </>
    )}
  </PageLayout>
)
