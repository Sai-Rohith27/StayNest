import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "16px 40px",
      borderBottom: "1px solid #ebebeb", background: "#fff",
      position: "sticky", top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2 style={{ color: "#ff385c", margin: 0, fontSize: "24px" }}>🏠 StayNest</h2>
      </Link>
      <Link to="/listings/new">
        <button style={{
          background: "#ff385c", color: "white", border: "none",
          padding: "10px 20px", borderRadius: "24px",
          cursor: "pointer", fontWeight: "600", fontSize: "14px"
        }}>
          + Add Listing
        </button>
      </Link>
    </nav>
  );
}

export default Navbar;