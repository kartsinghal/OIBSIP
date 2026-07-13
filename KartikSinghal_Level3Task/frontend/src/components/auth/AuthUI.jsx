import { useState } from 'react';

// ─── Reusable field ─────────────────────────────────────────────────────────
function Field({ label, id, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: error ? '#FF4500' : 'var(--text-secondary)',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'var(--bg-tertiary)',
          border: `1px solid ${error ? 'rgba(255,69,0,0.5)' : focused ? 'var(--border-focus)' : 'var(--border-color)'}`,
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 14,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          width: '100%',
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: '#FF4500', marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
}

// ─── Submit button ───────────────────────────────────────────────────────────
export function AuthSubmitButton({ label, loading }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '13px 0',
        background: loading ? 'rgba(255,69,0,0.5)' : hovered ? '#DC3800' : '#FF4500',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease',
        transform: hovered && !loading ? 'scale(0.985)' : 'scale(1)',
      }}
    >
      {loading ? 'Please wait…' : label}
    </button>
  );
}

// ─── Form card shell ─────────────────────────────────────────────────────────
export function AuthCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export { Field };
