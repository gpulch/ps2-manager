import { invoke } from '@tauri-apps/api/core';
import type { VmcInfo } from '../types';

export const listVmcs = async (opl_root: string): Promise<VmcInfo[]> =>
  invoke('list_vmcs', { opl_root });

export const importVmc = async (
  opl_root: string,
  src_path: string,
): Promise<string> => invoke('import_vmc', { opl_root, src_path });

export const exportVmc = async (
  opl_root: string,
  file_name: string,
  dest_path: string,
): Promise<string> => invoke('export_vmc', { opl_root, file_name, dest_path });

export const deleteVmc = async (
  opl_root: string,
  file_name: string,
): Promise<boolean> => invoke('delete_vmc', { opl_root, file_name });
