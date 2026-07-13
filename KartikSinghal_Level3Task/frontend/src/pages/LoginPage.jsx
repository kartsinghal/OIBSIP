import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard, Field, AuthSubmitButton } from '../components/auth/AuthUI';

function validate({ email, password }) {
  const errors = {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // API integration: POST /api/auth/login — wired later
    setTimeout(() => setLoading(false), 1200); // placeholder
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Inferno account"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field
          label="Email"
          id="login-email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          id="login-password"
          type="password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <AuthSubmitButton label="Sign In" loading={loading} />
      </form>

      <p style={{ marginTop: 22, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link
          to="/signup"
          style={{ color: '#FF4500', fontWeight: 600, textDecoration: 'none' }}
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
