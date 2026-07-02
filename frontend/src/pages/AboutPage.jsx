import { motion } from 'framer-motion';
import OurPromise from '../components/OurPromise';

const MILESTONES = [
  { year: '2019', label: 'Founded in Bangalore — one oven, one obsession.' },
  { year: '2021', label: 'Sourcing partnership with a Neapolitan flour mill.' },
  { year: '2022', label: 'First 10,000 pizzas. Zero compromises.' },
  { year: '2024', label: 'Rated #1 food delivery in Bengaluru.' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh', paddingTop: 120 }}>

      {/* Editorial Header */}
      <section style={{ padding: '40px 40px 80px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

          {/* Left: Title block */}
          <div style={{ maxWidth: 600 }}>
            <motion.p {...fadeUp(0)} style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#FF4500',
              marginBottom: 20,
            }}>
              The Heritage
            </motion.p>
            <motion.h1 {...fadeUp(0.1)} style={{
              fontSize: 'clamp(44px, 6vw, 80px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: 'var(--text-primary)',
              marginBottom: 36,
            }}>
              Crafting the<br />Perfect Slice.
            </motion.h1>
            <motion.p {...fadeUp(0.2)} style={{
              fontSize: 16,
              lineHeight: 1.85,
              color: 'var(--text-secondary)',
              margin: '0 0 48px 0',
              borderLeft: '1px solid var(--border-color)',
              paddingLeft: 24,
            }}>
              Founded in Bangalore by a team of culinary obsessives and tech creators,
              Inferno brings the timeless art of wood-fired Neapolitan pizza to the modern
              delivery landscape. We merge centuries-old dough hydration methods with a
              custom-engineered high-heat deck oven to guarantee a perfect crust, every
              single order.
            </motion.p>
          </div>

          {/* Right: Pull quote + image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              height: 420,
              border: '1px solid var(--border-color)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85&auto=format&fit=crop"
              alt="Inferno kitchen at work"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              right: 32,
            }}>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 18,
                lineHeight: 1.5,
                color: '#ffffff',
                margin: 0,
              }}>
                "The leopard-spotting on the crust isn't a flaw — it's the signature of fire."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Milestones timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            marginTop: 80,
            paddingTop: 48,
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
          }}
        >
          {MILESTONES.map(({ year, label }, i) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{
                display: 'block',
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#FF4500',
                marginBottom: 10,
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
              }}>
                {year}
              </span>
              <p style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Reused Section */}
      <OurPromise />
    </main>
  );
}
