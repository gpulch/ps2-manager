import { PageLayout } from '../components/layout/PageLayout'
import { RemoteSourcesPanel } from '../components/features/remote/RemoteSourcesPanel'

type Props = {
  libraryRoot: string | null
  onRescan: () => void
}

export const DownloadsView = ({ libraryRoot, onRescan }: Props) => {
  return (
    <PageLayout title="Downloads">
      <RemoteSourcesPanel libraryRoot={libraryRoot} onDownloadComplete={onRescan} />
    </PageLayout>
  )
}
