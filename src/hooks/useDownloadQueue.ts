import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { DownloadQueueItem, DownloadStatus, DownloadProgress } from '../types/download'

export const useDownloadQueue = (libraryRoot: string | null) => {
  const [queue, setQueue] = useState<DownloadQueueItem[]>([])
  const [currentDownload, setCurrentDownload] = useState<string | null>(null)
  const queueRef = useRef<DownloadQueueItem[]>([])
  
  // Keep ref in sync
  useEffect(() => {
    queueRef.current = queue
  }, [queue])
  
  // Add item to queue
  const addToQueue = useCallback((item: Omit<DownloadQueueItem, 'id' | 'status' | 'progress'>) => {
    const queueItem: DownloadQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      status: 'pending',
      progress: 0
    }
    
    setQueue(prev => [...prev, queueItem])
    return queueItem.id
  }, [])
  
  // Remove item from queue
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }, [])
  
  // Cancel download
  const cancelDownload = useCallback(async (id: string) => {
    // Cancel in backend if currently downloading
    if (currentDownload === id) {
      try {
        await invoke('cancel_download', { downloadId: id })
      } catch (error) {
        console.error('Failed to cancel download:', error)
      }
    }
    
    // Update status
    setQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: 'cancelled' as DownloadStatus }
        : item
    ))
  }, [currentDownload])
  
  // Start next download in queue
  const startNextDownload = useCallback(async () => {
    if (!libraryRoot || currentDownload) return
    
    const nextItem = queueRef.current.find(item => item.status === 'pending')
    if (!nextItem) return
    
    setCurrentDownload(nextItem.id)
    setQueue(prev => prev.map(item =>
      item.id === nextItem.id
        ? { ...item, status: 'downloading' as DownloadStatus, startedAt: Date.now() }
        : item
    ))
    
    try {
      await invoke('download_remote_iso', {
        url: nextItem.url,
        destFolder: libraryRoot,
        expectedSize: nextItem.size,
        downloadId: nextItem.id
      })
      
      setQueue(prev => prev.map(item =>
        item.id === nextItem.id
          ? { ...item, status: 'completed' as DownloadStatus, progress: 100, completedAt: Date.now() }
          : item
      ))
    } catch (error) {
      setQueue(prev => prev.map(item =>
        item.id === nextItem.id
          ? { ...item, status: 'failed' as DownloadStatus, error: String(error) }
          : item
      ))
    } finally {
      setCurrentDownload(null)
    }
  }, [currentDownload, libraryRoot])
  
  // Update progress
  const updateProgress = useCallback((progress: DownloadProgress) => {
    setQueue(prev => prev.map(item =>
      item.id === progress.id
        ? { ...item, progress: (progress.downloaded / progress.total) * 100 }
        : item
    ))
  }, [])
  
  // Listen for progress events
  useEffect(() => {
    const unlisten = listen<DownloadProgress>('download-progress', (event) => {
      updateProgress(event.payload)
    })
    
    return () => {
      unlisten.then(fn => fn())
    }
  }, [updateProgress])
  
  // Auto-start next download when current completes
  useEffect(() => {
    if (!currentDownload) {
      startNextDownload()
    }
  }, [currentDownload, startNextDownload])
  
  // Clear completed downloads
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => 
      item.status !== 'completed' && item.status !== 'cancelled'
    ))
  }, [])
  
  // Retry failed download
  const retryDownload = useCallback((id: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: 'pending' as DownloadStatus, error: undefined, progress: 0 }
        : item
    ))
  }, [])
  
  // Memoize computed values
  const counts = useMemo(() => {
    let pending = 0
    let completed = 0
    let failed = 0
    
    for (const item of queue) {
      if (item.status === 'pending') pending++
      else if (item.status === 'completed') completed++
      else if (item.status === 'failed') failed++
    }
    
    return { pending, completed, failed }
  }, [queue])
  
  return {
    queue,
    currentDownload,
    addToQueue,
    removeFromQueue,
    cancelDownload,
    clearCompleted,
    retryDownload,
    isDownloading: currentDownload !== null,
    pendingCount: counts.pending,
    completedCount: counts.completed,
    failedCount: counts.failed
  }
}
