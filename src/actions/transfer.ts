import { invoke } from '@tauri-apps/api/core';

export const copyIsoToOpl = async (
  sourcePath: string,
  oplRoot: string,
): Promise<string> => invoke('copy_iso_to_opl', { sourcePath, oplRoot });

export const deleteIsoFromOpl = async (
  oplRoot: string,
  fileName: string,
): Promise<boolean> => invoke('delete_iso_from_opl', { oplRoot, fileName });

export const isIsoPresent = async (
  oplRoot: string,
  fileName: string,
  size: number,
): Promise<boolean> => invoke('is_iso_present', { oplRoot, fileName, size });
