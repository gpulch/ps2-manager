import { invoke } from '@tauri-apps/api/core';
import type { ValidationReport } from '../types';

export const initializeOplStructure = async (
  basePath: string,
): Promise<ValidationReport> => {
  return await invoke<ValidationReport>('initialize_opl_structure', {
    base_path: basePath,
  });
};
