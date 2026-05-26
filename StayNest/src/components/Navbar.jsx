import { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    axios.get("http://localhost:3030/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user || null);
      })
      .catch(() => {
        setUser(null);
      });
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("staynest-auth-change", loadUser);

    return () => {
      window.removeEventListener("staynest-auth-change", loadUser);
    };
  }, []);

  const handleAddListing = (event) => {
    if (user) {
      return;
    }

    event.preventDefault();
    toast.error("Please login first.");
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3030/logout", {}, { withCredentials: true });
      setUser(null);
      window.dispatchEvent(new Event("staynest-auth-change"));
      toast.success("Logged out successfully.");
      navigate("/listings");
    } catch (err) {
      console.log(err);
      toast.error("Unable to logout right now.");
    }
  };

  return (
    <header className="navbar-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="brand-link">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-copy">
              <strong>StayNest</strong>
              <small>homes with a story</small>
            </span>
          </Link>
        </div>

        <div className="navbar-center">
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              Explore
            </NavLink>
            <NavLink to="/listings" className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              Stays
            </NavLink>
          </div>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink to="/wishlist" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                Wishlist
              </NavLink>
              <NavLink to="/bookings" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                Trips
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                Profile
              </NavLink>
              <span className="navbar-user">Hi, {user}</span>
              <button className="navbar-auth-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                Login
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => `navbar-auth-link signup${isActive ? " is-active" : ""}`}>
                Signup
              </NavLink>
            </>
          )}

          <Link to="/listings/new" className="navbar-action" onClick={handleAddListing}>
            Host a stay
          </Link>
        </div>
      </nav>
    </header>
  );
}
export default Navbar;
