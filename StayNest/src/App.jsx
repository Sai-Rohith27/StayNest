import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Listings from "./pages/listings";
import Show from "./pages/show";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; 
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import Wishlist from "./pages/Wishlist";
import HostDashboard from "./pages/HostDashboard";
import Profile from "./pages/Profile";
import BookingDetail from "./pages/BookingDetail";

// --- NEW IMPORTS FOR FORGOT PASSWORD ---
import ForgotPassword from "./pages/Forgotpassword";
import ResetPassword from "./pages/Resetpassword";
// ---------------------------------------

function RequireAuth({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    let isActive = true;

    axios.get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true })
      .then(() => {
        if (isActive) setAuthState("allowed");
      })
      .catch(() => {
        if (isActive) {
          toast.error("Please login first.");
          setAuthState("blocked");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (authState === "checking") {
    return <div className="listings-loading">Checking login...</div>;
  }

  if (authState === "blocked") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function App(){
  useEffect(() => {
    toast(
      <span className="welcome-toast-content">
        <span className="welcome-toast-check" aria-hidden="true">✓</span>
        <span>Welcome to StayNest.</span>
      </span>,
      {
      containerId: "welcome",
      toastId: "staynest-welcome",
      }
    );
  }, []); 
  return (
    <BrowserRouter> 
      <>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        <ToastContainer
          containerId="welcome"
          position="top-center"
          autoClose={3200}
          hideProgressBar={false}
          closeButton
          pauseOnHover={false}
          draggable={false}
          className="welcome-toast-container"
          toastClassName="welcome-toast"
          bodyClassName="welcome-toast-body"
        />
        <main className="app-shell">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* --- NEW FORGOT PASSWORD ROUTES --- */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* ---------------------------------- */}
            
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
            <Route path="/bookings/:bookingId" element={<RequireAuth><BookingDetail /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
            <Route path="/host" element={<RequireAuth><HostDashboard /></RequireAuth>} />
            <Route path="/" element={<Listings />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<RequireAuth><NewListing /></RequireAuth>} />
            <Route path="/listings/:id" element={<Show />} />
            <Route path="/listings/:id/edit" element={<RequireAuth><EditListing /></RequireAuth>} />
            <Route
              path="*"
              element={(
                <div className="listings-page">
                  <div className="listings-state-card">That page could not be found.</div>
                </div>
              )}
            />
          </Routes>
        </main>
        <Footer />
      </>
    </BrowserRouter>
  );
}
export default App;