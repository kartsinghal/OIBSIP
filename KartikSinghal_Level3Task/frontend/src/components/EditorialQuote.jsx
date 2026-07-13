import { motion } from 'framer-motion';

export default function EditorialQuote() {
  return (
    <section style={{
      backgroundColor: 'var(--bg-primary)',
      padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 40px)',
      borderTop: '1px solid var(--border-color)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 14,
            padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Large decorative quotation mark */}
          <div style={{
            position: 'absolute', top: -30, right: 10, opacity: 0.04,
            fontSize: 300, fontWeight: 900, color: 'var(--text-primary)',
            pointerEvents: 'none', lineHeight: 0.8, fontFamily: 'Georgia, serif',
          }}>"</div>

          <h3 style={{
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 300,
            color: 'var(--text-primary)',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            marginBottom: 20,
            lineHeight: 1.4,
            maxWidth: '80%',
            margin: '0 0 20px 0',
          }}>
            "We don't make fast food. We make good food as fast as we can — without compromising the dough."
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 1, backgroundColor: '#FF4500' }}></div>
            <p style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
              letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0,
            }}>Chef Marco</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
