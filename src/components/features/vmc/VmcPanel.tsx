import { useEffect, useState, useCallback } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { listVmcs, importVmc, exportVmc, deleteVmc } from '../../../actions/vmc'
import type { VmcInfo } from '../../../types'
import { Button } from '../../../ui/Button'
import { formatFileSize } from '../../../utils'

type Props = { oplRoot: string | null }

export const VmcPanel = ({ oplRoot }: Props) => {
  const [vmcs, setVmcs] = useState<VmcInfo[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    if (!oplRoot) return
    setLoading(true)
    try {
      const result = await listVmcs(oplRoot)
      setVmcs(result)
    } finally {
      setLoading(false)
    }
  }, [oplRoot])

  const onImport = async (): Promise<void> => {
    if (!oplRoot) return
    const file = await open({ multiple: false, filters: [{ name: 'VMC', extensions: ['vmc', 'ps2', 'psu'] }] })
    if (!file || Array.isArray(file)) return
    await importVmc(oplRoot, file)
    await refresh()
  }

  const onExport = async (fileName: string): Promise<void> => {
    if (!oplRoot) return
    const dest = await save({ defaultPath: fileName })
    if (!dest) return
    await exportVmc(oplRoot, fileName, dest)
  }

  const onDelete = async (fileName: string): Promise<void> => {
    if (!oplRoot) return
    await deleteVmc(oplRoot, fileName)
    await refresh()
  }

  useEffect(() => { refresh() }, [oplRoot, refresh])

  if (!oplRoot) return null

  return (
    <div className="section">
      <h3>VMC manager</h3>
      <div className="row toolbar">
        <Button onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh VMCs'}</Button>
        <Button onClick={onImport}>Import VMC</Button>
      </div>
      {vmcs.length === 0 ? (
        <div>No VMC files found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="th-left">File</th>
              <th className="th-left">Size</th>
              <th className="th-left">Modified</th>
              <th className="th-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vmcs.map(v => (
              <tr key={v.path}>
                <td><code className="code-mini">{v.file_name}</code></td>
                <td>{formatFileSize(v.size)}</td>
                <td>{new Date(v.modified * 1000).toLocaleString()}</td>
                <td className="row">
                  <Button onClick={() => onExport(v.file_name)}>Export</Button>
                  <Button variant="danger" onClick={() => onDelete(v.file_name)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
