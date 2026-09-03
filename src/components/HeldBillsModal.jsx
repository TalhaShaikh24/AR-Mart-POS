import React from 'react';
import { X, Play, Trash2, PauseCircle } from 'lucide-react';

export default function HeldBillsModal({ isOpen, onClose, heldBills, onResumeBill, onDeleteHeldBill }) {
  if (!isOpen) return null;

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <PauseCircle size={18} className="modal-title-icon" style={{ color: '#f59e0b' }} />
            <h3>Suspended / Held Bills ({heldBills.length})</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="react-modal-body">
          {heldBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              No bills currently on hold. Use "Hold Bill" to pause a customer's order.
            </div>
          ) : (
            <div className="held-bills-list">
              {heldBills.map((bill) => (
                <div key={bill.id} className="held-bill-card">
                  <div className="held-bill-info">
                    <strong>{bill.invoiceNo}</strong>
                    <span className="held-meta">Customer: {bill.customerName || 'Walk-in'} • Time: {bill.heldAt}</span>
                    <span className="held-items">{bill.items?.length || 0} items • ₹{Number(bill.grandTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="held-actions">
                    <button className="btn-resume-bill" onClick={() => onResumeBill(bill)}>
                      <Play size={14} /> Resume Bill
                    </button>
                    <button className="btn-delete-held" onClick={() => onDeleteHeldBill(bill.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
