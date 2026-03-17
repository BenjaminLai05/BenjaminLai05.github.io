import React, { useState } from 'react';
import { Icons } from '../App';

export default function LoginView({ onLogin }) {
  const [providerId, setProviderId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Mock Authentication Logic
    if (providerId === 'DR1001' && password === 'password123') {
      onLogin({ id: 'DR1001', name: 'Dr. E. Reed', role: 'Radiologist' });
    } else if (providerId === 'ADMIN' && password === 'admin') {
      onLogin({ id: 'ADMIN', name: 'System Administrator', role: 'Admin' });
    } else {
      setError('Invalid Provider ID or Password.');
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Subtle background decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        backgroundColor: 'var(--primary)',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.05,
        zIndex: 0
      }} />

      <div className="card" style={{
        width: '420px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 1,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '16px', marginBottom: '16px' }}>
            {/* Minimal Brain/Scan Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
              <path d="M12 4c-5.5 0-9 4.5-9 9s3.5 9 9 9 9-4.5 9-9-3.5-9-9-9z"></path>
              <path d="M12 4v18"></path>
              <path d="M7.5 7.5a6.5 6.5 0 0 1 9 0"></path>
              <path d="M6 12a6 6 0 0 1 12 0"></path>
              <path d="M7.5 16.5a6.5 6.5 0 0 0 9 0"></path>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>NeuroScan AI</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Secure Medical Portal</p>
        </div>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Medical Provider ID</label>
            <input 
              type="text" 
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              placeholder="e.g. DR1001"
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none', fontSize: '15px' }} 
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Authentication Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none', fontSize: '15px', letterSpacing: '2px' }} 
              autoComplete="current-password"
            />
          </div>

          <button className="btn-primary" type="submit" style={{ marginTop: '8px', padding: '14px', width: '100%', justifyContent: 'center', fontSize: '15px', fontWeight: 600 }}>
            Secure Login
          </button>
        </form>

      </div>
    </div>
  );
}
