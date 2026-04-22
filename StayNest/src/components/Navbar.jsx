import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="brand-link">
            <span className="brand-mark">⌂</span>
            <h2 className="brand-title">StayNest</h2>
          </Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              Home
            </NavLink>
            <NavLink to="/listings" className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              All Listings
            </NavLink>
          </div>
        </div>

        <Link to="/listings/new" className="navbar-action">
          + Add Listing
        </Link>
      </nav>
    </header>
  );
}
export default Navbar;
