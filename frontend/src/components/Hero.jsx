import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] },
});

const STATS = [
  { value: '2.4k', label: 'Orders' },
  { value: '4.9', label: 'Rating' },
  { value: '30m', label: 'Avg Time' },
];

function OrderButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to="/menu"
      style={{
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: 600,
        color: '#ffffff',
        background: hovered ? '#DC3800' : '#FF4500',
        padding: '16px 36px',
        borderRadius: 100,
        transition: 'background 0.3s ease, transform 0.2s ease',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        display: 'inline-block',
        transform: hovered ? 'scale(0.98)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Order Now
    </Link>
  );
}

function MenuLink() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to="/menu"
      style={{
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: 500,
        color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'color 0.3s ease',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      View Full Menu
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
        style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.3s ease' }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 72,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Editorial ambient glow, slightly off-center */}
      <div style={{
        position: 'absolute',
        right: '-10%',
        top: '35%',
        transform: 'translateY(-50%)',
        width: '60%',
        height: '100%',
        background: 'radial-gradient(circle at 60% 40%, rgba(255,69,0,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '72px 40px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 48,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* LEFT: Content */}
        <div style={{ position: 'relative', zIndex: 10, paddingTop: '8vh' }}>
          {/* Overline */}
          <motion.p
            {...fadeUp(0.05)}
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
          >
            <span style={{ width: 30, height: 1, backgroundColor: '#FF4500' }}></span>
            Fired to Perfection
          </motion.p>

          {/* Headline - tighter leading, bigger size, offset second line */}
          <motion.h1
            {...fadeUp(0.15)}
            style={{
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.05em',
              color: 'var(--text-primary)',
              fontSize: 'clamp(64px, 8vw, 110px)',
              marginBottom: 32,
              marginLeft: '-4px'
            }}
          >
            The Pizza<br />
            <span style={{ display: 'inline-block', transform: 'translateX(5%)', color: '#FF4500' }}>You've Been</span><br />
            Missing.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            {...fadeUp(0.25)}
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: 420,
              marginBottom: 48,
              fontWeight: 400,
              paddingLeft: '10%',
              borderLeft: '1px solid var(--border-color)'
            }}
          >
            Hand-stretched dough, San Marzano tomatoes, and imported
            fior di latte. Delivered to your door in 30 minutes, screaming hot.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.35)}
            style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 72, paddingLeft: '10%' }}
          >
            <OrderButton />
            <MenuLink />
          </motion.div>

          {/* Stats strip - completely restructured for editorial feel */}
          <motion.div
            {...fadeUp(0.45)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 48,
            }}
          >
            {STATS.map(({ value, label }, i) => (
              <div key={label} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontSize: 28, fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  {value}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: Pizza image with asymmetrical offset */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8, x: 100 }}
          animate={{
            opacity: 1,
            scale: 1.25,
            rotate: [2, -2, 2],
            x: 80,
            y: [30, -10, 30],
          }}
          transition={{
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'absolute',
            right: '-10%',
            top: '50%',
            marginTop: '-250px',
            width: '600px',
            pointerEvents: 'none'
          }}
        >
          <img
            src="/images/pizza-hero.png"
            alt="Neapolitan pizza"
            style={{
              width: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(-20px 40px 60px rgba(0,0,0,0.8)) drop-shadow(0 20px 40px rgba(255,69,0,0.15))',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
