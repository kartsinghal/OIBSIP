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
  'Contact Us': '/contact',
};

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 40px) 40px',
      }}
    >
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
        }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 12px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 40px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-brand-col {
            grid-column: auto;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand-col">
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}>
                INFERNO<span style={{ color: '#FF4500' }}>.</span>
              </span>
            </Link>
            <p style={{
              fontSize: 13,
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: 200,
              margin: 0,
            }}>
              Handcrafted, wood-fired pizza. Delivered to your door.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginBottom: 20,
                marginTop: 0,
              }}>
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
        <div className="footer-bottom">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.8, margin: 0, letterSpacing: '-0.01em' }}>
            © {new Date().getFullYear()} Inferno Pizza. All rights reserved.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.8 }}>Bangalore, India</span>
            <span style={{ fontSize: 12, color: 'var(--border-color)' }}>·</span>
            <a
              href="mailto:hello@infernopizza.in"
              className="footer-link"
              style={{ fontSize: 12, textDecoration: 'none' }}
            >
              hello@infernopizza.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
