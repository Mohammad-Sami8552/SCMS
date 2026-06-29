import React, { useState, useEffect } from 'react';

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [authMode, setAuthMode] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [serverCaptcha, setServerCaptcha] = useState('');
  const [error, setError] = useState('');

  const loadCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha');
      if (!res.ok) throw new Error('Captcha fetch failed');
      const data = await res.json();
      setServerCaptcha(data.text || '');
    } catch {
      setServerCaptcha('A5K9R');
    }
  };

  useEffect(() => { loadCaptcha(); }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      username: username.trim(),
      authMode,
      captchaText: captchaInput.trim().toUpperCase(),
      actualCaptcha: serverCaptcha,
      ...(authMode === 'password' ? { password } : { otp: otpInput })
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('scms_username', username.trim());
        onLoginSuccess({ token: data.token, username: username.trim() });
      } else {
        setError(data.message || 'Authentication failed');
        loadCaptcha();
      }
    } catch {
      setError('Unable to reach the authentication server.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9', width: '100vw' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '420px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#1e293b' }}>Sign in</h2>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>To access SCMS Engine</p>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <input type="radio" checked={authMode === 'password'} onChange={() => setAuthMode('password')} /> Password Based
          </label>
          <label style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <input type="radio" checked={authMode === 'otp'} onChange={() => setAuthMode('otp')} /> OTP Based
          </label>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSignIn}>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required
            style={{ width: '100%', padding: '10px', marginBottom: '14px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />

          {authMode === 'password' ? (
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
                style={{ width: '100%', padding: '10px 40px 10px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '16px' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input type="text" placeholder="Enter 6-Digit OTP" value={otpInput} onChange={e => setOtpInput(e.target.value)} required
                style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => alert('OTP Sandbox tracking triggered: Input "123456" to bypass validation verification.')}
                style={{ padding: '0 12px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                Get OTP
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', color: '#38bdf8', padding: '10px', fontWeight: 'bold', letterSpacing: '3px', borderRadius: '4px', fontStyle: 'italic', userSelect: 'none' }}>
              {serverCaptcha}
              <span onClick={loadCaptcha} style={{ marginLeft: '12px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontStyle: 'normal' }}>🔄</span>
            </div>
            <input type="text" placeholder="Enter Captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required
              style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#475569' }}>
          New user? <button type="button" onClick={onSwitchToSignup} style={{ color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Create an account</button>
        </p>
      </div>
    </div>
  );
}
