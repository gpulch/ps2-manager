import { invoke } from '@tauri-apps/api/core'

export const loadCheat = async (opl_root: string, game_id: string): Promise<string> => (
  invoke('load_cht', { opl_root, game_id })
)

export const saveCheat = async (opl_root: string, game_id: string, content: string): Promise<string> => (
  invoke('save_cht', { opl_root, game_id, content })
)

export const importCheat = async (opl_root: string, maybe_game_id: string | null, src_path: string): Promise<string> => (
  invoke('import_cht', { opl_root, maybe_game_id, src_path })
)

export const exportCheat = async (opl_root: string, game_id: string, dest_path: string): Promise<string> => (
  invoke('export_cht', { opl_root, game_id, dest_path })
)
