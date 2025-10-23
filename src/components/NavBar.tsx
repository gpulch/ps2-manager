import { Button } from '../ui/Button'
import { useNav } from '../contexts/NavContext'

export const NavBar = () => {
  const { page, setPage } = useNav()
  const tabs: Array<{ key: typeof page; label: string }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'library', label: 'Library' },
    { key: 'disk', label: 'Disk' },
    { key: 'cheats', label: 'Cheats' },
    { key: 'settings', label: 'Settings' },
  ]
  return (
    <div className="row section">
      {tabs.map(t => (
        <Button key={t.key} variant={page === t.key ? 'secondary' : 'ghost'} onClick={() => setPage(t.key)}>
          {t.label}
        </Button>
      ))}
    </div>
  )
}
