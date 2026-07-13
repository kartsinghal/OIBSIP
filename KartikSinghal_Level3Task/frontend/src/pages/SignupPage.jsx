import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard, Field, AuthSubmitButton } from '../components/auth/AuthUI';

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Full name is required';
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (password !== confirm) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // API integration: POST /api/auth/signup — wired later
    setTimeout(() => setLoading(false), 1200); // placeholder
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join Inferno and start ordering"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field
          label="Full Name"
          id="signup-name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          placeholder="Alex Johnson"
          autoComplete="name"
        />
        <Field
          label="Email"
          id="signup-email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          id="signup-password"
          type="password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
        />
        <Field
          label="Confirm Password"
          id="signup-confirm"
          type="password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <AuthSubmitButton label="Create Account" loading={loading} />
      </form>

      <p style={{ marginTop: 22, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#FF4500', fontWeight: 600, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
