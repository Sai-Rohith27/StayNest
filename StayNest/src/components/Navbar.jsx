import { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL, clearAuthToken } from "../utils/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    axios.get(`${API_URL}/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user || null);
      })
      .catch(() => {
        setUser(null);
      });
  };

  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail && Object.prototype.hasOwnProperty.call(event.detail, "user")) {
        setUser(event.detail.user || null);
        return;
      }

      loadUser();
    };

    loadUser();
    window.addEventListener("staynest-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("staynest-auth-change", handleAuthChange);
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
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      clearAuthToken();
      setUser(null);
      window.dispatchEvent(new CustomEvent("staynest-auth-change", {
        detail: { user: null },
      }));
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
              <NavIcon type="search" />
              Explore
            </NavLink>
            <NavLink to="/listings" className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              <NavIcon type="home" />
              Stays
            </NavLink>
          </div>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink to="/wishlist" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                <NavIcon type="heart" />
                Wishlist
              </NavLink>
              <NavLink to="/bookings" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                <NavIcon type="bag" />
                Trips
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                <NavIcon type="user" />
                Profile
              </NavLink>
              <span className="navbar-user" title={user}>
                <span className="navbar-user-avatar">{String(user).slice(0, 1).toUpperCase()}</span>
                <span>Hi, {user}</span>
              </span>
              <button className="navbar-auth-button" type="button" onClick={handleLogout}>
                <NavIcon type="logout" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `navbar-auth-link${isActive ? " is-active" : ""}`}>
                <NavIcon type="login" />
                Login
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => `navbar-auth-link signup${isActive ? " is-active" : ""}`}>
                <NavIcon type="userPlus" />
                Signup
              </NavLink>
            </>
          )}

          <Link to="/listings/new" className="navbar-action" onClick={handleAddListing}>
            <NavIcon type="plus" />
            Host a stay
          </Link>
        </div>
      </nav>
    </header>
  );
}

function NavIcon({ type }) {
  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    ),
    bag: (
      <>
        <path d="M6 7h12l1 14H5L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17 15 12 10 7" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </>
    ),
    login: (
      <>
        <path d="M14 7 19 12 14 17" />
        <path d="M19 12H7" />
        <path d="M3 3v18" />
      </>
    ),
    userPlus: (
      <>
        <path d="M15 21a7 7 0 0 0-14 0" />
        <circle cx="8" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
  };

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

export default Navbar;
