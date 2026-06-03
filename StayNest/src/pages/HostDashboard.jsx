import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

export default function HostDashboard() {
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("'https://staynest-cr08.onrender.com/host/listings", { withCredentials: true }),
      axios.get("https://staynest-cr08.onrender.com/bookings/host", { withCredentials: true }),
    ])
      .then(([listingRes, bookingRes]) => {
        setListings(Array.isArray(listingRes.data) ? listingRes.data : []);
        setReservations(Array.isArray(bookingRes.data) ? bookingRes.data : []);
      })
      .catch(() => toast.error("Unable to load host dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Hosting</p>
          <h1 className="dashboard-title">Host dashboard</h1>
          <p className="dashboard-subtitle">Manage the stays you created.</p>
        </div>
        <Link className="dashboard-button primary" to="/listings/new">Create listing</Link>
      </header>

      {loading && <div className="dashboard-state">Loading your listings...</div>}
      {!loading && listings.length === 0 && <div className="dashboard-state">You have not hosted a stay yet.</div>}

      {!loading && reservations.length > 0 && (
        <>
          <header className="dashboard-header compact">
            <div>
              <p className="dashboard-kicker">Reservations</p>
              <h2 className="dashboard-section-title">Guest bookings</h2>
            </div>
          </header>
          <section className="dashboard-grid">
            {reservations.map((booking) => (
              <article className="dashboard-card" key={booking._id}>
                <div className="dashboard-card-body">
                  <h3>{booking.listing?.title || "Stay"}</h3>
                  <p>{booking.user?.username || "Guest"} · {booking.user?.email || "No email"}</p>
                  <p>{new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}</p>
                  <div className="dashboard-card-meta">
                    <strong>{formatPrice(booking.totalPrice)}</strong>
                    <span className={`dashboard-status ${booking.status}`}>{booking.status}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <header className="dashboard-header compact">
        <div>
          <p className="dashboard-kicker">Listings</p>
          <h2 className="dashboard-section-title">Your stays</h2>
        </div>
      </header>

      <section className="dashboard-grid">
        {listings.map((listing) => (
          <article className="dashboard-card" key={listing._id}>
            <div className="dashboard-card-media">
              <img
                src={getListingImage(listing)}
                alt={listing.title}
                onError={(event) => {
                  event.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <div className="dashboard-card-body">
              <h3>{listing.title}</h3>
              <p>{getListingLocation(listing)}</p>
              <div className="dashboard-card-meta">
                <strong>{formatPrice(listing.price)}</strong>
                <span className="dashboard-status">{listing.reviewsCount || 0} reviews</span>
              </div>
              <div className="dashboard-actions">
                <Link className="dashboard-button" to={`/listings/${listing._id}`}>View</Link>
                <Link className="dashboard-button" to={`/listings/${listing._id}/edit`}>Edit</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
