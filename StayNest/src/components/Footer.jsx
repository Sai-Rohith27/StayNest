import { Link } from "react-router-dom";
import "./Footer.css";

const footerSections = [
  {
    title: "Explore",
    items: [
      { label: "All stays", to: "/listings" },
      { label: "List a new property", to: "/listings/new" },
      "City apartments",
      "Weekend escapes",
      "Family getaways",
    ],
  },
  {
    title: "Travel better",
    items: [
      "Comfort-first stays",
      "Cleaner listing details",
      "Quick browse experience",
      "Clear nightly pricing",
      "Flexible cancellation info",
    ],
  },
  {
    title: "Hosting & support",
    items: [
      "Easy stay publishing",
      "Edit details anytime",
      "Travel planning friendly UI",
      "Guest-ready stay management",
      "Help Centre",
    ],
  },
  {
    title: "Trust & legal",
    items: [
      "Safety information",
      "Cancellation options",
      "Report a concern",
      "Privacy",
      "Responsible hosting",
    ],
  },
];

const tripTags = ["City stays", "Remote-work trips", "Family getaways", "Weekend escapes"];
const legalLinks = ["Privacy", "Terms", "Sitemap", "Company details", "Responsible hosting"];
const socialLinks = ["f", "X", "ig"];

function renderFooterItem(item) {
  const label = typeof item === "string" ? item : item.label;
  const to = typeof item === "string" ? "" : item.to;

  return (
    <li key={label}>
      {to ? <Link to={to}>{label}</Link> : <span>{label}</span>}
    </li>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <section className="site-footer-brand" aria-label="StayNest footer summary">
            <Link className="site-footer-logo" to="/listings" aria-label="StayNest home">
              <span aria-hidden="true">SN</span>
            </Link>
            <p className="site-footer-kicker">Travel with warmth</p>
            <h2>StayNest</h2>
            <p className="site-footer-copy">
              StayNest is built for travelers who want calm, beautiful stays without crowded screens.
              Explore city breaks, work trips, family holidays, and slower weekend escapes in one
              polished browsing flow.
            </p>
            <div className="site-footer-tags" aria-label="Popular trip types">
              {tripTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>

          <div className="site-footer-grid">
            {footerSections.map((section) => (
              <section className="site-footer-column" key={section.title}>
                <h3>{section.title}</h3>
                <ul>{section.items.map(renderFooterItem)}</ul>
              </section>
            ))}
          </div>
        </div>

        <div className="site-footer-meta">
          <div className="site-footer-settings" aria-label="Regional settings">
            <button type="button">
              <span aria-hidden="true">IN</span>
              English (IN)
            </button>
            <button type="button">
              <span aria-hidden="true">Rs</span>
              INR
            </button>
          </div>

          <div className="site-footer-social" aria-label="Social links">
            {socialLinks.map((item) => (
              <button type="button" key={item} aria-label={`StayNest on ${item}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>&copy; {currentYear} StayNest. Travel-ready stays for every kind of trip.</p>
          <nav aria-label="Footer links">
            {legalLinks.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
