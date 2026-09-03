import React, { useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';

export default function ProductsModal({ isOpen, onClose, products, onAddProduct, onDeleteProduct }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Grains & Flours',
    unit: '1 KG',
    mrp: '',
    rate: '',
    barcode: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.rate) return;

    onAddProduct({
      id: `ARM${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim() || '1 PCS',
      mrp: parseFloat(form.mrp) || parseFloat(form.rate),
      rate: parseFloat(form.rate),
      barcode: form.barcode.trim(),
      tax: 0
    });

    setForm({
      name: '',
      category: 'Grains & Flours',
      unit: '1 KG',
      mrp: '',
      rate: '',
      barcode: ''
    });
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog products-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Package size={20} className="modal-title-icon" />
            <h3>Inventory Product Management</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          {/* Card-style Add Product Form with Labeled Grid */}
          <form className="products-form-card" onSubmit={handleSubmit}>
            <div className="p-form-header">
              <Plus size={16} />
              <span>Add New Item to Inventory</span>
            </div>

            <div className="p-form-grid">
              <div className="form-field">
                <label>Item Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Basmati Rice 5kg" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Grains & Flours">Grains & Flours</option>
                  <option value="Oils & Ghee">Oils & Ghee</option>
                  <option value="Spices & Salt">Spices & Salt</option>
                  <option value="Dairy & Beverages">Dairy & Beverages</option>
                  <option value="Snacks & Bakery">Snacks & Bakery</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Fruits & Fresh">Fruits & Fresh</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-field">
                <label>Unit *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 KG, 1 L, 100 g" 
                  value={form.unit} 
                  onChange={e => setForm({ ...form, unit: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-field">
                <label>MRP (₹)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  placeholder="Optional" 
                  value={form.mrp} 
                  onChange={e => setForm({ ...form, mrp: e.target.value })} 
                />
              </div>

              <div className="form-field">
                <label>Selling Rate (₹) *</label>
                <input 
                  type="number" 
                  step="0.5" 
                  placeholder="0.00" 
                  value={form.rate} 
                  onChange={e => setForm({ ...form, rate: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-field">
                <label>Barcode / SKU (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Scan or enter code" 
                  value={form.barcode} 
                  onChange={e => setForm({ ...form, barcode: e.target.value })} 
                />
              </div>
            </div>

            <div className="p-form-actions">
              <button type="submit" className="btn-app-primary">
                <Plus size={16} /> Save Item to Catalog
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="table-responsive-box" style={{ maxHeight: '340px' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Barcode</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No items found in catalog. Add your first item above.
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="table-cat-badge">{p.category}</span></td>
                      <td>{p.unit}</td>
                      <td className="font-mono">₹{Number(p.mrp || p.rate).toFixed(2)}</td>
                      <td className="font-mono"><strong>₹{Number(p.rate).toFixed(2)}</strong></td>
                      <td className="font-mono">{p.barcode || '-'}</td>
                      <td>
                        <button className="btn-delete-action" onClick={() => onDeleteProduct(p.id || p._id)} title="Delete Item">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
