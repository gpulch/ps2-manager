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
  <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <strong>Source</strong>
    <button onClick={() => setSource('disk')} disabled={activeSource === 'disk'}>Disk</button>
    <button onClick={() => setSource('library')} disabled={activeSource === 'library'}>Library</button>
    {activeSource === 'library' && (
      <>
        <button onClick={chooseLibraryRoot}>Choose library folder</button>
        <button onClick={chooseCheatsRoot}>Choose cheats folder</button>
        <button onClick={useLibraryForCheats}>Use library for cheats</button>
        <span>Library: <code style={{ fontSize: 12 }}>{libraryRoot ?? '-'}</code></span>
        <span>Cheats: <code style={{ fontSize: 12 }}>{(cheatsRoot ?? libraryRoot) ?? '-'}</code></span>
        <button onClick={() => libraryRoot && scanLibrary(libraryRoot)} disabled={scanning || !libraryRoot}>
          {scanning ? 'Scanning...' : 'Scan library'}
        </button>
      </>
    )}
  </div>
)
