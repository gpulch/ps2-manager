import { Button } from '../../ui/Button'
import { PageLayout } from '../layout/PageLayout'

type Props = {
  libraryRoot: string | null
  cheatsRoot: string | null
  onChooseLibrary: () => Promise<void>
  onChooseCheats: () => Promise<void>
  onOpenTheme: () => void
}

export const SettingsPanel = ({ libraryRoot, cheatsRoot, onChooseLibrary, onChooseCheats, onOpenTheme }: Props) => (
  <PageLayout title="Settings">
    <div className="row toolbar">
      <span>Library: <code className="code-mini">{libraryRoot ?? '-'}</code></span>
      <Button onClick={onChooseLibrary}>Choose Library Folder</Button>
    </div>
    <div className="row toolbar">
      <span>Cheats: <code className="code-mini">{cheatsRoot ?? '-'}</code></span>
      <Button onClick={onChooseCheats}>Choose Cheats Folder</Button>
    </div>
    <div className="row toolbar">
      <Button onClick={onOpenTheme}>Theme Settings</Button>
    </div>
  </PageLayout>
)
