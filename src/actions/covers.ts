import { invoke } from '@tauri-apps/api/core'

export const saveCoverFromUrl = async (opl_root: string, game_id: string, url: string): Promise<string> => (
  invoke('save_cover_from_url', { opl_root, game_id, url })
)

export const saveCoverFromFile = async (opl_root: string, game_id: string, src_path: string): Promise<string> => (
  invoke('save_cover_from_file', { opl_root, game_id, src_path })
)

export const deleteCover = async (opl_root: string, game_id: string): Promise<boolean> => (
  invoke('delete_cover', { opl_root, game_id })
)

export const autoFetchCover = async (
  opl_root: string,
  game_id: string,
  title_guess: string | null,
  force = true,
): Promise<string> => invoke('auto_fetch_cover', { opl_root, game_id, title_guess, force })
