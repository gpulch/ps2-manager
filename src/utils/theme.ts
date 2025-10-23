export const setCssVariable = (name: string, value: string): void => {
  document.documentElement.style.setProperty(name, value)
}

export const getCssVariable = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export type ThemeVariables = {
  fontSize: string
  accent: string
}

export const applyThemeVariables = (theme: ThemeVariables): void => {
  setCssVariable('--ui-font-size', theme.fontSize)
  setCssVariable('--ui-accent', theme.accent)
}

export const DEFAULT_THEME: ThemeVariables = {
  fontSize: '16px',
  accent: '#4cc2ff',
} as const
