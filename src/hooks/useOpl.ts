import { useState } from 'react'
import type { ValidationReport } from '../types'
import { useSourceContext } from '../contexts/SourceContext'
import { suggestRoots, validateDir, fixStructure as fixStructureAction } from '../actions/scanner'

export const useOpl = () => {
  const { selectedRoot, setSelectedRoot } = useSourceContext()
  const [roots, setRoots] = useState<string[]>([])
  const [report, setReport] = useState<ValidationReport | null>(null)

  const scanRoots = async () => {
    const found = await suggestRoots()
    setRoots(found)
    setReport(null)
    if (!selectedRoot && found.length > 0) setSelectedRoot(found[0])
  }

  const validate = async (path: string) => setReport(await validateDir(path))
  const fixStructure = async (root: string) => setReport(await fixStructureAction(root))

  return { roots, report, scanRoots, validate, fixStructure }
}
