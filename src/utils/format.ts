export const formatFileSize = (bytes: number): string => {
  const megabytes = bytes / (1024 * 1024)
  return `${megabytes.toFixed(1)} MB`
}

export const formatPercent = (value: number, total: number): string => {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}
