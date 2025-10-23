import { invoke } from '@tauri-apps/api/core'

export type FolderValidationResult = {
  ok: boolean
  iso_count?: number
  warnings?: string[]
}

export type GenericFolderValidationResult = {
  ok: boolean
  warnings?: string[]
}

export const validateLibraryFolder = async (folder: string): Promise<FolderValidationResult> =>
  invoke('validate_library_folder', { folder })

export const validateGenericFolder = async (folder: string): Promise<GenericFolderValidationResult> =>
  invoke('validate_generic_folder', { folder })

export const checkWriteableFolder = async (folder: string): Promise<boolean> =>
  invoke('check_writeable_folder', { folder })

export const formatValidationWarnings = (warnings?: string[]): string =>
  warnings && warnings.length > 0
    ? warnings.join('\n')
    : 'Selected folder is not suitable.'
