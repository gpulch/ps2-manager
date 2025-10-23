import { invoke } from '@tauri-apps/api/core'

export const exportCatalogJson = async (dest_path: string, json: string): Promise<string> => (
  invoke('export_catalog_json', { dest_path, json })
)
