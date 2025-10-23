import { invoke } from '@tauri-apps/api/core'
import type { GameInfo, RenameProposal, ValidationReport } from '../types'

export const suggestRoots = async (): Promise<string[]> => invoke('suggest_opl_roots')
export const validateDir = async (path: string): Promise<ValidationReport> => invoke('validate_opl_dir', { path })
export const fixStructure = async (path: string): Promise<ValidationReport> => invoke('fix_opl_structure', { path })
export const scanOplGames = async (opl_root: string): Promise<GameInfo[]> => invoke('scan_opl_games', { opl_root })
export const scanFolderGames = async (folder: string): Promise<GameInfo[]> => invoke('scan_folder_games', { folder })
export const previewRenames = async (opl_root: string): Promise<RenameProposal[]> => invoke('preview_renames', { opl_root })
export const applyRenames = async (opl_root: string): Promise<RenameProposal[]> => invoke('apply_renames', { opl_root })
