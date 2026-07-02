import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <main style={{
      backgroundColor: 'var(--bg-primary)',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 40px 80px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        
        {/* Editorial SVG Pizza visual with a missing slice representing 404 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          >
            {/* Main Crust Circle */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FF4500" strokeWidth="8" strokeDasharray="180 250" strokeDashoffset="40" strokeLinecap="round" />
            {/* Main Cheese Body */}
            <circle cx="50" cy="50" r="32" fill="none" stroke="#EDE0BC" strokeWidth="8" strokeDasharray="140 250" strokeDashoffset="30" strokeLinecap="round" />
            {/* Slice Lines */}
            <path d="M50 10 L50 42" stroke="var(--bg-primary)" strokeWidth="2.5" />
            <path d="M12 59 L43 46" stroke="var(--bg-primary)" strokeWidth="2.5" />
            {/* Toppings (Dots) */}
            <circle cx="28" cy="38" r="3" fill="#9E2618" />
            <circle cx="48" cy="24" r="2.5" fill="#2F5B2A" />
            <circle cx="34" cy="58" r="3" fill="#9E2618" />
            <circle cx="56" cy="40" r="2" fill="#2F5B2A" />
          </motion.svg>
        </div>

        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#FF4500',
          display: 'block',
          marginBottom: 12,
        }}>
          Error 404
        </span>

        <h1 style={{
          fontSize: 'clamp(38px, 5vw, 54px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          margin: '0 0 16px 0',
          lineHeight: 1,
        }}>
          Slice Not Found.
        </h1>

        <p style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          margin: '0 0 36px 0',
        }}>
          The page you are looking for has been devoured, or never existed in the first place. Let's get you back to the main table.
        </p>

        <Link
          to="/"
          style={{
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            color: '#ffffff',
            background: btnHovered ? '#DC3800' : '#FF4500',
            padding: '14px 32px',
            borderRadius: 100,
            display: 'inline-block',
            transition: 'background 0.2s ease, transform 0.15s ease',
            letterSpacing: '-0.01em',
            transform: btnHovered ? 'scale(0.97)' : 'scale(1)',
          }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          Return to Kitchen
        </Link>
      </div>
    </main>
  );
}
