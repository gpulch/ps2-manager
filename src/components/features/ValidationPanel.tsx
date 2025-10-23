import type { ValidationReport } from '../../types'
import { OrganizerPanel } from './organizer/OrganizerPanel'

type Props = {
  report: ValidationReport
  oplRoot: string | null
}

export const ValidationPanel = ({ report, oplRoot }: Props) => (
  <div className="section">
    <h2>Validation</h2>
    <div>
      <strong>Root:</strong> <code className="code-mini">{report.root}</code>
    </div>

    <OrganizerPanel oplRoot={oplRoot} />

    <div className="row gap-24">
      <div>
        <strong>Present</strong>
        <ul>
          {report.present.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Missing</strong>
        <ul>
          {report.missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)
