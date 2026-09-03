import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function CustomItemModal({ isOpen, onClose, onAddCustomItem }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('1 KG');
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('');
  const [mrp, setMrp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(rate);
    const qtyNum = parseFloat(qty) || 1;
    if (!name || isNaN(rateNum) || rateNum <= 0) return;

    onAddCustomItem({
      id: `CUSTOM_${Date.now()}`,
      name: name.trim(),
      category: 'General',
      unit: unit.trim() || '1 PCS',
      mrp: parseFloat(mrp) || rateNum,
      rate: rateNum,
      tax: 0,
      qty: qtyNum
    });

    setName('');
    setRate('');
    setMrp('');
    setQty('1');
    onClose();
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog">
        <div className="react-modal-header">
          <h3>Add Custom / Loose Item</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <form className="modal-form-vertical" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Item Description *</label>
              <input type="text" placeholder="e.g. Fresh Paneer, Loose Dry Fruit" value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>

            <div className="form-field-grid">
              <div className="form-field">
                <label>Unit</label>
                <input type="text" placeholder="1 KG, 500 g, 1 PCS" value={unit} onChange={e => setUnit(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Quantity</label>
                <input type="number" step="0.1" min="0.1" value={qty} onChange={e => setQty(e.target.value)} required />
              </div>
            </div>

            <div className="form-field-grid">
              <div className="form-field">
                <label>Rate / Unit (₹) *</label>
                <input type="number" step="0.5" placeholder="0.00" value={rate} onChange={e => setRate(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>MRP (₹)</label>
                <input type="number" step="0.5" placeholder="Optional" value={mrp} onChange={e => setMrp(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-app-primary full-width" style={{ marginTop: '0.5rem' }}>
              <Plus size={16} /> Add to Current Bill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
