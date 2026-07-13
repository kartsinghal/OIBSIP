import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({ type: 'success', message: 'Your message has been sent successfully. We will get back to you soon!' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh', paddingTop: 120, paddingBottom: 80 }}>
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 80px;
          align-items: start;
        }
        .contact-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px 20px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 15px;
          transition: all 0.2s ease;
        }
        .contact-input:focus {
          outline: none;
          border-color: #FF4500;
          box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.1);
        }
        .contact-input::placeholder {
          color: var(--text-secondary);
          opacity: 0.5;
        }
        .submit-btn {
          background: #FF4500;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 18px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s ease, opacity 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #e63e00;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .info-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 40px;
        }
        .info-block {
          margin-bottom: 32px;
        }
        .info-block:last-child {
          margin-bottom: 0;
        }
        .info-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .info-value {
          font-size: 16px;
          color: var(--text-primary);
          line-height: 1.6;
        }
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 56px;
          }
        }
        @media (max-width: 480px) {
          .info-card {
            padding: 24px;
          }
        }
      `}</style>

      <section style={{ padding: '0 clamp(20px, 4vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
        <motion.p {...fadeUp(0)} style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#FF4500',
          marginBottom: 20,
        }}>
          Get in Touch
        </motion.p>
        <motion.h1 {...fadeUp(0.1)} style={{
          fontSize: 'clamp(40px, 5vw, 64px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'var(--text-primary)',
          marginBottom: 64,
        }}>
          We'd love to hear<br />from you.
        </motion.h1>

        <div className="contact-grid">
          {/* Form */}
          <motion.div {...fadeUp(0.2)}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="Tell us what's on your mind..."
                  rows="6"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              {status.message && (
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: status.type === 'success' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 69, 0, 0.1)',
                  color: status.type === 'success' ? '#2ed573' : '#FF4500',
                  border: `1px solid ${status.type === 'success' ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 69, 0, 0.2)'}`,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}>
                  {status.message}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Info Details */}
          <motion.div {...fadeUp(0.3)} className="info-card">
            <div className="info-block">
              <div className="info-label">Address</div>
              <div className="info-value">
                124 Inferno Street<br />
                Indiranagar, Bangalore<br />
                Karnataka 560038
              </div>
            </div>
            
            <div className="info-block">
              <div className="info-label">Contact</div>
              <div className="info-value">
                hello@infernopizza.in<br />
                +91 80 4567 8900
              </div>
            </div>
            
            <div className="info-block">
              <div className="info-label">Business Hours</div>
              <div className="info-value">
                Monday – Thursday: 11:00 AM – 11:00 PM<br />
                Friday – Sunday: 11:00 AM – 1:00 AM
              </div>
            </div>
            
            <div className="info-block">
              <div className="info-label">Follow Us</div>
              <div className="info-value" style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <a href="#" style={{ color: '#FF4500', textDecoration: 'none', fontWeight: 500 }}>Instagram</a>
                <a href="#" style={{ color: '#FF4500', textDecoration: 'none', fontWeight: 500 }}>Twitter</a>
                <a href="#" style={{ color: '#FF4500', textDecoration: 'none', fontWeight: 500 }}>Facebook</a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </main>
  );
}
