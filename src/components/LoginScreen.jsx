import React, { useState, useEffect, useCallback } from 'react';
import ArMartLogo from './ArMartLogo';
import { KeyRound, ArrowRight, ShieldCheck, Keyboard } from 'lucide-react';

export default function LoginScreen({ onLogin, availableUsers = [], isLoadingUsers = false }) {
  const [selectedUser, setSelectedUser] = useState(() => availableUsers[0]?.username || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically select first cashier when availableUsers loads
  useEffect(() => {
    if (availableUsers && availableUsers.length > 0) {
      if (!selectedUser || !availableUsers.some(u => u.username === selectedUser)) {
        setSelectedUser(availableUsers[0].username);
      }
    }
  }, [availableUsers, selectedUser]);

  const selectedUserObj = availableUsers.find(u => u.username === selectedUser) || availableUsers[0];

  const submitPin = useCallback(async (pinToSubmit) => {
    const targetUser = selectedUser || availableUsers[0]?.username;
    if (!pinToSubmit || !targetUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUser, pin: pinToSubmit.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user);
      } else {
        const fallback = availableUsers.find(u => u.username === targetUser && u.pin === pinToSubmit);
        if (fallback) {
          onLogin(fallback);
        } else {
          setError('Incorrect PIN. Please try again.');
          setPin('');
        }
      }
    } catch {
      const fallback = availableUsers.find(u => u.username === targetUser && u.pin === pinToSubmit);
      if (fallback) {
        onLogin(fallback);
      } else {
        setError('Incorrect PIN. Please try again.');
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
      // If modal or other active input has focus, or no cashiers loaded, ignore
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (!availableUsers || availableUsers.length === 0) return;

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
      <div className="login-split-card">
        {/* LEFT COLUMN: BRANDING & CASHIER DIRECTORY */}
        <div className="login-col-left">
          {/* Brand & Clock Header */}
          <div className="login-brand-header">
            <ArMartLogo height={52} variant="vertical" showTagline={true} />
            <div className="login-clock-wrap">
              <div className="login-clock-time">{timeStr}</div>
              <div className="login-clock-date">{dateStr}</div>
            </div>
            <div className="login-branch-tag">
              <ShieldCheck size={12} style={{ marginRight: 4 }} />
              Handwara POS · Terminal #1
            </div>
          </div>

          {/* Cashier Directory */}
          <div className="login-cashier-section">
            <div className="login-section-header">
              <span className="login-label">
                Select Active Cashier ({availableUsers.length})
              </span>
            </div>

            {isLoadingUsers && availableUsers.length === 0 ? (
              <div className="login-users-loading-body">
                <div className="login-loading-spinner-ring"></div>
                <h3 className="login-loading-title">Loading Authorized Accounts...</h3>
                <p className="login-loading-sub">Connecting with AR Mart Database</p>
              </div>
            ) : (
              <div className="cashier-avatars-grid">
                {availableUsers.map(u => (
                  <div
                    key={u.username}
                    className={`cashier-avatar-card ${selectedUser === u.username ? 'active' : ''}`}
                    onClick={() => { setSelectedUser(u.username); setPin(''); setError(''); }}
                  >
                    <div className="c-avatar-wrap">
                      <img src={u.avatar} alt={u.name} className="c-avatar-img" />
                      {selectedUser === u.username && (
                        <div className="c-check">✓</div>
                      )}
                    </div>
                    <div className="c-info">
                      <span className="c-name">{u.name}</span>
                      <span className={`c-role-pill role-${(u.role || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="login-footer-hint">
              Arrow keys (← / → / ↑ / ↓) select Cashier
            </div>
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="login-col-divider"></div>

        {/* RIGHT COLUMN: PIN ENTRY & NUMPAD */}
        <div className="login-col-right">
          {/* Active Cashier Highlight */}
          <div className="login-active-cashier-banner">
            <div className="active-cashier-avatar-wrap">
              <img 
                src={selectedUserObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'} 
                alt={selectedUserObj?.name} 
                className="active-cashier-avatar" 
              />
              <div className="active-cashier-status-dot"></div>
            </div>
            <div className="active-cashier-details">
              <span className="active-cashier-lbl">Active Session</span>
              <h3 className="active-cashier-name">{selectedUserObj?.name || 'Cashier'}</h3>
              <div className="active-cashier-meta">
                <span className="active-cashier-role">{selectedUserObj?.role || 'Staff'}</span>
                <span className="active-cashier-ready">● Ready to unlock</span>
              </div>
            </div>
          </div>

          {/* PIN Input & Dot Indicator */}
          <div className="login-pin-section">
            <div className="login-pin-header">
              <span className="login-pin-label">
                Enter Security PIN
              </span>
              <span className="login-keyboard-badge">
                <Keyboard size={12} /> Keyboard Ready
              </span>
            </div>

            {/* PIN Dot Indicator */}
            <div className="login-dots-wrap">
              {[0,1,2,3].map(i => (
                <div key={i} className={`login-pin-dot ${i < pin.length ? 'filled' : ''}`} />
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
                className={`numpad-btn ${k === 'C' ? 'btn-clear' : ''} ${k === '⌫' ? 'btn-backspace' : ''}`}
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

          {/* Unlock Submit Button */}
          <button
            type="button"
            className="login-submit-btn"
            disabled={loading || pin.length === 0 || !selectedUserObj}
            onClick={() => submitPin(pin)}
          >
            <span>{loading ? 'Authenticating...' : 'Unlock POS Terminal'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
