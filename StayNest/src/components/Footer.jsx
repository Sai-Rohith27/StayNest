import { Link } from "react-router-dom";
import "./Footer.css";

const footerSections = [
  {
    title: "Explore",
    items: [
      { label: "All stays", to: "/listings" },
      { label: "List a new property", to: "/listings/new" },
      { label: "City apartments" },
      { label: "Weekend escapes" },
    ],
  },
  {
    title: "Travel better",
    items: [
      { label: "Comfort-first stays" },
      { label: "Cleaner listing details" },
      { label: "Quick browse experience" },
      { label: "Clear nightly pricing" },
    ],
  },
  {
    title: "Hosting & support",
    items: [
      { label: "Easy stay publishing" },
      { label: "Edit details anytime" },
      { label: "Travel planning friendly UI" },
      { label: "Guest-ready stay management" },
    ],
  },
];

const legalItems = ["Privacy", "Terms", "Sitemap", "Company details", "Responsible hosting"];

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5Zm6.95 8.25h-3.09a14.84 14.84 0 0 0-1.24-5a7.79 7.79 0 0 1 4.33 5Zm-6.2-5.7c.85.98 1.57 3.1 1.79 5.7h-5.08c.22-2.6.94-4.72 1.79-5.7a1.49 1.49 0 0 1 1.5 0Zm-4.37.7a14.82 14.82 0 0 0-1.24 5H4.05a7.79 7.79 0 0 1 4.33-5Zm-4.33 6.5h3.09c.11 1.75.53 3.46 1.24 5a7.79 7.79 0 0 1-4.33-5Zm5.43 0h5.08c-.22 2.6-.94 4.72-1.79 5.7a1.49 1.49 0 0 1-1.5 0c-.85-.98-1.57-3.1-1.79-5.7Zm6.14 5a14.82 14.82 0 0 0 1.24-5h3.09a7.79 7.79 0 0 1-4.33 5Z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.34 21v-7.87h2.64l.39-3.06h-3.03V8.12c0-.89.24-1.49 1.52-1.49h1.63V3.89a21.18 21.18 0 0 0-2.38-.12c-2.35 0-3.97 1.44-3.97 4.08v2.22H7.47v3.06h2.67V21h3.2Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 4.5h-2.04l-3.74 4.28L10 4.5H4.5l5.73 7.85L4.8 19.5h2.04l4.31-4.92l3.58 4.92h5.5l-5.94-8.14L18.9 4.5Zm-3.29 13.34l-7.4-10.68h1.79l7.43 10.68h-1.82Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.4 3.5h9.2a3.9 3.9 0 0 1 3.9 3.9v9.2a3.9 3.9 0 0 1-3.9 3.9H7.4a3.9 3.9 0 0 1-3.9-3.9V7.4a3.9 3.9 0 0 1 3.9-3.9Zm0 1.8A2.1 2.1 0 0 0 5.3 7.4v9.2a2.1 2.1 0 0 0 2.1 2.1h9.2a2.1 2.1 0 0 0 2.1-2.1V7.4a2.1 2.1 0 0 0-2.1-2.1H7.4Zm9.6 1.35a1.05 1.05 0 1 1 0 2.1a1.05 1.05 0 0 1 0-2.1ZM12 7.9A4.1 4.1 0 1 1 7.9 12A4.1 4.1 0 0 1 12 7.9Zm0 1.8A2.3 2.3 0 1 0 14.3 12A2.3 2.3 0 0 0 12 9.7Z" />
    </svg>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-panel">
        <div className="site-footer-grid">
          <section className="site-footer-brand" aria-label="StayNest summary">
            <div className="site-footer-logo-row">
              <span className="site-footer-brand-mark">⌂</span>
              <div>
                <p className="site-footer-kicker">Travel with warmth</p>
                <h2 className="site-footer-title">StayNest</h2>
              </div>
            </div>

            <p className="site-footer-copy">
              StayNest is built for travelers who want calm, beautiful stays without crowded screens.
              Explore city breaks, work trips, family holidays, and slower weekend escapes in one
              polished browsing flow.
            </p>

            <div className="site-footer-tags" aria-label="Travel categories">
              <span>City stays</span>
              <span>Remote-work trips</span>
              <span>Family getaways</span>
              <span>Weekend escapes</span>
            </div>
          </section>

          {footerSections.map((section) => (
            <section className="site-footer-column" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="site-footer-strip">
          <div className="site-footer-meta" aria-label="Language and currency">
            <span className="site-footer-meta-item">
              <IconGlobe />
              English (IN)
            </span>
            <span className="site-footer-meta-item">₹ INR</span>
          </div>

          <div className="site-footer-socials" aria-label="Social presence">
            <span className="site-footer-social" title="Facebook">
              <IconFacebook />
            </span>
            <span className="site-footer-social" title="X">
              <IconX />
            </span>
            <span className="site-footer-social" title="Instagram">
              <IconInstagram />
            </span>
          </div>
        </div>

        <p className="site-footer-legal-copy">© {currentYear} StayNest. Travel-ready stays for every kind of trip.</p>

        <div className="site-footer-legal-links" aria-label="Legal information">
          {legalItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
