import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Order: ['Menu', 'Build Your Own', 'Track Order', 'Offers & Deals'],
  Company: ['About Us', 'Careers', 'Blog', 'Press Kit'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
};

const LINK_MAP = {
  'Menu': '/menu',
  'Build Your Own': '/#builder',
  'Track Order': '/track-order',
  'About Us': '/about',
};

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '80px 40px 40px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 64,
          }}
        >
          {/* Brand column */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 900,
                  fontSize: 20,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                }}
              >
                INFERNO<span style={{ color: '#FF4500' }}>.</span>
              </span>
            </Link>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                maxWidth: 200,
                margin: 0,
              }}
            >
              Handcrafted, wood-fired pizza. Delivered to your door.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  marginBottom: 20,
                }}
              >
                {category}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(link => (
                  <li key={link}>
                    <Link
                      to={LINK_MAP[link] || '/'}
                      className="footer-link"
                      style={{
                        textDecoration: 'none',
                        fontSize: 13,
                        letterSpacing: '-0.01em',
                        fontWeight: 400,
                      }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 32,
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.8, margin: 0, letterSpacing: '-0.01em' }}>
            © {new Date().getFullYear()} Inferno Pizza. All rights reserved.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.8 }}>Bangalore, India</span>
            <span style={{ fontSize: 12, color: 'var(--border-color)' }}>·</span>
            <a
              href="mailto:hello@infernopizza.in"
              className="footer-link"
              style={{
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              hello@infernopizza.in
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
