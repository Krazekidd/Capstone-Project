import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Membership from './pages/Membership'
import Consultation from './pages/Consultation'
import Shop from './pages/Shop'
import Account from './pages/Account'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
