export const generateId = (): string => 
  Math.random().toString(36).slice(2)

export const joinClasses = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ').trim()

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
