import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifySearchModal({ isOpen, onClose, invoices }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toLowerCase();
    const found = invoices.find(inv => inv.invoiceNo.toLowerCase() === clean);
    setResult(found || null);
    setSearched(true);
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog">
        <div className="react-modal-header">
          <h3>Verify Receipt Authenticity</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Enter invoice number to confirm genuine AR Mart store issuance:
          </p>

          <form className="verify-search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="e.g. ARM/2025/05/26/001" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              autoFocus 
            />
            <button type="submit" className="btn-app-primary">
              <Search size={16} /> Verify
            </button>
          </form>

          {searched && (
            <div className="verify-search-result">
              {result ? (
                <div className="verified-success-box">
                  <div className="verified-pill">
                    <CheckCircle size={16} /> Official Verified Receipt
                  </div>
                  <div className="verified-details">
                    <div><strong>Store:</strong> {result.store?.name || 'AR Mart'} (FSSAI: {result.store?.fssai || '21026252000118'})</div>
                    <div><strong>Invoice No:</strong> {result.invoiceNo}</div>
                    <div><strong>Date & Time:</strong> {result.date} at {result.time}</div>
                    <div><strong>Customer:</strong> {result.customerName || 'Walk-in'} {result.customerPhone ? `(${result.customerPhone})` : ''}</div>
                    <div><strong>Total Amount:</strong> <strong className="text-brand font-mono">₹{Number(result.grandTotal).toFixed(2)}</strong></div>
                    <div><strong>Items:</strong> {result.items?.length || 0} items ({result.totalQty} total qty)</div>
                  </div>
                </div>
              ) : (
                <div className="verified-error-box">
                  <AlertCircle size={20} />
                  <div>
                    <strong>No Record Found</strong>
                    <p>No official invoice matching "{query}" exists in AR Mart database.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
