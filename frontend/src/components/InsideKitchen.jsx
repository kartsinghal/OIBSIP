import { motion } from 'framer-motion';

export default function InsideKitchen() {
  return (
    <section className="inside-kitchen-section" style={{
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .inside-kitchen-section { padding: 160px 40px; }
        .ik-grid { display: flex; flex-wrap: wrap; align-items: center; gap: 8%; }
        .ik-stats { display: flex; gap: 48px; }
        .ik-image-wrapper { flex: 1 1 500px; position: relative; height: 600px; margin-top: 40px; }
        
        @media (max-width: 768px) {
          .inside-kitchen-section { padding: 80px 20px; }
          .ik-grid { gap: 40px; }
          .ik-stats { justify-content: center; gap: 32px; }
          .ik-text-block { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .ik-image-wrapper { height: 350px; margin-top: 20px; width: 100%; flex-basis: 100%; }
        }
      `}</style>
      {/* Background radial accent to give depth to this section */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '-10%',
        width: '50%',
        height: '80%',
        background: 'radial-gradient(ellipse at center, rgba(255,69,0, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="ik-grid" style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Left: Editorial Text Block */}
        <div className="ik-text-block" style={{ flex: '1 1 400px', maxWidth: 540, position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'inherit' }}
          >
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#FF4500',
              marginBottom: 24,
            }}>
              Inside Our Kitchen
            </p>
            <h2 style={{
              fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: 0.95,
              marginBottom: 32,
              marginLeft: '-4px', // slight optical offset
            }}>
              72-Hour Dough.<br />
              450°C Stone.
            </h2>
            
            {/* Fine editorial line separator */}
            <div style={{ width: 40, height: 2, backgroundColor: 'var(--border-color)', marginBottom: 32 }} />

            <p style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              marginBottom: 40,
            }}>
              Our kitchen runs on obsession. We use an imported stone-deck oven running at exactly 450 degrees to cook our Neapolitan pizzas in under 90 seconds. 
              <br /><br />
              The leopard-spotting on the crust isn't a flaw — <span style={{ color: '#FF4500', fontStyle: 'italic' }}>it's the signature of fire.</span>
            </p>

            {/* Minor textural stats */}
            <div className="ik-stats">
              <div>
                <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>90s</span>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Bake Time</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>0%</span>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Compromise</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Asymmetrical Layered Image Composition */}
        <div className="ik-image-wrapper">
          
          {/* Main Background Image - Dough prep */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '85%',
              height: '80%',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 40px var(--card-hover-shadow)',
            }}
          >
            <motion.img 
              src="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1000&q=80"
              alt="Hand-stretching pizza dough"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              animate={{ y: ['-2%', '2%'] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', repeatType: 'reverse' }}
            />
            {/* Cinematic dark wash */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top right, rgba(8,8,8,0.4), transparent)' }} />
          </motion.div>

          {/* Foreground Overlapping Image - Wood Fire Oven */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 4 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '55%',
              height: '55%',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '-10px 30px 50px var(--card-hover-shadow)',
              border: '1px solid var(--border-color)',
            }}
          >
            <motion.img 
              src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80"
              alt="Wood-fired oven"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              animate={{ y: ['2%', '-2%'] }}
              transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', repeatType: 'reverse' }}
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
