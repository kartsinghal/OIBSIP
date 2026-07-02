import { motion } from 'framer-motion';

const PROMISES = [
  {
    number: '01',
    title: '30-Minute Guarantee',
    body: 'If your order takes longer than 30 minutes, your next pizza is on us. No questions, no vouchers — just a free pizza.',
  },
  {
    number: '02',
    title: 'Source to Oven',
    body: "Our ingredients arrive daily from local farms and Italy's finest producers. We have zero tolerance for frozen ingredients.",
  },
  {
    number: '03',
    title: 'Handcrafted Every Time',
    body: 'Every base is hand-stretched by our in-house team. No machines, no shortcuts, no compromises on texture or taste.',
  },
];

export default function OurPromise() {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '108px 40px',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 96,
            alignItems: 'start',
          }}
        >

          {/* Left: sticky statement */}
          <div style={{ position: 'sticky', top: 120 }}>
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
                marginBottom: 18,
              }}
            >
              Our Standards
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(48px, 5.5vw, 80px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.92,
                color: 'var(--text-primary)',
                marginBottom: 32,
              }}
            >
              We Never<br />
              Cut<br />
              Corners.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: 15,
                lineHeight: 1.78,
                color: 'var(--text-secondary)',
                maxWidth: 320,
                margin: 0,
              }}
            >
              At Inferno, quality is not a feature — it is the foundation.
              Every decision starts with one question: is this good enough
              for our own table?
            </motion.p>
          </div>

          {/* Right: numbered list — editorial style */}
          <div>
            {PROMISES.map(({ number, title, body }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  gap: 32,
                  padding: '36px 0',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                {/* Large muted number */}
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--border-focus)',
                    lineHeight: 1,
                    flexShrink: 0,
                    paddingTop: 3,
                    userSelect: 'none',
                  }}
                >
                  {number}
                </span>

                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                      marginBottom: 10,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.78,
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
            {/* Bottom border on last item */}
            <div style={{ borderTop: '1px solid var(--border-color)' }} />
          </div>

        </div>
      </div>
    </section>
  );
}
