import { invoke } from '@tauri-apps/api/core'
import type { OrganizeProposal } from '../types'

export const previewOrganize = async (opl_root: string): Promise<OrganizeProposal[]> => (
  invoke('preview_organize', { opl_root })
)

export const applyOrganize = async (opl_root: string): Promise<OrganizeProposal[]> => (
  invoke('apply_organize', { opl_root })
)
