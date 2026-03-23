import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/account" element={<Account />} />
        <Route path="/excursions" element={<Excursions />} />
        <Route path="/trainer" element={<TrainerPage />} />
        <Route path="/admin" element={<Admin />} />
        {/* <Route path="/Admin" element={<Admin />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
