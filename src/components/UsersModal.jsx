import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  UserCheck, 
  Edit3, 
  Trash2, 
  KeyRound, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Search,
  CheckCircle2
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Avatar 1 (Male Cashier)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { label: 'Avatar 2 (Male Staff)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: 'Avatar 3 (Manager)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
  { label: 'Avatar 4 (Female Cashier)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: 'Avatar 5 (Staff Member)', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces' },
];

export default function UsersModal({ isOpen, onClose, currentUser, onUsersUpdated }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPins, setShowPins] = useState({}); // { [username]: boolean }
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingUser, setEditingUser] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'Cashier',
    pin: '',
    avatar: PRESET_AVATARS[0].url,
    active: true
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all users for Admin
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/admin/all');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
      setMode('list');
      setFormError('');
      setFormSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'Admin';

  // Toggle PIN Reveal
  const togglePinVisibility = (username) => {
    setShowPins(prev => ({ ...prev, [username]: !prev[username] }));
  };

  // Open Add User Mode
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      role: 'Cashier',
      pin: '',
      avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url,
      active: true
    });
    setFormError('');
    setFormSuccess('');
    setMode('add');
  };

  // Open Edit User Mode
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role,
      pin: user.pin || '',
      avatar: user.avatar || PRESET_AVATARS[0].url,
      active: user.active !== undefined ? user.active : true
    });
    setFormError('');
    setFormSuccess('');
    setMode('edit');
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('Please enter full name.');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('Please enter a unique username.');
      return;
    }
    if (!/^\d{4,6}$/.test(formData.pin)) {
      setFormError('PIN must be 4 to 6 numeric digits.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'add') {
        const res = await fetch('/api/users/admin/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormSuccess(`User "${formData.name}" created successfully!`);
          await fetchAllUsers();
          if (onUsersUpdated) onUsersUpdated();
          setTimeout(() => setMode('list'), 1200);
        } else {
          setFormError(data.message || 'Failed to create user.');
        }
      } else if (mode === 'edit') {
        const res = await fetch(`/api/users/admin/update/${editingUser.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormSuccess(`User "${formData.name}" updated successfully!`);
          await fetchAllUsers();
          if (onUsersUpdated) onUsersUpdated();
          setTimeout(() => setMode('list'), 1200);
        } else {
          setFormError(data.message || 'Failed to update user.');
        }
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (user.username === currentUser?.username) {
      alert('You cannot delete your own logged-in account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.name}" (@${user.username})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/admin/delete/${user.username}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAllUsers();
        if (onUsersUpdated) onUsersUpdated();
      } else {
        alert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error while deleting user.');
    }
  };

  // Handle Toggle Active/Inactive
  const handleToggleActive = async (user) => {
    if (user.username === currentUser?.username) {
      alert('You cannot deactivate your own logged-in account.');
      return;
    }
    try {
      const res = await fetch(`/api/users/admin/update/${user.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAllUsers();
        if (onUsersUpdated) onUsersUpdated();
      }
    } catch (err) {}
  };

  // Filter Users
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog users-modal-dialog">
        
        {/* Header */}
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Users size={22} className="modal-title-icon text-green" />
            <div>
              <h3>Admin Users & Cashiers Management</h3>
              <p className="modal-subtitle">Add new cashiers, update roles, set login PINs & manage permissions</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="react-modal-body">

          {/* Access Denied if not Admin */}
          {!isAdmin ? (
            <div className="sec-admin-locked-card" style={{ margin: '1rem 0' }}>
              <ShieldCheck size={36} color="#d97706" />
              <h4>Admin Access Required</h4>
              <p>User creation and modification requires Store Manager (Admin) privileges. Please switch to the Admin user to manage staff accounts.</p>
            </div>
          ) : (
            <>
              {/* TOP ACTION BAR */}
              <div className="users-top-bar">
                {mode === 'list' ? (
                  <>
                    <div className="users-search-wrap">
                      <Search size={16} className="users-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search cashier or username..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="users-search-input"
                      />
                    </div>
                    <button className="user-add-btn" onClick={handleOpenAdd}>
                      <UserPlus size={16} /> <span>Add New User</span>
                    </button>
                  </>
                ) : (
                  <button className="user-back-btn" onClick={() => setMode('list')}>
                    ← Back to Users List
                  </button>
                )}
              </div>

              {/* MODE: ADD / EDIT FORM */}
              {mode !== 'list' ? (
                <form className="user-form-card" onSubmit={handleSubmitForm}>
                  <div className="user-form-header">
                    <h4>{mode === 'add' ? '✨ Add New POS User' : `✏️ Edit User: ${editingUser?.name}`}</h4>
                    <span className="user-form-desc">
                      {mode === 'add' ? 'Create login credentials for a new cashier or manager' : 'Update details, change role, or reset login PIN'}
                    </span>
                  </div>

                  {formError && (
                    <div className="sec-status-msg error">
                      <AlertCircle size={16} /> <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="sec-status-msg success">
                      <Check size={16} /> <span>{formSuccess}</span>
                    </div>
                  )}

                  <div className="user-form-grid">
                    {/* Full Name */}
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Imran Malik" 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required 
                      />
                    </div>

                    {/* Username */}
                    <div className="form-field">
                      <label>Username (Unique ID) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. imran" 
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                        disabled={mode === 'edit'}
                        required 
                      />
                      {mode === 'edit' && <span className="field-hint">Username cannot be changed once created.</span>}
                    </div>

                    {/* Role Selector */}
                    <div className="form-field">
                      <label>Role / Position *</label>
                      <select 
                        value={formData.role} 
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="Cashier">Cashier</option>
                        <option value="Head Cashier">Head Cashier</option>
                        <option value="POS Manager">POS Manager</option>
                        <option value="Admin">Store Manager (Admin)</option>
                      </select>
                    </div>

                    {/* Login PIN */}
                    <div className="form-field">
                      <label>4-Digit Login PIN *</label>
                      <input 
                        type="password" 
                        maxLength={6}
                        placeholder="e.g. 1234" 
                        value={formData.pin}
                        onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                        required 
                      />
                      <span className="field-hint">Numbers only (4 to 6 digits).</span>
                    </div>
                  </div>

                  {/* Avatar Selection */}
                  <div className="form-field avatar-selector-section">
                    <label>Select Profile Avatar</label>
                    <div className="avatar-presets-row">
                      {PRESET_AVATARS.map((av, idx) => (
                        <img 
                          key={idx} 
                          src={av.url} 
                          alt={av.label} 
                          className={`preset-avatar-img ${formData.avatar === av.url ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, avatar: av.url })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="form-field active-toggle-field">
                    <label className="toggle-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.active} 
                        onChange={e => setFormData({ ...formData, active: e.target.checked })} 
                      />
                      <span>Active Account (Able to log in to terminal)</span>
                    </label>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="user-form-actions">
                    <button type="button" className="btn-cancel" onClick={() => setMode('list')}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-save" disabled={submitting}>
                      {submitting ? 'Saving...' : (mode === 'add' ? 'Create User' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              ) : (
                /* MODE: USERS LIST */
                <div className="users-table-container">
                  {loading ? (
                    <div className="users-loading">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="users-empty">No users found matching your search.</div>
                  ) : (
                    <div className="users-cards-grid">
                      {filteredUsers.map((u) => {
                        const isSelf = u.username === currentUser?.username;
                        const isPinShown = showPins[u.username];

                        return (
                          <div key={u.username} className={`user-item-card ${!u.active ? 'inactive-card' : ''}`}>
                            <div className="user-card-top">
                              <div className="user-avatar-wrap">
                                <img src={u.avatar || PRESET_AVATARS[0].url} alt={u.name} className="user-card-avatar" />
                                <span className={`user-status-dot ${u.active ? 'active' : 'inactive'}`} />
                              </div>

                              <div className="user-card-info">
                                <div className="user-name-line">
                                  <span className="user-card-name">{u.name}</span>
                                  {isSelf && <span className="self-badge">You</span>}
                                </div>
                                <span className="user-card-username">@{u.username}</span>
                                <div className="user-role-pill-wrap">
                                  <span className={`role-badge ${u.role === 'Admin' ? 'admin' : (u.role === 'Head Cashier' ? 'head' : 'cashier')}`}>
                                    {u.role}
                                  </span>
                                  {!u.active && <span className="inactive-badge">Deactivated</span>}
                                </div>
                              </div>
                            </div>

                            {/* PIN Bar */}
                            <div className="user-pin-bar">
                              <span className="user-pin-label">Terminal PIN:</span>
                              <span className="user-pin-value font-mono">
                                {isPinShown ? u.pin : '••••'}
                              </span>
                              <button 
                                type="button" 
                                className="user-pin-eye-btn" 
                                onClick={() => togglePinVisibility(u.username)}
                                title={isPinShown ? 'Hide PIN' : 'Reveal PIN'}
                              >
                                {isPinShown ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="user-card-actions">
                              <button 
                                type="button" 
                                className="user-action-btn edit" 
                                onClick={() => handleOpenEdit(u)}
                                title="Edit User Details & PIN"
                              >
                                <Edit3 size={14} /> <span>Edit</span>
                              </button>

                              {!isSelf && (
                                <>
                                  <button 
                                    type="button" 
                                    className={`user-action-btn toggle ${u.active ? 'deactivate' : 'activate'}`}
                                    onClick={() => handleToggleActive(u)}
                                    title={u.active ? 'Deactivate Cashier' : 'Activate Cashier'}
                                  >
                                    {u.active ? 'Deactivate' : 'Activate'}
                                  </button>

                                  <button 
                                    type="button" 
                                    className="user-action-btn delete" 
                                    onClick={() => handleDeleteUser(u)}
                                    title="Delete User"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
