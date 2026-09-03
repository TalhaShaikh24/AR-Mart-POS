import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Printer, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, storeConfig, onSaveSettings }) {
  const [cfg, setCfg] = useState({ ...storeConfig });

  useEffect(() => {
    setCfg({ ...storeConfig });
  }, [storeConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(cfg);
    onClose();
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Settings size={20} className="modal-title-icon" />
            <h3>Store & Thermal Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="react-modal-body">
          <form className="modal-form-vertical" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Store Name</label>
              <input type="text" value={cfg.storeName} onChange={e => setCfg({ ...cfg, storeName: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Address</label>
              <input type="text" value={cfg.address} onChange={e => setCfg({ ...cfg, address: e.target.value })} required />
            </div>
            <div className="form-field-grid">
              <div className="form-field">
                <label>Phone Number</label>
                <input type="text" value={cfg.phone} onChange={e => setCfg({ ...cfg, phone: e.target.value })} />
              </div>
              <div className="form-field">
                <label>WhatsApp Number</label>
                <input type="text" value={cfg.whatsapp} onChange={e => setCfg({ ...cfg, whatsapp: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label>FSSAI Registration No.</label>
              <input type="text" value={cfg.fssai} onChange={e => setCfg({ ...cfg, fssai: e.target.value })} />
            </div>

            <h4 className="modal-section-title">Bank & Payment Info</h4>
            <div className="form-field-grid">
              <div className="form-field">
                <label>Account Number</label>
                <input type="text" value={cfg.bankAcct} onChange={e => setCfg({ ...cfg, bankAcct: e.target.value })} />
              </div>
              <div className="form-field">
                <label>IFSC Code</label>
                <input type="text" value={cfg.bankIfsc} onChange={e => setCfg({ ...cfg, bankIfsc: e.target.value })} />
              </div>
            </div>
            <div className="form-field-grid">
              <div className="form-field">
                <label>Beneficiary Name</label>
                <input type="text" value={cfg.bankName} onChange={e => setCfg({ ...cfg, bankName: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Bank & Branch</label>
                <input type="text" value={cfg.bankBranch} onChange={e => setCfg({ ...cfg, bankBranch: e.target.value })} />
              </div>
            </div>

            <h4 className="modal-section-title">Thermal Receipt & QR Settings</h4>
            <div className="form-field-grid">
              <div className="form-field">
                <label>Paper Size</label>
                <select value={cfg.paperSize} onChange={e => setCfg({ ...cfg, paperSize: e.target.value })}>
                  <option value="80mm">80mm (Standard POS)</option>
                  <option value="58mm">58mm (Compact Thermal)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Receipt QR Mode</label>
                <select value={cfg.qrMode} onChange={e => setCfg({ ...cfg, qrMode: e.target.value })}>
                  <option value="verify">Official Mobile Verification Link</option>
                  <option value="upi">UPI Scan & Pay</option>
                  <option value="offline">Offline Direct Payload</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Custom Verification Base URL (Optional)</label>
              <input 
                type="text" 
                placeholder="Leave blank for auto-detected URL or enter custom domain" 
                value={cfg.verifyBaseUrl || ''} 
                onChange={e => setCfg({ ...cfg, verifyBaseUrl: e.target.value })} 
              />
              <small className="field-hint">When customers scan the QR with their mobile camera, this verification URL opens automatically.</small>
            </div>

            <h4 className="modal-section-title">⚡ Direct Silent Printing (Zero Dialog Popup)</h4>
            <div className="silent-print-info-box">
              <div className="silent-print-badge">
                <CheckCircle2 size={15} />
                <span>Kiosk Direct Printing Ready</span>
              </div>
              <p className="silent-print-desc">
                By default, standard browsers show a print preview popup due to web security. To print <strong>instantly to your physical thermal printer with 0 popups and 0 dialogs</strong>, launch POS using the shortcut created on your Desktop:
              </p>
              <div className="silent-shortcut-tag">
                🖥️ Desktop \ AR Mart POS (Direct Silent Print).lnk
              </div>
              <p className="silent-print-desc" style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Or run Chrome / Edge with <code>--kiosk-printing --app=http://localhost:5000</code>. Whenever you click <strong>Make Payment & Print (F10)</strong>, the receipt prints silently in under 0.2s!
              </p>
            </div>

            <button type="submit" className="btn-app-primary full-width" style={{ marginTop: '0.5rem' }}>
              <Save size={16} /> Save Configuration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
