import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Billing & POS Actions',
      items: [
        { key: 'F2', desc: 'Focus Product Search / Barcode Input' },
        { key: '↓ / ↑', desc: 'Navigate Autocomplete Search Results' },
        { key: 'Enter', desc: 'Add Highlighted Product to Cart' },
        { key: 'F4', desc: 'Open Product Catalog Drawer' },
        { key: 'F7', desc: 'Hold / Suspend Current Bill' },
        { key: 'F8', desc: 'Open Suspended / Held Bills List' },
        { key: 'F9', desc: 'Add Custom / Loose Item' },
        { key: 'F10 / Ctrl+Enter', desc: 'Complete Checkout & Print Thermal Receipt' },
      ]
    },
    {
      category: 'Tools & Management',
      items: [
        { key: 'F1', desc: 'Show this Keyboard Shortcuts Guide' },
        { key: 'Alt + C', desc: 'Open Quick POS Calculator' },
        { key: 'Alt + H', desc: 'Open Sales Invoices History' },
        { key: 'Alt + P', desc: 'Open Product Inventory Manager' },
        { key: 'Alt + S', desc: 'Open Store Settings & QR Configuration' },
        { key: 'Alt + V', desc: 'Open Receipt Authenticity Verification' },
        { key: 'Alt + N', desc: 'Attach / Add New Customer' },
        { key: 'Alt + L', desc: 'Switch Cashier / Lock Terminal' },
        { key: 'Escape', desc: 'Close any open Popup Dialog or Drawer' },
      ]
    },
    {
      category: 'Login Screen',
      items: [
        { key: '0 – 9 / Numpad', desc: 'Type 4-Digit Cashier Security PIN' },
        { key: '← / →', desc: 'Select Active Cashier' },
        { key: 'Backspace', desc: 'Erase PIN Digit' },
        { key: 'Enter', desc: 'Authenticate & Unlock POS' },
      ]
    }
  ];

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog shortcuts-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Keyboard size={20} className="modal-title-icon" style={{ color: '#16a34a' }} />
            <h3>POS Keyboard Shortcuts Reference</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <div className="shortcuts-grid">
            {shortcuts.map((cat, idx) => (
              <div key={idx} className="shortcuts-category-card">
                <h4 className="shortcuts-cat-title">{cat.category}</h4>
                <div className="shortcuts-items-list">
                  {cat.items.map((item, i) => (
                    <div key={i} className="shortcut-row">
                      <span className="shortcut-desc">{item.desc}</span>
                      <kbd className="shortcut-badge">{item.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button className="btn-app-primary" onClick={onClose} style={{ minWidth: '160px' }}>
              Got It (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
