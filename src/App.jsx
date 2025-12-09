// import { useState } from 'react'
// import './App.css'
// import Login from './login'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <Login/>
//   )
// }

// export default App


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Reset from "./pages/Reset";
import Home from "./pages/Home";
import ProfileMang from "./pages/profileMang";
import MainHome from "./pages/mainHome";
import NotFound404 from "./pages/notFound404";
import AdminDash from "./pages/AdminDash";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import LotConfig from "./pages/lotConfig";
import FindParking from "./pages/FindParking";
import Parkings from "./pages/Parkings";
import ParkingLotDetails from "./pages/ParkingLotDetails";
import AdminSignup from "./pages/AdminSignUp";
import NewLotConfig from "./pages/NewLotConfig";
import Logs from "./pages/Logs";
import Reservations from "./pages/Reservations";
import History from "./pages/History";
import Portal from "./pages/Portal";
import NumberPlateScanner from "./pages/NumPlateScan";
import Alerts from "./pages/Alerts";
import ReservationsAll from "./pages/ReservationsAll";
import Invoice from "./pages/Invoice";
import Payments from "./pages/Payments";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/home" element={<Home />}>
            <Route path="/home/main" element={<MainHome />} />
            <Route path="/home/profile" element={<ProfileMang />} />
            <Route path="/home/parkings" element={<FindParking />} >
              <Route path="/home/parkings/:id" element={<Bookings />} />
            </Route>
          </Route>
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDash />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/lot" element={<LotConfig />} />
          </Route>
          <Route path="*" element={<NotFound404 />} />
        </Routes> */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset" element={<Reset />} />


            <Route path="/home" element={<Home />}>
              <Route index element={<MainHome />} /> Default Home Route
              <Route path="main" element={<MainHome />} />
              <Route path="profile" element={<ProfileMang />} />
              <Route path="parkings" element={<Parkings />}>
                <Route index path="find" element={<FindParking />} />
                <Route path=":pid" element={<ParkingLotDetails />} />
              </Route>
              <Route path="reservation" element={<Reservations />}> 
                <Route index element={<ReservationsAll />} />
                <Route path=":rid" element={<Invoice />} />
              </Route>
              <Route path="history" element={<History />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="payments" element={<Payments />} />
              
            </Route>

            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/adminsignup" element={<AdminSignup />} />
            <Route path="/admin" element={<AdminDash />}>
              <Route index element={<Dashboard />} />
              <Route path="lot" element={<LotConfig />} />
              <Route path="new-lot" element={<NewLotConfig />} />
              <Route path="logs" element={<Logs />} />
              <Route path="portal" element={<Portal />} />
              <Route path="scanner" element={<NumberPlateScanner />} />
            </Route>


            <Route path="*" element={<NotFound404 />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
