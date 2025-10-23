export type RemoteSource = {
  name: string
  url: string
  source_type: 'archive_org' | 'http'
}

export type RemoteGame = {
  name: string
  download_url: string
  size?: number
  format: string
}

export type DownloadProgress = {
  downloaded: number
  total: number
  percent: number
  status: 'downloading' | 'completed' | 'failed'
}
