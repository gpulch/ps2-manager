export type ValidationReport = {
  root: string
  present: string[]
  missing: string[]
}

export type GameInfo = {
  path: string
  file_name: string
  size: number
  kind: string
  id?: string
  title_guess?: string
  warnings: string[]
  has_cover: boolean
  cover_path?: string | null
}

export type RenameProposal = {
  from: string
  to: string
  will_change: boolean
  error?: string | null
}

export type VmcInfo = {
  file_name: string
  path: string
  size: number
  modified: number
}

export type OrganizeProposal = {
  from: string
  to: string
  will_move: boolean
  reason: string
  error?: string | null
}
