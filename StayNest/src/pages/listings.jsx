import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Listings.css";
import StayMap from "../components/map";
import { formatPrice, getListingImage, PLACEHOLDER_IMAGE } from "../utils/listingUi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://staynest-cr08.onrender.com";

const countryToPlace = {
  "Uttar Pradesh": "Varanasi",
  Telangana: "Hyderabad",
  Maharashtra: "Mumbai",
};

const emptySearchForm = {
  destination: "",
  checkIn: "",
  checkOut: "",
  adults: 1,
  children: 0,
  infants: 0,
  childAges: [],
};

function getStoredRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem("staynest-recent-searches") || "[]");
  } catch {
    return [];
  }
}

function getPlaceName(listing) {
  return countryToPlace[listing.country] || listing.country || "India";
}

function getNightCount(listing) {
  const match = String(listing.dates || "").match(/(\d+)-(\d+)/);
  if (!match) return 1;
  return Math.max(1, Number(match[2]) - Number(match[1]));
}

function getTotalPrice(listing) {
  return Number(listing.price || 0) * getNightCount(listing);
}

function ListingCard({ listing, variant = "row", isActive = false, isSaved = false, onClick, onHover, onImageError, onSave }) {
  const imageUrl = getListingImage(listing);
  const rating = Number(listing.rating || 0);
  const nights = getNightCount(listing);

  return (
    <article
      className={`stay-tile stay-tile-${variant}${isActive ? " is-active" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div className="stay-tile-media">
        <img
          src={imageUrl}
          alt={listing.title}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            onImageError?.(listing._id);
          }}
        />
        {listing.guestFavorite && <span className="stay-tile-badge">Guest favourite</span>}
        <button
          className={`stay-tile-heart${isSaved ? " is-saved" : ""}`}
          type="button"
          aria-label={`Save ${listing.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onSave?.(listing._id);
          }}
        />
      </div>

      <div className="stay-tile-body">
        <div className="stay-tile-mainline">
          <h3>{listing.title}</h3>
          {rating > 0 && <span>{rating.toFixed(2)}</span>}
        </div>

        <p className="stay-tile-muted">{listing.location}</p>
        <p className="stay-tile-muted">{listing.distance}</p>

        <p className="stay-tile-price">
          <strong>{formatPrice(getTotalPrice(listing))}</strong>
          <span> for {nights} nights</span>
        </p>

        {variant === "map" && listing.freeCancellation && (
          <span className="stay-tile-cancel">Free cancellation</span>
        )}
      </div>
    </article>
  );
}

function PlaceRow({ place, listings, onOpenPlace, onOpenListing, onImageError, onSave, savedListingIds = [] }) {
  const trackRef = useRef(null);

  const scrollRow = (direction) => {
    trackRef.current?.scrollBy({
      left: direction * 720,
      behavior: "smooth",
    });
  };

  return (
    <section className="place-row">
      <div className="place-row-head">
        <button className="place-title-button" type="button" onClick={() => onOpenPlace(place)}>
          Popular homes in {place}
          <span aria-hidden="true">›</span>
        </button>

        <div className="place-row-controls">
          <button className="place-scroll-button prev" type="button" onClick={() => scrollRow(-1)} aria-label={`Scroll ${place} left`} />
          <button className="place-scroll-button next" type="button" onClick={() => scrollRow(1)} aria-label={`Scroll ${place} right`} />
        </div>
      </div>

      <div className="place-row-track" ref={trackRef}>
        {listings.slice(0, 12).map((listing) => (
          <ListingCard
            key={listing._id}
            listing={listing}
            onClick={() => onOpenListing(listing._id)}
            onImageError={onImageError}
            onSave={onSave}
            isSaved={savedListingIds.includes(listing._id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeListingId, setActiveListingId] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState([]);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [filters, setFilters] = useState({
    maxPrice: "",
    minRating: "",
    freeCancellation: false,
    guestFavorite: false,
  });
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const [searchError, setSearchError] = useState("");
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedPlace = useMemo(() => {
    return searchParams.get("place") || "";
  }, [searchParams]);
  const hasSearch = useMemo(() => {
    return ["destination", "checkIn", "checkOut", "adults", "children", "infants"].some((key) => searchParams.has(key));
  }, [searchParams]);
  const resultLabel = useMemo(() => {
    const destination = searchParams.get("destination") || selectedPlace;
    return destination ? `stays for ${destination}` : "matching stays";
  }, [searchParams, selectedPlace]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const children = Number(searchParams.get("children") || 0);
    const childAges = (searchParams.get("childAges") || "")
      .split(",")
      .filter(Boolean)
      .slice(0, children);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchForm({
      destination: searchParams.get("destination") || searchParams.get("place") || "",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      adults: Number(searchParams.get("adults") || 1),
      children,
      infants: Number(searchParams.get("infants") || 0),
      childAges,
    });
  }, [location.search]);

  useEffect(() => {
    // 🚨 CRITICAL FIX 2 APPLIED HERE (Wishlist fetch)
    axios.get(`${API_BASE_URL}/wishlist`, { withCredentials: true })
      .then((res) => {
        const ids = Array.isArray(res.data) ? res.data.map((listing) => listing._id) : [];
        setSavedListingIds(ids);
      })
      .catch(() => setSavedListingIds([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // 🚨 CRITICAL FIX 2 APPLIED HERE (Listings fetch)
    axios.get(`${API_BASE_URL}/listings${location.search}`)
      .then((res) => {
        setListings(Array.isArray(res.data) ? res.data : []);
        setError("");
      })
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.error || "Unable to load listings right now.");
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      const imageUrl = getListingImage(listing);
      if (imageUrl === PLACEHOLDER_IMAGE || brokenImageIds.includes(listing._id)) return false;
      if (filters.maxPrice && Number(listing.price || 0) > Number(filters.maxPrice)) return false;
      if (filters.minRating && Number(listing.rating || 0) < Number(filters.minRating)) return false;
      if (filters.freeCancellation && !listing.freeCancellation) return false;
      if (filters.guestFavorite && !listing.guestFavorite) return false;
      return true;
    });
  }, [brokenImageIds, filters, listings]);

  const groupedListings = useMemo(() => {
    return visibleListings.reduce((groups, listing) => {
      const place = getPlaceName(listing);
      if (!groups[place]) groups[place] = [];
      groups[place].push(listing);
      return groups;
    }, {});
  }, [visibleListings]);

  const placeEntries = useMemo(() => Object.entries(groupedListings), [groupedListings]);
  const searchSuggestions = useMemo(() => {
    const suggestionMap = new globalThis.Map();

    visibleListings.forEach((listing) => {
      [
        listing.title,
        listing.location,
        getPlaceName(listing),
        listing.country,
      ].filter(Boolean).forEach((value) => {
        suggestionMap.set(String(value).toLowerCase(), String(value));
      });
    });

    return Array.from(suggestionMap.values()).sort((a, b) => a.localeCompare(b));
  }, [visibleListings]);
  const selectedListings = useMemo(() => {
    if (hasSearch) {
      return visibleListings;
    }

    return selectedPlace ? groupedListings[selectedPlace] || [] : [];
  }, [groupedListings, hasSearch, selectedPlace, visibleListings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveListingId(selectedListings[0]?._id || "");
  }, [selectedListings]);

  const openPlace = (place) => {
    navigate(`/listings?place=${encodeURIComponent(place)}`);
  };

  const updateSearchField = (name, value) => {
    setSearchForm((current) => ({ ...current, [name]: value }));
    setSearchError("");
  };

  const updateChildAge = (index, value) => {
    setSearchForm((current) => {
      const childAges = [...current.childAges];
      childAges[index] = value;
      return { ...current, childAges };
    });
    setSearchError("");
  };

  const updateGuestPreset = (value) => {
    const guestPresets = {
      solo: { adults: 1, children: 0, infants: 0, childAges: [] },
      couple: { adults: 2, children: 0, infants: 0, childAges: [] },
      family: { adults: 2, children: 1, infants: 0, childAges: [searchForm.childAges[0] || ""] },
      familyPlus: { adults: 2, children: 2, infants: 0, childAges: [searchForm.childAges[0] || "", searchForm.childAges[1] || ""] },
      infant: { adults: 2, children: 0, infants: 1, childAges: [] },
    };

    setSearchForm((current) => ({ ...current, ...guestPresets[value] }));
    setSearchError("");
  };

  const getGuestPreset = () => {
    if (searchForm.adults === 1 && searchForm.children === 0 && searchForm.infants === 0) return "solo";
    if (searchForm.adults === 2 && searchForm.children === 0 && searchForm.infants === 0) return "couple";
    if (searchForm.adults === 2 && searchForm.children === 1) return "family";
    if (searchForm.adults === 2 && searchForm.children === 2) return "familyPlus";
    if (searchForm.infants > 0) return "infant";
    return "solo";
  };

  const submitSearch = (event) => {
    event.preventDefault();

    if (searchForm.checkIn && searchForm.checkOut && searchForm.checkOut <= searchForm.checkIn) {
      setSearchError("Check out must be after check in.");
      return;
    }

    if (searchForm.children > 0 && searchForm.childAges.some((age) => age === "")) {
      setSearchError("Please add every child age.");
      return;
    }

    const params = new URLSearchParams();
    if (searchForm.destination.trim()) params.set("destination", searchForm.destination.trim());
    if (searchForm.checkIn) params.set("checkIn", searchForm.checkIn);
    if (searchForm.checkOut) params.set("checkOut", searchForm.checkOut);
    params.set("adults", String(searchForm.adults));
    if (searchForm.children > 0) params.set("children", String(searchForm.children));
    if (searchForm.infants > 0) params.set("infants", String(searchForm.infants));
    if (searchForm.childAges.length > 0) params.set("childAges", searchForm.childAges.join(","));

    const exactListingMatch = visibleListings.find((listing) => {
      const searchValue = searchForm.destination.trim().toLowerCase();
      return searchValue && String(listing.title || "").trim().toLowerCase() === searchValue;
    });

    if (exactListingMatch?._id) {
      const nextRecent = [searchForm.destination.trim(), ...recentSearches.filter((item) => item !== searchForm.destination.trim())].slice(0, 5);
      localStorage.setItem("staynest-recent-searches", JSON.stringify(nextRecent));
      navigate(`/listings/${exactListingMatch._id}?${params.toString()}`);
      return;
    }

    if (searchForm.destination.trim()) {
      const nextRecent = [searchForm.destination.trim(), ...recentSearches.filter((item) => item !== searchForm.destination.trim())].slice(0, 5);
      localStorage.setItem("staynest-recent-searches", JSON.stringify(nextRecent));
      setRecentSearches(nextRecent);
    }

    navigate(`/listings?${params.toString()}`);
  };

  const openListing = (id) => {
    navigate(`/listings/${id}`);
  };

  const toggleSavedListing = async (id) => {
    try {
      // 🚨 CRITICAL FIX 2 APPLIED HERE (Wishlist POST)
      const res = await axios.post(`${API_BASE_URL}/wishlist/${id}`, {}, { withCredentials: true });
      setSavedListingIds((currentIds) =>
        res.data.saved
          ? [...new Set([...currentIds, id])]
          : currentIds.filter((savedId) => savedId !== id)
      );
      toast.success(res.data.saved ? "Saved to wishlist." : "Removed from wishlist.");
    } catch {
      toast.error("Please login first to save stays.");
      navigate("/login");
    }
  };

  const hideBrokenImageListing = (id) => {
    setBrokenImageIds((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id]
    );
  };

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  if (loading) {
    return <div className="listings-loading">Loading amazing stays...</div>;
  }

  if (selectedPlace || hasSearch) {
    return (
      <main className="map-results-page">
        <div className="results-search-bar">
          <button type="button" onClick={() => navigate("/listings")} className="results-logo-button">
            StayNest
          </button>
          <div className="results-search-pill">
            <span>{searchForm.destination || selectedPlace || "Anywhere"}</span>
            <span>{searchForm.checkIn && searchForm.checkOut ? `${searchForm.checkIn} to ${searchForm.checkOut}` : "Any dates"}</span>
            <span>{searchForm.adults + searchForm.children} guests</span>
            <button type="button" onClick={() => navigate("/listings")} aria-label="Clear search" />
          </div>
          <div className="results-filter-strip">
            <label>
              Max price
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(event) => updateFilter("maxPrice", event.target.value)}
                placeholder="Any"
              />
            </label>
            <label>
              Rating
              <select value={filters.minRating} onChange={(event) => updateFilter("minRating", event.target.value)}>
                <option value="">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
            </label>
            <label className="results-check-filter">
              <input
                type="checkbox"
                checked={filters.freeCancellation}
                onChange={(event) => updateFilter("freeCancellation", event.target.checked)}
              />
              Free cancellation
            </label>
            <label className="results-check-filter">
              <input
                type="checkbox"
                checked={filters.guestFavorite}
                onChange={(event) => updateFilter("guestFavorite", event.target.checked)}
              />
              Guest favourite
            </label>
          </div>
        </div>

        <div className="results-split">
          <section className="results-list-panel">
            <h1>{selectedListings.length} {resultLabel}</h1>
            {error && <div className="listings-error">{error}</div>}
            {!error && selectedListings.length === 0 && <div className="listings-empty">No stays match this search yet.</div>}
            {!error && selectedListings.length === 0 && (
              <div className="results-suggestion-box">
                Try a wider date range, remove filters, or search one of these recent places:
                {recentSearches.map((item) => (
                  <button type="button" key={item} onClick={() => updateSearchField("destination", item)}>
                    {item}
                  </button>
                ))}
              </div>
            )}

            <div className="results-grid">
              {selectedListings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  variant="map"
                  isActive={String(activeListingId) === String(listing._id)}
                  onClick={() => openListing(listing._id)}
                  onHover={() => setActiveListingId(listing._id)}
                  onImageError={hideBrokenImageListing}
                  onSave={toggleSavedListing}
                  isSaved={savedListingIds.includes(listing._id)}
                />
              ))}
            </div>
          </section>

          <aside className="results-map-panel">
            <StayMap
              listings={selectedListings}
              activeListingId={activeListingId}
              onMarkerSelect={setActiveListingId}
              height="calc(100vh - 92px)"
            />
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Find your next stay</h1>
          <p>Discover unique homes across India and beyond</p>
          <form className="home-search-card" aria-label="Search stays" onSubmit={submitSearch}>
            <label className="home-search-field">
              <span>Where</span>
              <input
                type="text"
                list="staynest-search-suggestions"
                value={searchForm.destination}
                onChange={(event) => updateSearchField("destination", event.target.value)}
                placeholder="Search destinations or stays"
              />
              <datalist id="staynest-search-suggestions">
                {recentSearches.map((suggestion) => (
                  <option value={suggestion} key={`recent-${suggestion}`} />
                ))}
                {searchSuggestions.map((suggestion) => (
                  <option value={suggestion} key={suggestion} />
                ))}
              </datalist>
            </label>
            <label className="home-search-field">
              <span>Check in</span>
              <input
                type="date"
                value={searchForm.checkIn}
                onChange={(event) => updateSearchField("checkIn", event.target.value)}
              />
            </label>
            <label className="home-search-field">
              <span>Check out</span>
              <input
                type="date"
                value={searchForm.checkOut}
                min={searchForm.checkIn || undefined}
                onChange={(event) => updateSearchField("checkOut", event.target.value)}
              />
            </label>
            <div className="home-search-field home-guest-field">
              <span>Who</span>
              <select value={getGuestPreset()} onChange={(event) => updateGuestPreset(event.target.value)}>
                <option value="solo">1 adult</option>
                <option value="couple">2 adults</option>
                <option value="family">Family: 2 adults, 1 child</option>
                <option value="familyPlus">Family: 2 adults, 2 children</option>
                <option value="infant">2 adults, 1 infant</option>
              </select>
              {searchForm.children > 0 && (
                <div className="child-age-inline">
                  {searchForm.childAges.map((age, index) => (
                    <select
                      value={age}
                      key={index}
                      aria-label={`Child ${index + 1} age`}
                      onChange={(event) => updateChildAge(index, event.target.value)}
                    >
                      <option value="">Child {index + 1} age</option>
                      {Array.from({ length: 11 }, (_, ageOption) => ageOption + 2).map((ageOption) => (
                        <option value={ageOption} key={ageOption}>{ageOption}</option>
                      ))}
                    </select>
                  ))}
                </div>
              )}
            </div>
            <button
              className="home-search-submit"
              type="submit"
              aria-label="Search stays"
            />
          </form>
          {searchError && <div className="home-search-error">{searchError}</div>}
        </div>
      </section>

      <section className="place-rows-shell">
        {error && <div className="listings-error">{error}</div>}
        {!error && placeEntries.length === 0 && <div className="listings-empty">No stays found yet.</div>}

        {placeEntries.map(([place, items]) => (
          <PlaceRow
            key={place}
            place={place}
            listings={items}
            onOpenPlace={openPlace}
            onOpenListing={openListing}
            onImageError={hideBrokenImageListing}
            onSave={toggleSavedListing}
            savedListingIds={savedListingIds}
          />
        ))}
      </section>
    </main>
  );
}
