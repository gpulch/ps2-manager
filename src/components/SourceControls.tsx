import { Button } from '../ui/Button'
type Props = {
  activeSource: 'disk' | 'library'
  libraryRoot: string | null
  cheatsRoot: string | null
  setSource: (m: 'disk' | 'library') => Promise<void>
  chooseLibraryRoot: () => Promise<void>
  chooseCheatsRoot: () => Promise<void>
  useLibraryForCheats: () => Promise<void>
  scanning: boolean
  scanLibrary: (root: string) => Promise<void>
}

export const SourceControls = ({
  activeSource,
  libraryRoot,
  cheatsRoot,
  setSource,
  chooseLibraryRoot,
  chooseCheatsRoot,
  useLibraryForCheats,
  scanning,
  scanLibrary,
}: Props) => (
  <div className="row section">
    <strong>Source</strong>
    <Button onClick={() => setSource('disk')} disabled={activeSource === 'disk'}>Disk</Button>
    <Button onClick={() => setSource('library')} disabled={activeSource === 'library'}>Library</Button>
    {activeSource === 'library' && (
      <>
        <Button onClick={chooseLibraryRoot}>Choose library folder</Button>
        <Button onClick={chooseCheatsRoot}>Choose cheats folder</Button>
        <Button onClick={useLibraryForCheats}>Use library for cheats</Button>
        <span>Library: <code style={{ fontSize: 12 }}>{libraryRoot ?? '-'}</code></span>
        <span>Cheats: <code style={{ fontSize: 12 }}>{(cheatsRoot ?? libraryRoot) ?? '-'}</code></span>
        <Button onClick={() => libraryRoot && scanLibrary(libraryRoot)} disabled={scanning || !libraryRoot}>
          {scanning ? 'Scanning...' : 'Scan library'}
        </Button>
      </>
    )}
  </div>
)
