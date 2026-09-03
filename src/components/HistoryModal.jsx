import React from 'react';
import { X, Printer, Receipt } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, invoices, onReprint }) {
  if (!isOpen) return null;

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog history-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Receipt size={20} className="modal-title-icon" />
            <h3>Sales & Invoices History</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <div className="history-stats-grid">
            <div className="h-stat-card">
              <span className="h-stat-label">Total Bills Generated</span>
              <strong className="h-stat-val">{invoices.length}</strong>
            </div>
            <div className="h-stat-card">
              <span className="h-stat-label">Total Revenue</span>
              <strong className="h-stat-val font-mono">₹{totalRevenue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="table-responsive-box">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No bills recorded yet. Create a bill to see history.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => (
                    <tr key={idx}>
                      <td><strong className="font-mono">{inv.invoiceNo}</strong></td>
                      <td>{inv.date} {inv.time}</td>
                      <td>{inv.customerName || 'Walk-in'}</td>
                      <td>{inv.items?.length || 0} items ({inv.totalQty || 0} qty)</td>
                      <td><strong className="font-mono">₹{(Number(inv.grandTotal) || 0).toFixed(2)}</strong></td>
                      <td>
                        <button className="btn-table-action" onClick={() => onReprint(inv)}>
                          <Printer size={14} /> Reprint
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
