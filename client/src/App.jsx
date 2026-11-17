import { Route, Routes } from "react-router-dom";
import AccountLayout from "./layouts/AccountLayout";
import Booking from "./pages/Booking";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import Destinations from "./pages/Destinations";
import Home from "./pages/Home";
import HotelDetails from "./pages/HotelDetails";
import Hotels from "./pages/Hotels";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import StaffLogin from "./pages/StaffLogin";  
import MyReviews from "./pages/MyReviews";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:slug" element={<HotelDetails />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/login" element={<Login />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/staff/login" element={<StaffLogin />} /> 

      {/* Các trang tài khoản dùng chung khung 2 cột */}
      <Route element={<AccountLayout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reviews" element={<MyReviews />} />
      </Route>
    </Routes>
  );
}

export default App;
