import React, { useState, useEffect } from 'react';

export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    designation: '',
    email: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [serverCaptcha, setServerCaptcha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha');
      if (!res.ok) throw new Error('Captcha failed');
      const data = await res.json();
      setServerCaptcha(data.text || '');
    } catch {
      setServerCaptcha('A5K9R');
    }
  };

  useEffect(() => { loadCaptcha(); }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          captchaText: captchaInput.trim().toUpperCase(),
          actualCaptcha: serverCaptcha
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Account created successfully. You are signed in.');
        onSignupSuccess(data.token);
      } else {
        setError(data.message || 'Signup failed');
        loadCaptcha();
      }
    } catch {
      setError('Unable to reach the backend.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', width: '100vw', padding: '24px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '460px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4px', color: '#1e293b' }}>Create account</h2>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>Register a new SCMS user</p>

        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{success}</p>}

        <form onSubmit={handleSignup}>
          <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" required style={inputStyle} />
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" required style={{ ...inputStyle, paddingRight: '40px' }} />
            <button type="button" onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '16px' }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name" required style={inputStyle} />
          <input type="text" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Designation" style={inputStyle} />
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" style={inputStyle} />
          <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" style={inputStyle} />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', color: '#38bdf8', padding: '10px', fontWeight: 'bold', letterSpacing: '3px', borderRadius: '4px', fontStyle: 'italic', userSelect: 'none' }}>
              {serverCaptcha}
              <span onClick={loadCaptcha} style={{ marginLeft: '12px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontStyle: 'normal' }}>🔄</span>
            </div>
            <input type="text" placeholder="Enter Captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Create account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#475569' }}>
          Already have an account? <button type="button" onClick={onSwitchToLogin} style={{ color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '14px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' };
