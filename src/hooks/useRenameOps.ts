import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { RenameProposal } from '../types'

export const useRenameOps = ({
  refreshAfterApply,
}: {
  refreshAfterApply: (root: string) => Promise<void>
}) => {
  const [renamePreview, setRenamePreview] = useState<RenameProposal[] | null>(null)
  const [renaming, setRenaming] = useState(false)

  const previewRenames = async (root: string) => {
    const result = await invoke<RenameProposal[]>('preview_renames', { opl_root: root })
    setRenamePreview(result)
  }

  const applyRenames = async (root: string) => {
    setRenaming(true)
    try {
      const result = await invoke<RenameProposal[]>('apply_renames', { opl_root: root })
      setRenamePreview(result)
      await refreshAfterApply(root)
    } finally {
      setRenaming(false)
    }
  }

  return { renamePreview, renaming, previewRenames, applyRenames }
}
