import type { PropsWithChildren, ReactNode } from 'react'
import { Button } from './Button'

export type TabItem = { key: string; label: ReactNode; content: ReactNode }

type TabsProps = PropsWithChildren<{
  items: TabItem[]
  value: string
  onChange: (key: string) => void
}>

export const Tabs = ({ items, value, onChange }: TabsProps) => (
  <div className="tabs">
    <div className="tabs-list">
      {items.map(it => (
        <Button key={it.key} variant={value === it.key ? 'secondary' : 'ghost'} onClick={() => onChange(it.key)}>
          {it.label}
        </Button>
      ))}
    </div>
    <div className="tabs-content">
      {items.find(it => it.key === value)?.content}
    </div>
  </div>
)
