import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Lock, UserCheck, Check, AlertCircle, Users } from 'lucide-react';

export default function SecurityModal({ isOpen, onClose, currentUser, availableUsers, onPinUpdated, onOpenUsersManager }) {
  const [activeTab, setActiveTab] = useState('self'); // 'self' | 'admin'

  // Self PIN Change State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [selfStatus, setSelfStatus] = useState({ type: '', msg: '' });
  const [selfLoading, setSelfLoading] = useState(false);

  // Admin PIN Reset State
  const [selectedTargetUser, setSelectedTargetUser] = useState(availableUsers[0]?.username || '');
  const [adminPin, setAdminPin] = useState('');
  const [adminNewPin, setAdminNewPin] = useState('');
  const [adminStatus, setAdminStatus] = useState({ type: '', msg: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'Admin';

  // Handle Self PIN Change
  const handleSelfSubmit = async (e) => {
    e.preventDefault();
    setSelfStatus({ type: '', msg: '' });

    if (!/^\d{4}$/.test(newPin)) {
      setSelfStatus({ type: 'error', msg: 'New PIN must be exactly 4 numeric digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setSelfStatus({ type: 'error', msg: 'New PIN and Confirm PIN do not match.' });
      return;
    }

    setSelfLoading(true);
    try {
      const res = await fetch('/api/users/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          currentPin: currentPin.trim(),
          newPin: newPin.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelfStatus({ type: 'success', msg: 'Your PIN has been changed successfully!' });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        if (onPinUpdated) onPinUpdated();
      } else {
        setSelfStatus({ type: 'error', msg: data.message || 'Failed to change PIN.' });
      }
    } catch (err) {
      setSelfStatus({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSelfLoading(false);
    }
  };

  // Handle Admin Reset PIN
  const handleAdminReset = async (e) => {
    e.preventDefault();
    setAdminStatus({ type: '', msg: '' });

    if (!/^\d{4}$/.test(adminNewPin)) {
      setAdminStatus({ type: 'error', msg: 'New PIN must be exactly 4 numeric digits.' });
      return;
    }

    setAdminLoading(true);
    try {
      const res = await fetch('/api/users/admin-reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: currentUser.username,
          adminPin: adminPin.trim(),
          targetUsername: selectedTargetUser,
          newPin: adminNewPin.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminStatus({ type: 'success', msg: data.message || 'PIN reset successfully!' });
        setAdminPin('');
        setAdminNewPin('');
        if (onPinUpdated) onPinUpdated();
      } else {
        setAdminStatus({ type: 'error', msg: data.message || 'Failed to reset PIN.' });
      }
    } catch (err) {
      setAdminStatus({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog security-modal-dialog" style={{ maxWidth: '520px' }}>
        <div className="react-modal-header">
          <div className="modal-title-box">
            <ShieldCheck size={20} className="modal-title-icon" style={{ color: '#16a34a' }} />
            <h3>Terminal Security & PIN Management</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tab Switcher */}
        <div className="security-tabs-header">
          <button 
            className={`sec-tab-btn ${activeTab === 'self' ? 'active' : ''}`}
            onClick={() => setActiveTab('self')}
          >
            <KeyRound size={15} />
            <span>Change My PIN</span>
          </button>
          <button 
            className={`sec-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <UserCheck size={15} />
            <span>Admin PIN Reset {isAdmin ? '' : '(Admin Only)'}</span>
          </button>
          {isAdmin && (
            <button 
              className="sec-tab-btn"
              onClick={() => {
                if (onOpenUsersManager) onOpenUsersManager();
              }}
              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 800 }}
              title="Open Full User Management Module (Add, Edit, Delete Users)"
            >
              <Users size={15} />
              <span>Users Module 👥</span>
            </button>
          )}
        </div>

        <div className="react-modal-body">
          {/* TAB 1: SELF PIN CHANGE */}
          {activeTab === 'self' && (
            <form className="modal-form-vertical" onSubmit={handleSelfSubmit}>
              <div className="sec-user-badge">
                <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt={currentUser.name} className="sec-user-avatar" />
                <div>
                  <strong>{currentUser.name}</strong>
                  <span className="sec-user-role">{currentUser.role} · @{currentUser.username}</span>
                </div>
              </div>

              {selfStatus.msg && (
                <div className={`sec-alert-box ${selfStatus.type}`}>
                  {selfStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                  <span>{selfStatus.msg}</span>
                </div>
              )}

              <div className="form-field">
                <label>Current 4-Digit PIN *</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  inputMode="numeric" 
                  placeholder="Enter current PIN" 
                  value={currentPin} 
                  onChange={e => setCurrentPin(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label>New 4-Digit PIN *</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    inputMode="numeric" 
                    placeholder="New PIN (0-9)" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Confirm New PIN *</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    inputMode="numeric" 
                    placeholder="Re-enter PIN" 
                    value={confirmPin} 
                    onChange={e => setConfirmPin(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-app-primary full-width" disabled={selfLoading} style={{ marginTop: '0.75rem', height: '44px' }}>
                <KeyRound size={16} /> {selfLoading ? 'Updating PIN...' : 'Update My PIN'}
              </button>
            </form>
          )}

          {/* TAB 2: ADMIN PIN RESET */}
          {activeTab === 'admin' && (
            <div>
              {!isAdmin ? (
                <div className="sec-admin-locked-card">
                  <Lock size={32} style={{ color: '#ef4444', marginBottom: '8px' }} />
                  <h4>Admin Access Required</h4>
                  <p>You are logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). Only the Store Admin or Manager can reset cashiers' PINs.</p>
                  <small style={{ color: '#64748b' }}>To reset other cashiers, switch user and log in as Store Manager (Admin).</small>
                </div>
              ) : (
                <form className="modal-form-vertical" onSubmit={handleAdminReset}>
                  <div className="sec-admin-header-note">
                    <strong>🛡️ Store Manager PIN Reset Panel</strong>
                    <p>As Store Admin, you can reset the PIN for any cashier terminal.</p>
                  </div>

                  {adminStatus.msg && (
                    <div className={`sec-alert-box ${adminStatus.type}`}>
                      {adminStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                      <span>{adminStatus.msg}</span>
                    </div>
                  )}

                  <div className="form-field">
                    <label>Select Cashier / User to Reset *</label>
                    <select 
                      value={selectedTargetUser} 
                      onChange={e => setSelectedTargetUser(e.target.value)}
                      required
                    >
                      {availableUsers.map(u => (
                        <option key={u.username} value={u.username}>
                          {u.name} ({u.role}) — @{u.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-grid">
                    <div className="form-field">
                      <label>Your Admin PIN (Authorize) *</label>
                      <input 
                        type="password" 
                        maxLength={4} 
                        inputMode="numeric" 
                        placeholder="Enter Admin PIN" 
                        value={adminPin} 
                        onChange={e => setAdminPin(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Set New 4-Digit PIN *</label>
                      <input 
                        type="password" 
                        maxLength={4} 
                        inputMode="numeric" 
                        placeholder="New PIN (e.g. 5555)" 
                        value={adminNewPin} 
                        onChange={e => setAdminNewPin(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-app-primary full-width" disabled={adminLoading} style={{ marginTop: '0.75rem', height: '44px' }}>
                    <ShieldCheck size={16} /> {adminLoading ? 'Resetting PIN...' : `Confirm & Reset PIN for ${selectedTargetUser}`}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
