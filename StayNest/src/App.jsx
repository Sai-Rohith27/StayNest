import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Listings from "./pages/Listings";
import Show from "./pages/Show";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; 
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
            <Route path="/" element={<Listings />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<NewListing />} />
            <Route path="/listings/:id" element={<Show />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
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