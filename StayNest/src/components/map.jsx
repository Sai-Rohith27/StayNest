import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";
import L from "leaflet";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

const INDIA_CENTER = [20.5937, 78.9629];
const PLACE_COORDINATES = [
  { match: ["dashashwamedh", "varanasi"], position: [25.3062, 83.0105] },
  { match: ["varanasi", "uttar pradesh"], position: [25.3176, 82.9739] },
  { match: ["mamidipalli", "hyderabad"], position: [17.2422, 78.4303] },
  { match: ["jubilee hills", "hyderabad"], position: [17.4326, 78.4071] },
  { match: ["hyderabad", "telangana"], position: [17.3850, 78.4867] },
  { match: ["tirupati", "andhra pradesh"], position: [13.6288, 79.4192] },
  { match: ["udaipur", "rajasthan"], position: [24.5854, 73.7125] },
  { match: ["jaisalmer", "rajasthan"], position: [26.9157, 70.9083] },
  { match: ["alleppey", "kerala"], position: [9.4981, 76.3388] },
  { match: ["wayanad", "kerala"], position: [11.6854, 76.1320] },
  { match: ["north goa", "goa"], position: [15.5553, 73.7517] },
  { match: ["vagator", "goa"], position: [15.5989, 73.7448] },
  { match: ["goa"], position: [15.4909, 73.8278] },
  { match: ["bandra", "mumbai"], position: [19.0596, 72.8295] },
  { match: ["lonavala", "maharashtra"], position: [18.7546, 73.4062] },
  { match: ["gulmarg", "kashmir"], position: [34.0484, 74.3805] },
  { match: ["white town", "pondicherry"], position: [11.9367, 79.8350] },
];

function createStayIcon(price, isActive = false) {
  return L.divIcon({
    className: `staynest-price-marker${isActive ? " is-active" : ""}`,
    html: `<span><b>${price}</b></span>`,
    iconSize: [74, 64],
    iconAnchor: [37, 62],
    popupAnchor: [0, -60],
  });
}

function FitMapToListings({ listings, fallbackCenter }) {
  const map = useMap();

  useEffect(() => {
    const positions = listings
      .map((listing) => listing.position)
      .filter(Boolean);

    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [42, 42], maxZoom: 12 });
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }

    map.setView(fallbackCenter, 5);
  }, [fallbackCenter, listings, map]);

  return null;
}

function getFallbackPosition(listing) {
  const searchableText = [
    listing?.location,
    listing?.country,
    listing?.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return PLACE_COORDINATES.find((place) =>
    place.match.every((token) => searchableText.includes(token))
  )?.position || null;
}

function normalizePosition(listing, fallbackCoordinates) {
  const lat = Number(listing?.coordinates?.lat ?? fallbackCoordinates?.[0]);
  const lng = Number(listing?.coordinates?.lng ?? fallbackCoordinates?.[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return getFallbackPosition(listing);
  }

  return [lat, lng];
}

function Map({
  coordinates,
  locationName,
  listings = [],
  activeListingId = "",
  onMarkerSelect,
  className = "",
  height = 450,
}) {
  const mapListings = useMemo(() => {
    if (Array.isArray(listings) && listings.length > 0) {
      return listings.map((listing) => ({
        ...listing,
        position: normalizePosition(listing),
      }));
    }

    return [{
      _id: "single-location",
      title: locationName || "StayNest location",
      location: locationName || "India",
      price: "",
      image: null,
      position: normalizePosition(null, coordinates) || INDIA_CENTER,
    }];
  }, [coordinates, listings, locationName]);

  const validListings = mapListings.filter((listing) => listing.position);
  const center = validListings[0]?.position || coordinates || INDIA_CENTER;

  return (
    <div className={`staynest-map-shell ${className}`.trim()} style={{ height }}>
      <MapContainer
        center={center}
        zoom={validListings.length > 1 ? 6 : 15}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapToListings listings={validListings} fallbackCenter={center} />

        {validListings.map((listing) => {
          const imageUrl = getListingImage(listing);
          const locationLabel = getListingLocation(listing);
          const isActive = String(activeListingId) === String(listing._id);

          return (
            <Marker
              key={listing._id}
              position={listing.position}
              icon={createStayIcon(listing.price ? formatPrice(listing.price) : "Stay", isActive)}
              eventHandlers={{
                click: () => onMarkerSelect?.(listing._id),
              }}
            >
              <Popup className="staynest-map-popup">
                <div className="map-popup-card">
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div>
                    <strong>{listing.title}</strong>
                    <span>{locationLabel}</span>
                    {listing.price ? <b>{formatPrice(listing.price)} night</b> : null}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default Map;
