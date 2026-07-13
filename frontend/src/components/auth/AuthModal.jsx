import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

// ─── Icons ───────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

// ─── OTP 6-digit input ────────────────────────────────────────────────────────

function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v || ' ';
    const joined = next.join('').trimEnd();
    onChange(joined);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    e.preventDefault();
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 'clamp(4px, 2vw, 10px)', justifyContent: 'center', width: '100%' }}>
      {Array.from({ length: 6 }, (_, i) => {
        const filled = digits[i]?.trim();
        return (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled || ''}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              flex: 1,
              maxWidth: 44,
              minWidth: 0,
              height: 54,
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
              background: filled ? 'rgba(255,69,0, 0.06)' : '#111111',
              border: `1.5px solid ${filled ? '#FF4500' : '#222222'}`,
              borderRadius: 10,
              color: '#F0F0F0',
              outline: 'none',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              caretColor: '#FF4500',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Shared inner button ──────────────────────────────────────────────────────

function PrimaryBtn({ onClick, disabled, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: '13px 0',
        background: disabled ? '#1C1C1C' : hov ? '#DC3800' : '#FF4500',
        border: 'none',
        borderRadius: 12,
        color: disabled ? '#404040' : '#fff',
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease',
        transform: hov && !disabled ? 'scale(0.985)' : 'scale(1)',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const STEPS = { OPTIONS: 'options', OTP: 'otp', PROFILE: 'profile' };

export default function AuthModal() {
  const { isOpen, close } = useAuthModal();
  const { sendOtp: apiSendOtp, verifyOtp: apiVerifyOtp, googleLogin, updateProfile: apiUpdateProfile } = useAuth();

  const [step, setStep] = useState(STEPS.OPTIONS);
  const [countryCode, setCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneErr] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(STEPS.OPTIONS);
        setPhone(''); setOtp(''); setPhoneErr(''); setOtpError('');
        setName(''); setEmail('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Countdown timer
  const startTimer = useCallback(() => setTimer(30), []);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const goToOtp = async () => {
    if (!phone || phone.length < 10) {
      setPhoneErr('Enter a valid 10-digit mobile number');
      return;
    }

    setPhoneErr('');
    setLoading(true);

    try {
      const cleanCode = countryCode.replace(/[^\d+]/g, '').trim();
      const cleanPhone = phone.replace(/\D/g, '');
      const fullPhone = `${cleanCode}${cleanPhone}`;

      console.log("COUNTRY CODE:", countryCode);
      console.log("CLEAN CODE:", cleanCode);
      console.log("PHONE:", phone);
      console.log("CLEAN PHONE:", cleanPhone);
      console.log("FULL PHONE:", fullPhone);

      const response = await apiSendOtp(fullPhone);
      console.log("API RESPONSE:", response);

      setStep(STEPS.OTP);
      startTimer();
    } catch (err) {
      console.log("OTP ERROR:", err);
      console.log("ERROR RESPONSE:", err.response);
      console.log("ERROR DATA:", err.response?.data);

      setPhoneErr(
        err.response?.data?.message ||
        err.message ||
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.trim().length < 6) { setOtpError('Enter the 6-digit code'); return; }
    setOtpError('');
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await apiVerifyOtp(fullPhone, otp);
      if (res.success) {
        // Redirect to profile step if new user or has no name registered
        if (res.isNewUser || !res.data?.fullName) {
          setStep(STEPS.PROFILE);
        } else {
          close();
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await apiUpdateProfile(name.trim(), email.trim() || undefined);
      close();
    } catch (err) {
      setPhoneErr(err.response?.data?.message || 'Failed to complete profile registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
        const info = await res.json();
        await googleLogin(info.email, info.name, info.picture);
        close();
      } catch (err) {
        setPhoneErr(err.response?.data?.message || 'Google identity verification failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setPhoneErr('Google Login Failed'),
  });

  const maskedPhone = phone.length >= 4
    ? `${countryCode} ${'•'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`
    : `${countryCode} ${phone}`;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 200,
          animation: 'authFadeIn 0.2s ease',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(400px, calc(100vw - 32px))',
          zIndex: 201,
          animation: 'authSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            background: '#0D0D0D',
            border: '1px solid #1A1A1A',
            borderRadius: 20,
            padding: '32px 28px 28px',
            position: 'relative',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.03), 0 0 60px rgba(255,69,0,0.04)',
          }}
        >
          {/* Close */}
          <button
            onClick={close}
            disabled={loading}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: '#1A1A1A', border: 'none', borderRadius: '50%',
              width: 30, height: 30, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', color: '#555',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#E0E0E0'; e.currentTarget.style.background = '#252525'; } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = '#1A1A1A'; } }}
          >
            <CloseIcon />
          </button>

          {/* Back Button */}
          {step !== STEPS.OPTIONS && (
            <button
              onClick={() => {
                if (step === STEPS.OTP) setStep(STEPS.OPTIONS);
                else if (step === STEPS.PROFILE) {
                  if (phone) setStep(STEPS.OTP);
                  else setStep(STEPS.OPTIONS);
                }
              }}
              disabled={loading}
              style={{
                position: 'absolute', top: 14, left: 14,
                background: 'transparent', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                color: '#555', display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 13, padding: '4px 8px', borderRadius: 6,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.color = '#E0E0E0'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.color = '#555'; }}
            >
              <ChevronLeft /> Back
            </button>
          )}

          {/* ── OPTIONS ──────────────────────────────────── */}
          {step === STEPS.OPTIONS && (
            <div style={{ animation: 'authStepIn 0.25s ease' }}>
              {/* Header */}
              <div style={{ marginBottom: 26 }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#FF4500', textTransform: 'uppercase' }}>
                  Inferno Pizza
                </p>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.04em', color: '#F0F0F0', lineHeight: 1.2 }}>
                  Sign in or create<br />your account
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#484848', lineHeight: 1.5 }}>
                  Exclusive deals, faster checkout, live order tracking.
                </p>
              </div>

              {/* Google */}
              <GoogleButton onClick={handleGoogleLoginClick} />

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
                <span style={{ fontSize: 11, color: '#2E2E2E', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
              </div>

              {/* Phone row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: phoneError ? 8 : 14 }}>
                <select
                  value={countryCode}
                  onChange={e => setCode(e.target.value)}
                  disabled={loading}
                  style={{
                    background: '#111', border: '1px solid #222', borderRadius: 10,
                    color: '#D0D0D0', fontSize: 13, fontWeight: 500,
                    padding: '0 10px', height: 48, cursor: loading ? 'not-allowed' : 'pointer', outline: 'none',
                    flexShrink: 0, minWidth: 82,
                  }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && !loading && goToOtp()}
                  placeholder="Mobile number"
                  disabled={loading}
                  style={{
                    flex: 1, background: '#111',
                    border: `1px solid ${phoneError ? 'rgba(255,69,0,0.45)' : '#222'}`,
                    borderRadius: 10, color: '#F0F0F0', fontSize: 15, fontWeight: 500,
                    padding: '0 14px', height: 48, outline: 'none',
                    transition: 'border-color 0.2s ease', letterSpacing: '0.03em',
                  }}
                  onFocus={e => { if (!phoneError) e.target.style.borderColor = '#2C2C2C'; }}
                  onBlur={e => { e.target.style.borderColor = phoneError ? 'rgba(255,69,0,0.45)' : '#222'; }}
                />
              </div>

              {phoneError && (
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#FF4500' }}>{phoneError}</p>
              )}

              <PrimaryBtn onClick={goToOtp} disabled={loading || phone.length < 10}>
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </PrimaryBtn>

              <p style={{ marginTop: 18, fontSize: 11, color: '#2A2A2A', textAlign: 'center', lineHeight: 1.7 }}>
                By continuing, you agree to our{' '}
                <span style={{ color: '#444', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>{' '}
                &amp;{' '}
                <span style={{ color: '#444', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
              </p>
            </div>
          )}



          {/* ── OTP ──────────────────────────────────────── */}
          {step === STEPS.OTP && (
            <div style={{ animation: 'authStepIn 0.25s ease', paddingTop: 22 }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.04em', color: '#F0F0F0' }}>
                  Enter OTP
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#484848' }}>
                  Sent to{' '}
                  <span style={{ color: '#888', fontWeight: 500 }}>{maskedPhone}</span>
                </p>
              </div>

              <OtpInput value={otp} onChange={v => { setOtp(v); setOtpError(''); }} />

              {otpError && (
                <p style={{ margin: '10px 0 0', fontSize: 12, color: '#FF4500', textAlign: 'center' }}>{otpError}</p>
              )}

              <div style={{ marginTop: 22 }}>
                <PrimaryBtn onClick={verifyOtp} disabled={loading || otp.trim().length < 6}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </PrimaryBtn>
              </div>

              <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: '#383838' }}>
                {timer > 0
                  ? <>Resend OTP in <span style={{ color: '#D0D0D0', fontWeight: 600 }}>{timer}s</span></>
                  : (
                    <button
                      onClick={() => { setOtp(''); startTimer(); goToOtp(); }}
                      style={{ background: 'none', border: 'none', color: '#FF4500', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}
                    >
                      Resend OTP
                    </button>
                  )
                }
              </p>
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────────── */}
          {step === STEPS.PROFILE && (
            <div style={{ animation: 'authStepIn 0.25s ease', paddingTop: 22 }}>
              <div style={{ marginBottom: 26 }}>
                <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>👋</div>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.04em', color: '#F0F0F0' }}>
                  One last step
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#484848', lineHeight: 1.5 }}>
                  Tell us your name to personalise your Inferno experience.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  disabled={loading}
                  style={{
                    background: '#111', border: `1px solid ${name.trim() ? '#2C2C2C' : '#222'}`,
                    borderRadius: 10, color: '#F0F0F0', fontSize: 15, fontWeight: 500,
                    padding: '13px 14px', outline: 'none', width: '100%',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2C2C2C'}
                  onBlur={e => e.target.style.borderColor = name.trim() ? '#2C2C2C' : '#222'}
                />

                <input
                  type="email"
                  placeholder="Email address (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  style={{
                    background: '#111', border: '1px solid #222',
                    borderRadius: 10, color: '#F0F0F0', fontSize: 15, fontWeight: 500,
                    padding: '13px 14px', outline: 'none', width: '100%',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2C2C2C'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                />
              </div>

              {phoneError && (
                <p style={{ marginTop: 12, fontSize: 12, color: '#FF4500' }}>{phoneError}</p>
              )}

              <div style={{ marginTop: 20 }}>
                <PrimaryBtn onClick={completeProfile} disabled={loading || !name.trim()}>
                  {loading ? 'Saving Profile...' : "Let's go →"}
                </PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Google button (extracted to avoid re-renders) ────────────────────────────

function GoogleButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '12px 0',
        background: hov ? '#1C1C1C' : '#161616',
        border: `1px solid ${hov ? '#303030' : '#252525'}`,
        borderRadius: 12, cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: '#D8D8D8',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        letterSpacing: '-0.01em',
      }}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}
