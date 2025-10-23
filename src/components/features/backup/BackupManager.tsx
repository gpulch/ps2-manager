import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { save, open } from '@tauri-apps/plugin-dialog'
import { Button } from '../../../ui/Button'
import { formatFileSize } from '../../../utils'

type BackupMetadata = {
  created_at: string
  app_version: string
  library_path: string
  game_count: number
  total_size_bytes: number
}

type Props = {
  libraryRoot: string
  onRestoreComplete?: () => void
}

export const BackupManager = ({ libraryRoot, onRestoreComplete }: Props) => {
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [backupInfo, setBackupInfo] = useState<BackupMetadata | null>(null)

  const createBackup = async () => {
    if (!libraryRoot) {
      setMessage('❌ Please select a library folder first')
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      // Get current settings (empty for now, but can be extended)
      const settings = {}

      // Create backup data
      const backup = await invoke('create_backup', {
        libraryPath: libraryRoot,
        settings
      })

      // Ask user where to save
      const dest = await save({
        defaultPath: `ps2-manager-backup-${Date.now()}.json`,
        filters: [{
          name: 'PS2 Manager Backup',
          extensions: ['json']
        }]
      })

      if (!dest) {
        setCreating(false)
        return
      }

      // Save backup file
      const path = await invoke<string>('save_backup_to_file', {
        backup,
        destPath: dest
      })

      setMessage(`✅ Backup created successfully: ${path}`)
    } catch (error) {
      setMessage(`❌ Failed to create backup: ${error}`)
    } finally {
      setCreating(false)
    }
  }

  const loadBackupInfo = async (path: string) => {
    try {
      const info = await invoke('get_backup_info', { srcPath: path })
      setBackupInfo(info as BackupMetadata)
    } catch (error) {
      setMessage(`❌ Invalid backup file: ${error}`)
    }
  }

  const restoreBackup = async () => {
    // Ask user to select backup file
    const file = await open({
      filters: [{
        name: 'PS2 Manager Backup',
        extensions: ['json']
      }],
      multiple: false
    })

    if (!file) return

    setRestoring(true)
    setMessage(null)

    try {
      // Load backup info first
      await loadBackupInfo(file as string)

      // TODO: Actually restore the backup (apply settings, show catalog)
      // For now, just show the info
      setMessage(`✅ Backup loaded. Contains ${backupInfo?.game_count || 0} games.`)
      
      if (onRestoreComplete) {
        onRestoreComplete()
      }
    } catch (error) {
      setMessage(`❌ Failed to restore backup: ${error}`)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="section">
      <h3>💾 Backup & Restore</h3>

      <div className="backup-actions">
        <Button
          onClick={createBackup}
          disabled={creating || !libraryRoot}
        >
          {creating ? 'Creating Backup...' : 'Create Backup'}
        </Button>

        <Button
          onClick={restoreBackup}
          disabled={restoring}
        >
          {restoring ? 'Restoring...' : 'Restore from Backup'}
        </Button>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {backupInfo && (
        <div className="backup-info">
          <h4>Backup Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(backupInfo.created_at).toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">App Version:</span>
              <span className="info-value">{backupInfo.app_version}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Games:</span>
              <span className="info-value">{backupInfo.game_count}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Size:</span>
              <span className="info-value">
                {formatFileSize(backupInfo.total_size_bytes)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Original Path:</span>
              <code className="info-value">{backupInfo.library_path}</code>
            </div>
          </div>
        </div>
      )}

      <div className="backup-note">
        <p>
          <strong>Note:</strong> Backups include your game catalog and settings.
          ISOs and covers are NOT included (too large). Use this to migrate
          settings or recover from data loss.
        </p>
      </div>
    </div>
  )
}
