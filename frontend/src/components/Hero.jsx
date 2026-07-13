import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
        whiteSpace: 'nowrap',
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
        whiteSpace: 'nowrap',
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <style>{`
        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(40px, 8vw, 72px) clamp(20px, 5vw, 40px);
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .hero-pizza-wrapper {
          position: absolute;
          right: -10%;
          top: 50%;
          margin-top: -250px;
          width: 600px;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          padding-top: 8vh;
        }
        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 56px;
          flex-wrap: wrap;
        }
        .hero-stats-row {
          display: flex;
          align-items: flex-start;
          gap: 48px;
        }
        
        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding: clamp(20px, 5vw, 40px) 20px !important;
            gap: 24px !important;
          }
          .hero-content {
            padding-top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-content h1 {
            font-size: clamp(38px, 11vw, 56px) !important;
            margin-left: 0 !important;
            line-height: 1 !important;
            margin-bottom: 24px !important;
          }
          .hero-content h1 span {
            transform: none !important;
            display: block !important;
          }
          .hero-content h1 br {
            display: none !important;
          }
          .hero-content p.subtext {
            padding-left: 0 !important;
            border-left: none !important;
            text-align: center;
            font-size: clamp(14px, 4vw, 16px) !important;
            line-height: 1.6 !important;
            margin-bottom: 32px !important;
            color: var(--text-primary) !important;
            opacity: 0.9;
          }
          .hero-pizza-wrapper {
            position: relative;
            right: auto;
            top: auto;
            margin-top: 0;
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
            grid-row: 1;
          }
          .hero-ctas {
            flex-direction: column;
            width: 100%;
            gap: 16px !important;
            margin-bottom: 40px !important;
          }
          .hero-ctas > a {
            width: 100%;
            display: flex !important;
            justify-content: center !important;
          }
          .hero-stats-row {
            justify-content: space-around !important;
            gap: 16px !important;
            width: 100%;
          }
        }
      `}</style>

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

      <div className="hero-container">
        {/* LEFT: Content */}
        <div className="hero-content">
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
            {isMobile && <span style={{ width: 30, height: 1, backgroundColor: '#FF4500' }}></span>}
          </motion.p>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.15)}
            style={{
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.05em',
              color: 'var(--text-primary)',
              fontSize: 'clamp(48px, 8vw, 110px)',
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
            className="subtext"
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: 420,
              marginBottom: 48,
              fontWeight: 400,
              paddingLeft: '5%',
              borderLeft: '1px solid var(--border-color)'
            }}
          >
            Hand-stretched dough, San Marzano tomatoes, and imported
            fior di latte. Delivered to your door in 30 minutes, screaming hot.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.35)}
            className="hero-ctas"
          >
            <OrderButton />
            <MenuLink />
          </motion.div>

          {/* Stats strip */}
          <motion.div
            {...fadeUp(0.45)}
            className="hero-stats-row"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: isMobile ? 'center' : 'flex-start'
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

        {/* RIGHT: Pizza image */}
        <div className="hero-pizza-wrapper">
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 0.9 : 0.85, rotate: -8, x: isMobile ? 0 : 100 }}
            animate={{
              opacity: 1,
              scale: isMobile ? 1 : 1.25,
              rotate: [2, -2, 2],
              x: isMobile ? 0 : 80,
              y: [isMobile ? 10 : 30, isMobile ? -5 : -10, isMobile ? 10 : 30],
            }}
            transition={{
              opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              rotate: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ 
              width: '100%',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
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
      </div>
    </section>
  );
}
