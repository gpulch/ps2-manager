export const countBy = <T>(
  items: T[],
  predicate: (item: T) => boolean
): number => items.filter(predicate).length

export const groupBy = <T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> =>
  items.reduce((acc, item) => {
    const key = keyFn(item)
    return {
      ...acc,
      [key]: [...(acc[key] || []), item],
    }
  }, {} as Record<K, T[]>)

export const uniqueBy = <T, K>(
  items: T[],
  keyFn: (item: T) => K
): T[] => {
  const seen = new Set<K>()
  return items.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
