import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import pizzaService from '../services/pizzaService';


const BASE_PRICE = 449;
const TOPPING_PRICE = 30;

const makeInitialSelections = (groups) =>
  groups.reduce((acc, group) => {
    acc[group.label] = group.key === 'toppings' ? [] : group.options?.[0] || '';
    return acc;
  }, {});

// Sauce color palette
const SAUCE_COLORS = {
  'San Marzano': '#9E2618',
  'White Cream': '#E6D4A8',
  'Basil Pesto': '#2F5B2A',
  'Smoky BBQ': '#3A1504',
};

// Cheese color palette
const CHEESE_COLORS = {
  'Fior di Latte': '#EDE0BC',
  'Burrata': '#E8D8B0',
  'Fontina': '#C8A832',
  'Gorgonzola': '#B8986A',
};

// Topping visual config — distinct colors per type
const TOPPING_CONFIG = {
  'Wild Mushrooms': { fill: '#8C6420', r: 9, label: 'Mushroom' },
  'Prosciutto':     { fill: '#B84848', r: 12, label: 'Prosciutto' },
  'Fresh Basil':    { fill: '#286428', r: 7, label: 'Basil' },
  'Truffle Oil':    { fill: '#2A1E0E', r: 6, label: 'Truffle' },
  'Jalapeños':      { fill: '#4A8018', r: 8, label: 'Jalapeño' },
  'Black Olives':   { fill: '#1E1E1E', r: 9, ring: true, ringFill: '#080808', label: 'Olive' },
};

// Check icon
function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Premium SVG Pizza Visual ---
function PizzaVisual({ selections }) {
  const S = 300; // SVG size
  const C = S / 2; // center = 150
  const R_CRUST = 130;
  const R_SAUCE = 112;
  const R_CHEESE = 106;
  const activeToppings = selections.Toppings || [];

  const sauceColor = SAUCE_COLORS[selections.Sauce] || '#9E2618';
  const cheeseColor = CHEESE_COLORS[selections.Cheese] || '#EDE0BC';

  // Precompute topping positions — two rings per active topping
  const toppingElements = [];
  activeToppings.forEach((topping, ti) => {
    const cfg = TOPPING_CONFIG[topping] || { fill: '#555', r: 8 };
    const rings = [
      { radius: 82, count: 6, offset: ti * 0.55 },
      { radius: 48, count: 4, offset: ti * 0.78 + 0.4 },
    ];
    rings.forEach(({ radius, count, offset }) => {
      for (let i = 0; i < count; i++) {
        const angle = offset + (i * (Math.PI * 2)) / count;
        toppingElements.push({
          key: `${topping}-${ti}-${radius}-${i}`,
          cx: C + radius * Math.cos(angle),
          cy: C + radius * Math.sin(angle),
          cfg,
          delay: (ti * count + i) * 0.028,
        });
      }
    });
  });

  // Char spots around crust edge (fixed, realistic)
  const charSpots = [12, 55, 94, 142, 188, 234, 276, 318].map((deg, i) => ({
    deg, r: R_CRUST - 8 + (i % 2) * 3, size: 2.5 + (i % 3),
  }));

  // Cheese blobs (6 irregular ellipses)
  const cheeseBlobs = [0, 58, 118, 178, 238, 300].map((deg, i) => {
    const a = ((deg + 18) * Math.PI) / 180;
    const r = 48 + (i % 3) * 9;
    return { a, r, rx: 20 + (i % 2) * 6, ry: 14 + (i % 3) * 5, opacity: 0.5 + (i % 3) * 0.09 };
  });

  return (
    <div style={{ position: 'relative', width: S, height: S, margin: '0 auto' }}>
      {/* Elliptical ground shadow */}
      <div style={{
        position: 'absolute',
        bottom: -18,
        left: '50%',
        transform: 'translateX(-50%)',
        width: S * 0.78,
        height: 28,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 72%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Pizza SVG base */}
      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          {/* Crust — warm radial with depth */}
          <radialGradient id="crustGr" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#7A4828" />
            <stop offset="55%" stopColor="#4E2C14" />
            <stop offset="100%" stopColor="#311A0A" />
          </radialGradient>

          {/* Sauce — animated via motion */}
          <radialGradient id="sauceGr" cx="40%" cy="34%" r="62%">
            <stop offset="0%" stopColor={sauceColor} stopOpacity="1" />
            <stop offset="100%" stopColor={sauceColor} stopOpacity="0.82" />
          </radialGradient>

          {/* Cheese */}
          <radialGradient id="cheeseGr" cx="37%" cy="31%" r="68%">
            <stop offset="0%" stopColor={cheeseColor} stopOpacity="0.96" />
            <stop offset="100%" stopColor={cheeseColor} stopOpacity="0.74" />
          </radialGradient>

          {/* Soft highlight for gloss */}
          <radialGradient id="highlightGr" cx="42%" cy="42%" r="58%">
            <stop offset="0%" stopColor="white" stopOpacity="0.07" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Soft blur filter for drop shadow */}
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Soft drop shadow circle */}
        <circle cx={C} cy={C + 8} r={R_CRUST} fill="rgba(0,0,0,0.3)" filter="url(#softBlur)" />

        {/* Crust ring */}
        <circle cx={C} cy={C} r={R_CRUST} fill="url(#crustGr)" />

        {/* Char spots on crust */}
        {charSpots.map(({ deg, r, size }, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={C + r * Math.cos(a)}
              cy={C + r * Math.sin(a)}
              r={size}
              fill="rgba(0,0,0,0.42)"
            />
          );
        })}

        {/* Sauce (animated color change) */}
        <motion.circle
          cx={C} cy={C} r={R_SAUCE}
          animate={{ fill: sauceColor }}
          transition={{ duration: 0.45 }}
          // Fallback fill
          fill={sauceColor}
        />

        {/* Sauce radial gradient overlay */}
        <circle cx={C} cy={C} r={R_SAUCE} fill="url(#sauceGr)" opacity="0.6" />

        {/* Cheese base */}
        <motion.circle
          cx={C} cy={C} r={R_CHEESE}
          animate={{ fill: cheeseColor }}
          transition={{ duration: 0.45 }}
          fill={cheeseColor}
          opacity={0.88}
        />

        {/* Cheese blobs for texture realism */}
        {cheeseBlobs.map(({ a, r, rx, ry, opacity }, i) => (
          <motion.ellipse
            key={i}
            cx={C + r * Math.cos(a)}
            cy={C + r * Math.sin(a)}
            rx={rx}
            ry={ry}
            fill={cheeseColor}
            opacity={opacity}
            animate={{ fill: cheeseColor }}
            transition={{ duration: 0.45 }}
            transform={`rotate(${i * 60 + 20} ${C + r * Math.cos(a)} ${C + r * Math.sin(a)})`}
          />
        ))}

        {/* Slice cut lines (3 lines = 6 slices) */}
        {[0, 60, 120].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={C + R_CRUST * Math.cos(a)}
              y1={C + R_CRUST * Math.sin(a)}
              x2={C - R_CRUST * Math.cos(a)}
              y2={C - R_CRUST * Math.sin(a)}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Glossy highlight */}
        <ellipse
          cx={C - 24}
          cy={C - 30}
          rx={54}
          ry={36}
          fill="url(#highlightGr)"
          transform={`rotate(-28 ${C - 24} ${C - 30})`}
        />
      </svg>

      {/* Toppings — HTML divs for Framer Motion animate/exit */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toppingElements.map(({ key, cx, cy, cfg, delay }) => (
            <motion.div
              key={key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.92 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.22, delay, ease: [0.34, 1.4, 0.64, 1] }}
              style={{
                position: 'absolute',
                left: cx,
                top: cy,
                transform: 'translate(-50%, -50%)',
                width: cfg.r * 2,
                height: cfg.r * 2,
                borderRadius: '50%',
                background: cfg.fill,
                boxShadow: '0 1px 4px rgba(0,0,0,0.55)',
                ...(cfg.ring ? {
                  border: `3px solid ${cfg.fill}`,
                  background: cfg.ringFill || '#080808',
                } : {}),
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function CustomizePizza() {
  const [optionGroups, setOptionGroups] = useState([]);
  const [activeStep, setActiveStep] = useState('');
  const [selections, setSelections] = useState({});
  const { dispatch, showToast } = useCart();

  useEffect(() => {
    let mounted = true;

    pizzaService.getCustomizationOptions().then(res => {
      if (!mounted) return;

      const groups = Array.isArray(res.data?.data) ? res.data.data : [];
      setOptionGroups(groups);
      setActiveStep(groups[0]?.label || '');
      setSelections(makeInitialSelections(groups));
    }).catch(e => console.warn("Could not fetch customization options:", e));

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = () => {
    if (optionGroups.length === 0) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        _id: `custom-${selections.Base}-${selections.Sauce}-${selections.Cheese}-${(selections.Toppings || []).join('-')}`,
        name: `Custom Pizza (${selections.Base})`,
        price: totalPrice,
        image: null,
        customSelections: { ...selections },
      },
    });
    showToast(1);
  };

  const handleSelect = (option) => {
    const activeGroup = optionGroups.find(group => group.label === activeStep);
    if (activeGroup?.key === 'toppings') {
      setSelections(prev => ({
        ...prev,
        Toppings: (prev.Toppings || []).includes(option)
          ? (prev.Toppings || []).filter(t => t !== option)
          : [...(prev.Toppings || []), option],
      }));
    } else {
      setSelections(prev => ({ ...prev, [activeStep]: option }));
    }
  };

  const isSelected = (option) =>
    activeStep === 'Toppings'
      ? (selections.Toppings || []).includes(option)
      : selections[activeStep] === option;

  const steps = optionGroups.map(group => group.label);
  const activeOptions = optionGroups.find(group => group.label === activeStep)?.options || [];
  const selectedToppings = selections.Toppings || [];
  const totalPrice = BASE_PRICE + selectedToppings.length * TOPPING_PRICE;

  return (
    <section
      id="builder"
      className="customizer-section"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <style>{`
        .customizer-section {
          padding: clamp(60px, 10vw, 108px) clamp(20px, 5vw, 40px);
        }
        .customizer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 88px;
          align-items: center;
        }
        .pizza-visual-wrapper {
          display: flex; flex-direction: column; align-items: center; gap: 28px;
        }
        .pizza-svg-container {
          transform: scale(1);
          transform-origin: center top;
        }
        @media (max-width: 900px) {
          .customizer-section { padding: 40px 20px; }
          .customizer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .pizza-svg-container {
            transform: scale(0.75);
            margin-bottom: -70px; /* offset the scaled height */
          }
        }
      `}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="customizer-grid">

          {/* LEFT: Controls */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 14,
              }}
            >
              Build Your Own
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(38px, 4vw, 60px)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 0.94,
                color: 'var(--text-primary)',
                marginBottom: 36,
              }}
            >
              Your Rules.<br />
              Your Pizza.
            </motion.h2>

            {/* Step tabs */}
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              padding: 3,
              marginBottom: 24,
              gap: 2,
            }}>
              {steps.map(step => {
                const isActive = activeStep === step;
                const isDone = step !== activeStep && (
                  step === 'Toppings'
                    ? selectedToppings.length > 0
                    : !!selections[step]
                );
                return (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    style={{
                      position: 'relative',
                      padding: '8px 18px',
                      borderRadius: 100,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      background: isActive ? 'var(--text-primary)' : 'transparent',
                      color: isActive ? 'var(--bg-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isDone ? 'var(--text-secondary)' : 'var(--text-tertiary)'; }}
                  >
                    {step}
                    {/* Tiny orange dot if this step has a selection */}
                    {isDone && !isActive && (
                      <span style={{
                        position: 'absolute',
                        top: 6,
                        right: 9,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#FF4500',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Options */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28 }}
              >
                {activeOptions.map(option => {
                  const selected = isSelected(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '8px 15px',
                        borderRadius: 100,
                        border: `1px solid ${selected ? 'rgba(255,69,0,0.45)' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(255,69,0,0.07)' : 'transparent',
                        color: selected ? '#FF4500' : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      onMouseEnter={e => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = 'var(--border-focus)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {selected && <Check />}
                      {option}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Summary — clean row list */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 14,
              padding: '18px 22px',
              marginBottom: 16,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 14,
              }}>
                Your Order
              </p>
              {steps.map((step, i) => (
                <div key={step}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 0',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {step}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      maxWidth: 220,
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {step === 'Toppings'
                        ? selectedToppings.length > 0 ? selectedToppings.join(', ') : '—'
                        : selections[step] || '—'}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ height: 1, background: 'var(--border-color)' }} />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              style={{
                width: '100%',
                background: '#FF4500',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                padding: '15px 28px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease, transform 0.15s ease',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#DC3800'; e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FF4500'; e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={handleAddToCart}
            >
              Add to Cart
              <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 13 }}>—</span>
              ₹{totalPrice}
            </button>
          </div>

          {/* RIGHT: Live SVG pizza visual */}
          <motion.div
            className="pizza-visual-wrapper"
            initial={{ opacity: 0, scale: 0.86 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pizza-svg-container">
              <PizzaVisual selections={selections} />
            </div>

            {/* Topping count pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '9px 18px',
              borderRadius: 100,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>
                {selectedToppings.length === 0
                  ? 'No toppings selected'
                  : `${selectedToppings.length} topping${selectedToppings.length !== 1 ? 's' : ''} added`}
              </span>
              {selectedToppings.length > 0 && (
                <span style={{
                  fontSize: 12,
                  color: '#FF4500',
                  fontWeight: 600,
                  background: 'rgba(255,69,0,0.09)',
                  padding: '2px 9px',
                  borderRadius: 100,
                  border: '1px solid rgba(255,69,0,0.15)',
                }}>
                  +₹{selectedToppings.length * TOPPING_PRICE}
                </span>
              )}
            </div>

            {/* Ingredient key */}
            {selectedToppings.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                  maxWidth: 300,
                }}
              >
                {selectedToppings.map(t => {
                  const cfg = TOPPING_CONFIG[t] || {};
                  return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: cfg.fill,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>{t}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
