import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3030/profile", { withCredentials: true })
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Unable to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const joinedDate = profile?.user?.createdAt
    ? new Date(profile.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Account</p>
          <h1 className="dashboard-title">Profile</h1>
          <p className="dashboard-subtitle">Your StayNest account overview.</p>
        </div>
      </header>

      {loading && <div className="dashboard-state">Loading profile...</div>}

      {profile && (
        <section className="dashboard-card profile-panel">
          <div>
            <p className="dashboard-kicker">Signed in as</p>
            <h2 className="dashboard-title">{profile.user?.username}</h2>
            <p className="dashboard-subtitle">{profile.user?.email}</p>
            <p className="dashboard-subtitle">Joined {joinedDate}</p>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span>Bookings</span>
              <strong>{profile.stats?.bookings || 0}</strong>
            </div>
            <div className="profile-stat">
              <span>Listings</span>
              <strong>{profile.stats?.listings || 0}</strong>
            </div>
            <div className="profile-stat">
              <span>Saved</span>
              <strong>{profile.stats?.wishlist || 0}</strong>
            </div>
          </div>
          <div className="dashboard-actions">
            <Link className="dashboard-button" to="/bookings">My bookings</Link>
            <Link className="dashboard-button" to="/wishlist">Wishlist</Link>
            <Link className="dashboard-button primary" to="/host">Host dashboard</Link>
          </div>
        </section>
      )}
    </main>
  );
}
