import { Button } from '../../ui/Button'
import { useNav } from '../../contexts/NavContext'
import { NAVIGATION_TABS } from '../../constants/navigation'

export const NavBar = () => {
  const { page, setPage } = useNav()

  return (
    <div className="row section">
      {NAVIGATION_TABS.map(tab => (
        <Button 
          key={tab.key} 
          variant={page === tab.key ? 'secondary' : 'ghost'} 
          onClick={() => setPage(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
