import sonyLogo from '../../assets/sony.svg'
import ps2Logo from '../../assets/ps2.svg'

export const Header = () => (
  <div className="neo-header">
    <img src={sonyLogo} alt="Sony" style={{ height: 28 }} />
    <img src={ps2Logo} alt="PlayStation 2" style={{ height: 28 }} />
    <h1 style={{ margin: 0, marginLeft: 8 }}>PS2 Manager</h1>
  </div>
)
