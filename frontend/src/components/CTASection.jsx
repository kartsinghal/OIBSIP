import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RATINGS = [
  { value: '4.9', label: 'App Store' },
  { value: '4.8', label: 'Play Store' },
  { value: '#1', label: 'Food Delivery' },
];

export default function CTASection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '128px 40px',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 80,
            alignItems: 'end',
          }}
        >

          {/* Left: Headline */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 20,
              }}
            >
              Get Started
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(52px, 6vw, 96px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.92,
                color: 'var(--text-primary)',
                marginBottom: 28,
              }}
            >
              Pizza Night<br />
              <span style={{ color: '#FF4500' }}>Starts Here.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                maxWidth: 380,
                margin: 0,
              }}
            >
              Fresh pizza, real-time tracking, and a satisfaction guarantee
              — all in under 30 minutes.
            </motion.p>
          </div>

          {/* Right: CTAs + ratings */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 260,
            }}
          >
            <Link
              to="/menu"
              style={{
                textDecoration: 'none',
                textAlign: 'center',
                background: '#FF4500',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                padding: '15px 32px',
                borderRadius: 100,
                transition: 'background 0.2s ease',
                letterSpacing: '-0.01em',
                display: 'block',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#DC3800'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF4500'}
            >
              Order Online Now
            </Link>

            <button
              style={{
                textAlign: 'center',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                padding: '15px 32px',
                borderRadius: 100,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '-0.01em',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Download the App
            </button>

            {/* Ratings strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                paddingTop: 20,
                marginTop: 8,
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {RATINGS.map(({ value, label }) => (
                <div key={label}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.03em',
                      marginBottom: 3,
                    }}
                  >
                    {value}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
