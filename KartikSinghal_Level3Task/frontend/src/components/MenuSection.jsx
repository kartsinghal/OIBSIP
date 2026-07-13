import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Classic', 'Specialty', 'Vegan'];

const PIZZAS = [
  // ── Classic (7) ──────────────────────────────────────────────────────────────
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
    _id: 'static-c3',
    name: 'Napolitana',
    category: 'Classic',
    tag: null,
    description: 'Crushed tomato, anchovies, capers, black olives, oregano',
    price: 349,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-c4',
    name: 'Diavola',
    category: 'Classic',
    tag: 'Spicy',
    description: 'Spicy salami, tomato, mozzarella, chilli flakes, fresh basil',
    price: 429,
    image: '/images/pizzas/diavola.png',
  },
  {
    _id: 'static-c5',
    name: 'Capricciosa',
    category: 'Classic',
    tag: null,
    description: 'Ham, artichokes, mushrooms, black olives, mozzarella',
    price: 449,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-c6',
    name: 'Marinara',
    category: 'Classic',
    tag: null,
    description: 'San Marzano tomato, garlic, oregano, EVOO — no cheese',
    price: 249,
    image: '/images/pizzas/marinara.png',
  },
  {
    _id: 'static-c7',
    name: 'Prosciutto e Funghi',
    category: 'Classic',
    tag: 'New',
    description: 'Parma ham, wild mushrooms, mozzarella, fresh thyme',
    price: 479,
    image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=700&q=85&auto=format&fit=crop',
  },

  // ── Specialty (7) ────────────────────────────────────────────────────────────
  {
    _id: 'static-3',
    name: 'Truffle Funghi',
    category: 'Specialty',
    tag: "Chef's Pick",
    description: 'White truffle oil, wild mushrooms, fontina, fresh thyme',
    price: 549,
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Pizza-3007395.jpg',
  },
  {
    _id: 'static-4',
    name: 'Quattro Formaggi',
    category: 'Specialty',
    tag: 'New',
    description: 'Mozzarella, gorgonzola, parmigiano, ricotta, acacia honey',
    price: 499,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-s3',
    name: 'Burrata & Bresaola',
    category: 'Specialty',
    tag: "Chef's Pick",
    description: 'Creamy burrata, cured bresaola, rocket, lemon zest, EVOO',
    price: 649,
    image: '/images/pizzas/burrata_bresaola.png',
  },
  {
    _id: 'static-s4',
    name: 'Smoky BBQ Chicken',
    category: 'Specialty',
    tag: 'Bestseller',
    description: 'Smoky BBQ base, grilled chicken, red onion, jalapeño, cheddar',
    price: 529,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-s5',
    name: 'Prawn Aglio',
    category: 'Specialty',
    tag: null,
    description: 'Tiger prawns, garlic oil, cherry tomato, parsley, mozzarella',
    price: 699,
    image: '/images/pizzas/prawn_aglio.png',
  },
  {
    _id: 'static-s6',
    name: 'Fig & Gorgonzola',
    category: 'Specialty',
    tag: 'Limited',
    description: 'Fresh fig, gorgonzola, walnuts, honey drizzle, rocket',
    price: 579,
    image: '/images/pizzas/fig_gorgonzola.png',
  },
  {
    _id: 'static-s7',
    name: 'Speck & Pear',
    category: 'Specialty',
    tag: 'New',
    description: 'Smoked speck, sliced pear, brie, balsamic glaze, toasted walnuts',
    price: 599,
    image: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=700&q=85&auto=format&fit=crop',
  },

  // ── Vegan (7) ────────────────────────────────────────────────────────────────
  {
    _id: 'static-v1',
    name: 'Garden Primavera',
    category: 'Vegan',
    tag: 'Bestseller',
    description: 'Tomato base, courgette, peppers, red onion, cherry tomato, basil',
    price: 349,
    image: '/images/pizzas/garden_primavera.png',
  },
  {
    _id: 'static-v2',
    name: 'Roasted Aubergine',
    category: 'Vegan',
    tag: null,
    description: 'Smoky roasted aubergine, tahini, harissa, pine nuts, mint',
    price: 379,
    image: 'https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-v3',
    name: 'Pesto Verde',
    category: 'Vegan',
    tag: "Chef's Pick",
    description: 'Vegan basil pesto, cherry tomato, artichoke, capers, EVOO',
    price: 399,
    image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-v4',
    name: 'Mushroom Truffle',
    category: 'Vegan',
    tag: null,
    description: 'Cashew cream base, mixed mushrooms, truffle oil, thyme, garlic',
    price: 449,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-v5',
    name: 'Spicy Arrabiata',
    category: 'Vegan',
    tag: 'Spicy',
    description: 'Arrabiata sauce, olives, capers, chilli, roasted peppers',
    price: 329,
    image: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=700&q=85&auto=format&fit=crop',
  },
  {
    _id: 'static-v6',
    name: 'Butternut Squash',
    category: 'Vegan',
    tag: null,
    description: 'Roasted butternut squash, caramelised red onion, vegan feta, sage',
    price: 389,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg',
  },
  {
    _id: 'static-v7',
    name: 'Fig & Rocket',
    category: 'Vegan',
    tag: 'New',
    description: 'Fresh fig, vegan mozzarella, balsamic glaze, toasted pine nuts, rocket',
    price: 419,
    image: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=700&q=85&auto=format&fit=crop',
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
      className="pizza-card-wrapper"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image container */}
      <div 
        className="pizza-card-img-container"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 14,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
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

          {/* Add to cart (Always visible on mobile via CSS, or hover on desktop) */}
          <div className={`pizza-add-btn ${hovered ? 'visible' : ''}`}>
            <motion.div
              initial={false}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
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
          </div>
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
    <section 
      id="menu-section"
      className="menu-section-container"
      style={{
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <style>{`
        .menu-section-container { padding: 120px 40px; }
        .pizza-card-img-container { height: 280px; margin-bottom: 20px; }
        .pizza-add-btn { opacity: 0; pointer-events: none; }
        .pizza-add-btn.visible { opacity: 1; pointer-events: auto; }
        
        @media (max-width: 768px) {
          .menu-section-container { padding: 64px 20px; }
          .pizza-card-img-container { height: 200px; margin-bottom: 16px; }
          /* On mobile, always show the add to cart button to avoid double-tap hover issues */
          .pizza-add-btn, .pizza-add-btn > div { opacity: 1 !important; transform: none !important; pointer-events: auto; }
        }
      `}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 48,
          flexWrap: 'wrap',
          gap: 24,
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
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
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
                whiteSpace: 'nowrap',
                flexShrink: 0,
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
          {filtered.map((pizza, index) => (
            <PizzaCard key={pizza._id} pizza={pizza} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}
