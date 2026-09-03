import React, { useState } from 'react';
import { X, Search, Plus, ShoppingBag } from 'lucide-react';

export default function ProductCatalogDrawer({ isOpen, onClose, products, onAddToCart }) {
  const [activeCat, setActiveCat] = useState('All Items');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All Items', 'Grains & Flours', 'Oils & Ghee', 'Spices & Salt', 'Dairy & Beverages', 'Snacks & Bakery', 'Personal Care', 'Fruits & Fresh'];

  const filtered = products.filter(p => {
    const matchCat = activeCat === 'All Items' || p.category === activeCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog catalog-drawer-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <ShoppingBag size={20} className="modal-title-icon" style={{ color: '#16a34a' }} />
            <h3>Quick Product Catalog Browser</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '600px' }}>
          <div className="catalog-drawer-search">
            <Search size={18} className="search-icon-svg" />
            <input 
              type="text" 
              placeholder="Search product name or barcode..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              autoFocus 
            />
          </div>

          <div className="catalog-drawer-cats">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`drawer-cat-pill ${activeCat === cat ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="catalog-drawer-grid">
            {filtered.map(p => (
              <div 
                key={p.id || p._id} 
                className="drawer-product-card"
                onClick={() => {
                  onAddToCart(p);
                }}
              >
                <div className="drawer-prod-img-box">
                  <span className="drawer-prod-emoji">🛒</span>
                </div>
                <div className="drawer-prod-details">
                  <span className="drawer-prod-cat">{p.category}</span>
                  <strong className="drawer-prod-name">{p.name}</strong>
                  <span className="drawer-prod-unit">{p.unit} • Stock: {p.stock || 250}</span>
                </div>
                <div className="drawer-prod-price-row">
                  <span className="drawer-prod-price">₹{Number(p.rate).toFixed(2)}</span>
                  <button className="btn-drawer-add"><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
