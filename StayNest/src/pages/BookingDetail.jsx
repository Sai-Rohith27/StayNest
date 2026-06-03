import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(() => {
    axios.get(`https://staynest-cr08.onrender.com/bookings/${bookingId}`, { withCredentials: true })
      .then((res) => setBooking(res.data))
      .catch(() => toast.error("Unable to load booking."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const cancelBooking = async () => {
    try {
      await axios.patch(`https://staynest-cr08.onrender.com/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      toast.success("Booking cancelled.");
      loadBooking();
    } catch {
      toast.error("Unable to cancel booking.");
    }
  };

  if (loading) {
    return <main className="dashboard-page"><div className="dashboard-state">Loading booking...</div></main>;
  }

  if (!booking) {
    return <main className="dashboard-page"><div className="dashboard-state">Booking not found.</div></main>;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Trip detail</p>
          <h1 className="dashboard-title">{booking.listing?.title || "Booked stay"}</h1>
          <p className="dashboard-subtitle">{getListingLocation(booking.listing)}</p>
        </div>
        <button className="dashboard-button" type="button" onClick={() => navigate("/bookings")}>Back to trips</button>
      </header>

      <section className="dashboard-card booking-detail-card">
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
          <div className="profile-stats">
            <div className="profile-stat">
              <span>Check in</span>
              <strong>{formatDate(booking.checkIn)}</strong>
            </div>
            <div className="profile-stat">
              <span>Check out</span>
              <strong>{formatDate(booking.checkOut)}</strong>
            </div>
            <div className="profile-stat">
              <span>Guests</span>
              <strong>{booking.guests}</strong>
            </div>
          </div>

          <div className="dashboard-card-meta">
            <strong>{formatPrice(booking.totalPrice)}</strong>
            <span className={`dashboard-status ${booking.status}`}>{booking.status}</span>
          </div>

          <div className="dashboard-actions">
            <Link className="dashboard-button primary" to={`/listings/${booking.listing?._id}`}>View listing</Link>
            {booking.status !== "cancelled" && (
              <button className="dashboard-button danger" type="button" onClick={cancelBooking}>Cancel booking</button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
