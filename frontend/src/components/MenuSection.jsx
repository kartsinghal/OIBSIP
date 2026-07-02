import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Classic', 'Specialty', 'Vegan'];

const PIZZAS = [
  {
    _id: 'static-1',
    name: 'Margherita',
    category: 'Classic',
    tag: 'Bestseller',
    description: 'San Marzano tomato, fior di latte, fresh basil, EVOO',
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-2',
    name: 'Pepperoni',
    category: 'Classic',
    tag: 'Fan Favourite',
    description: 'Tomato base, mozzarella, premium beef pepperoni, oregano',
    price: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-3',
    name: 'Truffle Funghi',
    category: 'Specialty',
    tag: "Chef's Pick",
    description: 'White truffle oil, wild mushrooms, fontina, fresh thyme',
    price: 549,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-4',
    name: 'Quattro Formaggi',
    category: 'Specialty',
    tag: 'New',
    description: 'Mozzarella, gorgonzola, parmigiano, ricotta, acacia honey',
    price: 499,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=85&auto=format&fit=crop',
  },
];

function PizzaCard({ pizza, index }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const { dispatch, showToast } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: pizza });
    showToast(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image container */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 14,
        marginBottom: 20,
        backgroundColor: 'var(--bg-secondary)',
        height: 280,
        border: '1px solid var(--border-color)',
      }}>
        <motion.img
          src={pizza.image}
          alt={pizza.name}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, rgba(0,0,0,${hovered ? 0.7 : 0.15}) 0%, transparent 60%)`,
          transition: 'background 0.4s ease',
        }} />

        {/* Add to cart */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                style={{
                  background: btnHovered ? '#DC3800' : '#FF4500',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '12px 28px',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, sans-serif',
                  transform: btnHovered ? 'scale(0.96)' : 'scale(1)',
                }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
              transition: 'color 0.3s ease'
            }}>
              {pizza.name}
            </h3>
            {pizza.tag && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#FF4500',
                background: 'transparent',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                flexShrink: 0,
                border: '1px solid rgba(255,69,0,0.2)',
              }}>
                {pizza.tag}
              </span>
            )}
          </div>
          <p style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            margin: 0,
            fontWeight: 400,
          }}>
            {pizza.description}
          </p>
        </div>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          flexShrink: 0,
          paddingTop: 1,
        }}>
          ₹{pizza.price}
        </span>
      </div>
    </motion.div>
  );
}

export default function MenuSection() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? PIZZAS : PIZZAS.filter(p => p.category === active);

  return (
    <section style={{
      backgroundColor: 'var(--bg-primary)',
      padding: '120px 40px',
      borderTop: '1px solid var(--border-color)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 48,
        }}>
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <span style={{ width: 20, height: 1, backgroundColor: '#FF4500' }}></span>
              Our Selection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(44px, 5vw, 68px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              The Menu.
            </motion.h2>
          </div>

          <Link
            to="/menu"
            style={{
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'color 0.3s ease',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              paddingBottom: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            View All
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Category filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 64,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 16,
          width: '100%',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                fontSize: 12,
                fontWeight: active === cat ? 600 : 500,
                padding: '8px 24px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.02em',
                background: active === cat ? 'var(--bg-tertiary)' : 'transparent',
                color: active === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => { if (active !== cat) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (active !== cat) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '48px 36px',
        }}>
          {filtered.map((pizza, index) => {
            if (active === 'All' && index === 2) {
              return (
                <React.Fragment key="editorial-block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      gridColumn: '1 / -1',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 14,
                      padding: '48px 40px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: -30, right: 10, opacity: 0.04, fontSize: 300, fontWeight: 900, color: 'var(--text-primary)', pointerEvents: 'none', lineHeight: 0.8, fontFamily: 'Georgia, serif' }}>"</div>
                    <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 300, color: 'var(--text-primary)', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.4, maxWidth: '80%' }}>
                      "We don't make fast food. We make good food as fast as we can — without compromising the dough."
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 30, height: 1, backgroundColor: '#FF4500' }}></div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Chef Marco</p>
                    </div>
                  </motion.div>
                  <PizzaCard key={pizza.id} pizza={pizza} index={index} />
                </React.Fragment>
              );
            }
            return <PizzaCard key={pizza.id} pizza={pizza} index={index} />;
          })}
        </div>

      </div>
    </section>
  );
}
