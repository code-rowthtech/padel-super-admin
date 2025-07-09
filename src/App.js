import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/header/Navbar';
import Home from './pages/Home/Home';
import Footer from './pages/Footer/Footer';
import Booking from './pages/Booking/Booking';
import Payment from './pages/Payment';
import './././../src/App.css'


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Openmatches from './pages/Openmatches/Openmatches';
import VeiwMatch from './pages/VeiwMatch/VeiwMatch';
import CustomButton from './pages/button';

function App() {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/open-matches" element={<Openmatches />} />
        <Route path="/veiw-match" element={<VeiwMatch/>} />
      
      </Routes>
      <CustomButton />
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
