import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Components/Layout'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Login from './pages/Login/Login'
import Membership from './pages/Membership/Membership'
import Consultation from './pages/Consultation/Consultation'
import Shop from './pages/Shop/Shop'
import Account from './pages/Account/Account'
import NotFound from './pages/NotFound/NotFound'
import Excursions from './pages/Excursions/Excursions';
import TrainerPage from './pages/Trainer/Traineracc'
import Admin from './pages/Admin/Admin'

// import Admin from './pages/Admin/Admin'

function App() {
  return (
    <Router>
      <Routes>
        {/* Login page – no Layout (no universal navbar) */}
        <Route path="/login" element={<Login />} />
        {/* Wrapping all routes that need the navbar/footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/account" element={<Account />} />
          <Route path="/excursions" element={<Excursions />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
