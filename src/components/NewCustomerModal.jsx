import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function NewCustomerModal({ isOpen, onClose, onSaveCustomer }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name && !phone) return;
    onSaveCustomer({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    setName('');
    setPhone('');
    setAddress('');
    onClose();
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <UserPlus size={18} className="modal-title-icon" style={{ color: '#2563eb' }} />
            <h3>Add New Customer</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="react-modal-body">
          <form className="modal-form-vertical" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Customer Full Name *</label>
              <input type="text" placeholder="e.g. Zahid Khan" value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-field">
              <label>Mobile / WhatsApp Number</label>
              <input type="tel" placeholder="e.g. 9682329952" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Address / Area (Optional)</label>
              <input type="text" placeholder="e.g. Handwara Main Market" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <button type="submit" className="btn-app-primary full-width" style={{ marginTop: '0.5rem' }}>
              Save & Attach to Current Bill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
