import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import ThermalReceipt from './ThermalReceipt';

export default function ReceiptPreviewModal({ isOpen, onClose, invoice, storeConfig, onPrint }) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog receipt-preview-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Printer size={20} className="modal-title-icon" style={{ color: '#16a34a' }} />
            <h3>Thermal Receipt Preview & Print</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="preview-top-actions">
            <button className="btn-app-primary" onClick={onPrint} style={{ minWidth: '180px' }}>
              <Printer size={18} /> Print Thermal Receipt
            </button>
            <button className="btn-table-action" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="receipt-paper-wrapper">
            <ThermalReceipt invoice={invoice} storeConfig={storeConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}
