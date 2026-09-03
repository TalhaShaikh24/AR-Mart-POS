import React, { useState, useEffect, useCallback } from 'react';
import ArMartLogo from './ArMartLogo';
import { KeyRound, ArrowRight, ShieldCheck, Keyboard } from 'lucide-react';

export default function LoginScreen({ onLogin, availableUsers }) {
  const [selectedUser, setSelectedUser] = useState(availableUsers[0]?.username || 'zahid');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedUserObj = availableUsers.find(u => u.username === selectedUser) || availableUsers[0];

  const submitPin = useCallback(async (pinToSubmit) => {
    if (!pinToSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUser, pin: pinToSubmit.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user);
      } else {
        const fallback = availableUsers.find(u => u.username === selectedUser && u.pin === pinToSubmit);
        if (fallback) {
          onLogin(fallback);
        } else {
          setError('Incorrect PIN. Please try again.');
          setPin('');
        }
      }
    } catch {
      const fallback = availableUsers.find(u => u.username === selectedUser && u.pin === pinToSubmit);
      if (fallback) {
        onLogin(fallback);
      } else {
        setError('Incorrect PIN. Try 1234, 0000 or 9999');
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUser, availableUsers, onLogin]);

  const handleKeypadPress = useCallback((num) => {
    setPin(prev => {
      if (prev.length >= 6) return prev;
      const next = prev + num;
      setError('');
      // Auto-submit when 4 digits entered
      if (next.length === 4) {
        setTimeout(() => {
          submitPin(next);
        }, 220);
      }
      return next;
    });
  }, [submitPin]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  // Keyboard Event Listener: Allows physical keyboard keys to enter PIN
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If modal or other active input has focus, ignore
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Handle numbers 0-9 (from both main keyboard number row and numeric keypad)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pin.length >= 4) {
          submitPin(pin);
        }
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setPin('');
        setError('');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIdx = availableUsers.findIndex(u => u.username === selectedUser);
        const nextIdx = (currentIdx + 1) % availableUsers.length;
        setSelectedUser(availableUsers[nextIdx].username);
        setPin('');
        setError('');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIdx = availableUsers.findIndex(u => u.username === selectedUser);
        const prevIdx = (currentIdx - 1 + availableUsers.length) % availableUsers.length;
        setSelectedUser(availableUsers[prevIdx].username);
        setPin('');
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeypadPress, handleBackspace, submitPin, pin, availableUsers, selectedUser]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="login-backdrop">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <ArMartLogo height={58} variant="vertical" showTagline={true} />
          <div style={{ marginTop: '10px' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: '-0.02em',
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1
            }}>{timeStr}</div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.40)',
              textAlign: 'center',
              marginTop: '4px',
              letterSpacing: '0.03em'
            }}>{dateStr}</div>
          </div>
          <div className="login-branch-tag">
            <ShieldCheck size={12} style={{ marginRight: 4 }} />
            Handwara POS · Terminal #1
          </div>
        </div>

        {/* Cashier Selection */}
        <div>
          <label className="login-label">Select Active Cashier</label>
          <div className="cashier-avatars-row">
            {availableUsers.map(u => (
              <div
                key={u.username}
                className={`cashier-avatar-card ${selectedUser === u.username ? 'active' : ''}`}
                onClick={() => { setSelectedUser(u.username); setPin(''); setError(''); }}
              >
                <img src={u.avatar} alt={u.name} className="c-avatar-img" />
                <div className="c-info">
                  <span className="c-name">{u.name}</span>
                  <span className="c-role">{u.role}</span>
                </div>
                {selectedUser === u.username && (
                  <div className="c-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PIN Input */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="login-label" style={{ margin: 0 }}>
              Enter PIN for {selectedUserObj?.name}
            </label>
            <span style={{ fontSize: '0.68rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Keyboard size={12} /> Keyboard Ready
            </span>
          </div>

          {/* PIN Dot Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            margin: '12px 0',
          }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid rgba(74,222,128,0.40)',
                background: i < pin.length ? '#4ade80' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: i < pin.length ? 'scale(1.15)' : 'scale(1)',
                boxShadow: i < pin.length ? '0 0 12px rgba(74,222,128,0.5)' : 'none'
              }} />
            ))}
          </div>

          {error && <div className="login-error-msg">{error}</div>}
        </div>

        {/* On-Screen Numpad */}
        <div className="numpad-grid">
          {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => (
            <button
              type="button"
              key={k}
              className="numpad-btn"
              style={k === 'C' ? { color: '#f87171' } : k === '⌫' ? { color: '#fb923c', fontSize: '1.2rem' } : {}}
              onClick={() => {
                if (k === 'C') { setPin(''); setError(''); }
                else if (k === '⌫') handleBackspace();
                else handleKeypadPress(k);
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="login-submit-btn"
          disabled={loading || pin.length === 0}
          onClick={() => submitPin(pin)}
        >
          <span>{loading ? 'Authenticating...' : 'Unlock POS Terminal'}</span>
          <ArrowRight size={18} />
        </button>

        <div className="login-footer-hint">
          Arrow keys (← / →) select Cashier · Keyboard & Numpad PIN active · Secure Terminal
        </div>
      </div>
    </div>
  );
}
