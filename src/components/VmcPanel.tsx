import { useEffect, useState } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { listVmcs, importVmc, exportVmc, deleteVmc } from '../actions/vmc'
import type { VmcInfo } from '../types'

type Props = { oplRoot: string | null }

export const VmcPanel = ({ oplRoot }: Props) => {
  const [vmcs, setVmcs] = useState<VmcInfo[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    if (!oplRoot) return
    setLoading(true)
    try { setVmcs(await listVmcs(oplRoot)) } finally { setLoading(false) }
  }

  const onImport = async () => {
    if (!oplRoot) return
    const file = await open({ multiple: false, filters: [{ name: 'VMC', extensions: ['vmc','ps2','psu'] }] })
    if (!file || Array.isArray(file)) return
    await importVmc(oplRoot, file as string)
    refresh()
  }

  const onExport = async (file_name: string) => {
    if (!oplRoot) return
    const dest = await save({ defaultPath: file_name })
    if (!dest) return
    await exportVmc(oplRoot, file_name, dest)
  }

  const onDelete = async (file_name: string) => {
    if (!oplRoot) return
    await deleteVmc(oplRoot, file_name)
    refresh()
  }

  useEffect(() => { refresh() }, [oplRoot])

  if (!oplRoot) return null

  return (
    <div style={{ marginTop: 16 }}>
      <h3>VMC manager</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh VMCs'}</button>
        <button onClick={onImport}>Import VMC</button>
      </div>
      {vmcs.length === 0 ? (
        <div>No VMC files found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>File</th>
              <th style={{ textAlign: 'left' }}>Size</th>
              <th style={{ textAlign: 'left' }}>Modified</th>
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vmcs.map(v => (
              <tr key={v.path}>
                <td><code style={{ fontSize: 12 }}>{v.file_name}</code></td>
                <td>{(v.size / (1024 * 1024)).toFixed(2)} MB</td>
                <td>{new Date(v.modified * 1000).toLocaleString()}</td>
                <td>
                  <button onClick={() => onExport(v.file_name)}>Export</button>
                  <button onClick={() => onDelete(v.file_name)} style={{ marginLeft: 8 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
