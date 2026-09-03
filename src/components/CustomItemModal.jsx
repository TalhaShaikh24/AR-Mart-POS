import React, { useState } from 'react';
import { X, Plus, Tag, Layers, Scale, DollarSign, Percent } from 'lucide-react';

const COMMON_CATEGORIES = [
  'General',
  'Grains & Flours',
  'Oils & Ghee',
  'Spices & Salt',
  'Dairy & Beverages',
  'Snacks & Bakery',
  'Fruits & Fresh',
  'Dry Fruits',
  'Personal Care'
];

const COMMON_UNITS = [
  '1 KG',
  '500 g',
  '250 g',
  '100 g',
  '1 PCS',
  '1 L',
  '500 ml',
  'Pack',
  'Dozen'
];

export default function CustomItemModal({ isOpen, onClose, onAddCustomItem }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [unit, setUnit] = useState('1 KG');
  const [customUnit, setCustomUnit] = useState('');
  const [qty, setQty] = useState('1');
  const [mrp, setMrp] = useState('');
  const [rate, setRate] = useState('');
  const [discountType, setDiscountType] = useState('flat'); // 'flat' (₹) or 'percent' (%)
  const [discountVal, setDiscountVal] = useState('');

  if (!isOpen) return null;

  // Handler when MRP changes
  const handleMrpChange = (val) => {
    setMrp(val);
    const m = parseFloat(val);
    if (!isNaN(m) && m > 0) {
      const d = parseFloat(discountVal);
      if (!isNaN(d) && d > 0) {
        if (discountType === 'percent') {
          const discountAmt = (m * d) / 100;
          setRate(Math.max(0, m - discountAmt).toFixed(2));
        } else {
          setRate(Math.max(0, m - d).toFixed(2));
        }
      } else if (!rate || parseFloat(rate) === 0) {
        setRate(val);
      }
    }
  };

  // Handler when Rate changes
  const handleRateChange = (val) => {
    setRate(val);
    const r = parseFloat(val);
    const m = parseFloat(mrp);
    if (!isNaN(m) && !isNaN(r) && m >= r) {
      const diff = m - r;
      if (discountType === 'percent' && m > 0) {
        setDiscountVal(((diff / m) * 100).toFixed(1));
      } else {
        setDiscountVal(diff.toFixed(2));
      }
    }
  };

  // Handler when Discount value changes
  const handleDiscountChange = (val, type = discountType) => {
    setDiscountVal(val);
    const d = parseFloat(val);
    const m = parseFloat(mrp);
    if (!isNaN(m) && m > 0 && !isNaN(d) && d >= 0) {
      if (type === 'percent') {
        const discountAmt = (m * d) / 100;
        setRate(Math.max(0, m - discountAmt).toFixed(2));
      } else {
        setRate(Math.max(0, m - d).toFixed(2));
      }
    }
  };

  const toggleDiscountType = (newType) => {
    setDiscountType(newType);
    const m = parseFloat(mrp);
    const r = parseFloat(rate);
    if (!isNaN(m) && !isNaN(r) && m >= r && m > 0) {
      const diff = m - r;
      if (newType === 'percent') {
        setDiscountVal(((diff / m) * 100).toFixed(1));
      } else {
        setDiscountVal(diff.toFixed(2));
      }
    } else {
      setDiscountVal('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(rate);
    const mrpNum = parseFloat(mrp) || rateNum;
    const qtyNum = parseFloat(qty) || 1;
    if (!name || isNaN(rateNum) || rateNum <= 0) return;

    const finalCat = category === 'Other' ? (customCategory.trim() || 'General') : category;
    const finalUnit = unit === 'Other' ? (customUnit.trim() || '1 PCS') : unit;
    const discountAmt = Math.max(0, mrpNum - rateNum);

    onAddCustomItem({
      id: `CUSTOM_${Date.now()}`,
      name: name.trim(),
      category: finalCat,
      unit: finalUnit,
      mrp: mrpNum,
      rate: rateNum,
      discount: discountAmt,
      tax: 0,
      qty: qtyNum
    });

    // Reset Form
    setName('');
    setCategory('General');
    setCustomCategory('');
    setUnit('1 KG');
    setCustomUnit('');
    setMrp('');
    setRate('');
    setDiscountVal('');
    setQty('1');
    onClose();
  };

  const numMrp = parseFloat(mrp) || 0;
  const numRate = parseFloat(rate) || 0;
  const numQty = parseFloat(qty) || 1;
  const totalPayable = (numQty * numRate).toFixed(2);
  const totalSavings = numMrp > numRate ? ((numMrp - numRate) * numQty).toFixed(2) : 0;

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog custom-product-dialog" style={{ maxWidth: '580px' }}>
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Plus size={20} className="modal-title-icon" style={{ color: '#16a34a' }} />
            <h3>Add Custom / Loose Product</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <form className="modal-form-vertical" onSubmit={handleSubmit}>
            {/* Item Name */}
            <div className="form-field">
              <label>Product / Item Description *</label>
              <input 
                type="text" 
                placeholder="e.g. Fresh Paneer, Kashmiri Almonds, Loose Rice" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                autoFocus 
              />
            </div>

            {/* Category Selection */}
            <div className="form-field-grid">
              <div className="form-field">
                <label><Layers size={13} style={{ display: 'inline', marginRight: '4px' }} /> Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {COMMON_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">+ Custom Category...</option>
                </select>
              </div>

              {category === 'Other' ? (
                <div className="form-field">
                  <label>Custom Category Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter category name" 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    required 
                  />
                </div>
              ) : (
                /* Unit Selection */
                <div className="form-field">
                  <label><Scale size={13} style={{ display: 'inline', marginRight: '4px' }} /> Unit of Measure</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)}>
                    {COMMON_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                    <option value="Other">+ Custom Unit...</option>
                  </select>
                </div>
              )}
            </div>

            {/* If Category was not other, allow custom unit if Unit === Other */}
            {category !== 'Other' && unit === 'Other' && (
              <div className="form-field">
                <label>Custom Unit Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2.5 KG, Meter, Bundle" 
                  value={customUnit} 
                  onChange={e => setCustomUnit(e.target.value)} 
                  required 
                />
              </div>
            )}

            {category === 'Other' && (
              <div className="form-field">
                <label><Scale size={13} style={{ display: 'inline', marginRight: '4px' }} /> Unit of Measure</label>
                <select value={unit} onChange={e => setUnit(e.target.value)}>
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                  <option value="Other">+ Custom Unit...</option>
                </select>
              </div>
            )}

            {/* Quantity and MRP */}
            <div className="form-field-grid">
              <div className="form-field">
                <label>Quantity</label>
                <input 
                  type="number" 
                  step="any" 
                  min="0.01" 
                  value={qty} 
                  onChange={e => setQty(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>MRP (₹) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="e.g. 100.00" 
                  value={mrp} 
                  onChange={e => handleMrpChange(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Discount and Selling Rate */}
            <div className="form-field-grid">
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Discount</label>
                  <div className="discount-toggle-group">
                    <button 
                      type="button" 
                      className={`discount-toggle-btn ${discountType === 'flat' ? 'active' : ''}`}
                      onClick={() => toggleDiscountType('flat')}
                    >
                      ₹ Flat
                    </button>
                    <button 
                      type="button" 
                      className={`discount-toggle-btn ${discountType === 'percent' ? 'active' : ''}`}
                      onClick={() => toggleDiscountType('percent')}
                    >
                      % Off
                    </button>
                  </div>
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder={discountType === 'flat' ? '₹ Discount' : '% Discount'} 
                  value={discountVal} 
                  onChange={e => handleDiscountChange(e.target.value)} 
                />
              </div>

              <div className="form-field">
                <label>Selling Rate / Unit (₹) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  placeholder="e.g. 85.00" 
                  value={rate} 
                  onChange={e => handleRateChange(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Live Calculation Summary Card */}
            {numRate > 0 && (
              <div className="custom-prod-summary-box">
                <div className="summary-row">
                  <span>Unit Price:</span>
                  <strong>₹{numRate.toFixed(2)} / {unit === 'Other' ? (customUnit || 'unit') : unit}</strong>
                </div>
                {totalSavings > 0 && (
                  <div className="summary-row savings-text">
                    <span>Discount Savings:</span>
                    <strong>- ₹{totalSavings}</strong>
                  </div>
                )}
                <div className="summary-row total-row">
                  <span>Total Payable ({qty} qty):</span>
                  <span className="summary-grand-total">₹{totalPayable}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-app-primary full-width" style={{ marginTop: '0.75rem', height: '46px' }}>
              <Plus size={18} /> Add Custom Product to Bill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
