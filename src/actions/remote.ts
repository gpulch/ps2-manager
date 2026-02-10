import { invoke } from '@tauri-apps/api/core';
import type { RemoteGame } from '../types/remote';

export const fetchArchiveOrgGames = async (
  collectionUrl: string,
): Promise<RemoteGame[]> =>
  invoke('fetch_archive_org_games', { collectionUrl });

export const downloadRemoteIso = async (
  downloadUrl: string,
  destinationFolder: string,
  fileName: string,
): Promise<string> =>
  invoke('download_remote_iso', { downloadUrl, destinationFolder, fileName });

export const downloadRemoteIsoWithProgress = async (
  downloadUrl: string,
  destinationFolder: string,
  fileName: string,
): Promise<string> =>
  invoke('download_remote_iso_with_progress', {
    downloadUrl,
    destinationFolder,
    fileName,
  });

export const validateRemoteSource = async (url: string): Promise<boolean> =>
  invoke('validate_remote_source', { url });
