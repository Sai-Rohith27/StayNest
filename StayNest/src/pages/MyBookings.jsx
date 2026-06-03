import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    axios.get("https://staynest-cr08.onrender.com/bookings", { withCredentials: true })
      .then((res) => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Unable to load bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      await axios.patch(`https://staynest-cr08.onrender.com/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      toast.success("Booking cancelled.");
      loadBookings();
    } catch {
      toast.error("Unable to cancel booking.");
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Trips</p>
          <h1 className="dashboard-title">My bookings</h1>
          <p className="dashboard-subtitle">Track the stays you reserved.</p>
        </div>
        <Link className="dashboard-button primary" to="/listings">Find another stay</Link>
      </header>

      {loading && <div className="dashboard-state">Loading bookings...</div>}
      {!loading && bookings.length === 0 && <div className="dashboard-state">No bookings yet.</div>}

      <section className="dashboard-grid">
        {bookings.map((booking) => (
          <article className="dashboard-card" key={booking._id}>
            <div className="dashboard-card-media">
              <img
                src={getListingImage(booking.listing)}
                alt={booking.listing?.title || "Booked stay"}
                onError={(event) => {
                  event.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <div className="dashboard-card-body">
              <h3>{booking.listing?.title || "Stay"}</h3>
              <p>{getListingLocation(booking.listing)}</p>
              <p>{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)} · {booking.guests} guests</p>
              <div className="dashboard-card-meta">
                <strong>{formatPrice(booking.totalPrice)}</strong>
                <span className={`dashboard-status ${booking.status}`}>{booking.status}</span>
              </div>
              <div className="dashboard-actions">
                <Link className="dashboard-button" to={`/bookings/${booking._id}`}>Trip details</Link>
                <Link className="dashboard-button" to={`/listings/${booking.listing?._id}`}>View stay</Link>
                {booking.status !== "cancelled" && (
                  <button className="dashboard-button danger" type="button" onClick={() => cancelBooking(booking._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
