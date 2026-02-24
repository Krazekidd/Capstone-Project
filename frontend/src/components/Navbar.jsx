import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav>
      <img src="/images/triallogo.png" alt="B.A.D People Fitness" width="150" height="175" />
      <div className="heading">
        <h4>B.A.D People Fitness</h4>
      </div>
      <ul className="nav-links">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li className="dropdown">
          <Link to="/services">Services ▾</Link>
          <ul className="dropdown-content">
            <li><Link to="/consultation">Consultation</Link></li>
            <li><Link to="/membership">Membership</Link></li>
            <li><Link to="/excursions">Excursions</Link></li>
          </ul>
        </li>
        <li>
          <Link 
            to="/about" 
            className={location.pathname === '/about' ? 'active' : ''}
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            to="/account" 
            className={location.pathname === '/account' ? 'active' : ''}
          >
            My Account
          </Link>
        </li>
        <li>
          <Link 
            to="/shop" 
            className={`cart ${location.pathname === '/shop' ? 'active' : ''}`}
          >
            🛒
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
