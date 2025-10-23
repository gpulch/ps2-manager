export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled'

export type DownloadQueueItem = {
  id: string
  name: string
  url: string
  size: number
  format: string
  status: DownloadStatus
  progress: number
  error?: string
  startedAt?: number
  completedAt?: number
}

export type DownloadProgress = {
  id: string
  downloaded: number
  total: number
  speed: number
}
