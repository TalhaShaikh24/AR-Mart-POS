import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function ThermalReceipt({ invoice, storeConfig, isCompact = false }) {
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (!invoice || !qrCanvasRef.current) return;

    let payload = '';
    const mode = storeConfig?.qrMode || 'verify';

    if (mode === 'upi') {
      const upiId = (storeConfig?.whatsapp || '9682329952') + '@upi';
      payload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeConfig?.bankName || 'AR DELIVERO')}&am=${Number(invoice.grandTotal || 0).toFixed(2)}&cu=INR&tn=AR_Mart_${String(invoice.invoiceNo || '').replace(/\//g, '_')}`;
    } else if (mode === 'offline') {
      payload = `AR MART OFFICIAL RECEIPT\nInvoice: ${invoice.invoiceNo}\nDate: ${invoice.date} ${invoice.time}\nItems: ${invoice.items?.length || 0} (Qty: ${invoice.totalQty})\nTotal: ₹${Number(invoice.grandTotal || 0).toFixed(2)}\nFSSAI: ${storeConfig?.fssai || '21026252000118'}\nVerified Authentic Store Copy`;
    } else {
      // Default: Mobile friendly verification web link
      let baseUrl = storeConfig?.verifyBaseUrl;
      if (!baseUrl) {
        baseUrl = `${window.location.origin}/?verify=${encodeURIComponent(invoice.invoiceNo || '')}`;
      } else {
        baseUrl = `${baseUrl}?inv=${encodeURIComponent(invoice.invoiceNo || '')}`;
      }

      // Encode structured payload for mobile camera scan
      const compactData = {
        i: invoice.invoiceNo,
        d: invoice.date,
        t: invoice.time,
        c: invoice.customerName,
        p: invoice.customerPhone,
        it: (invoice.items || []).map(x => ({ 
          n: x.name, 
          u: x.unit, 
          q: x.qty, 
          r: Number(x.rate || 0), 
          a: Number((x.qty || 1) * (x.rate || 0)) 
        })),
        st: Number(invoice.subTotal || 0),
        ds: Number(invoice.discount || 0),
        tx: Number(invoice.tax || 0),
        gt: Number(invoice.grandTotal || 0),
        s: storeConfig?.storeName || 'AR Mart',
        f: storeConfig?.fssai || '21026252000118'
      };

      try {
        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(compactData)))));
        payload = `${window.location.origin}/?verifyData=${encoded}`;
      } catch (err) {
        payload = baseUrl;
      }
    }

    QRCode.toCanvas(qrCanvasRef.current, payload, {
      width: isCompact || storeConfig?.paperSize === '58mm' ? 115 : 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).catch(err => console.error('QR Render error', err));
  }, [invoice, storeConfig, isCompact]);

  if (!invoice) return null;

  const cfg = storeConfig || {};
  const is58 = isCompact || cfg.paperSize === '58mm';

  return (
    <div className={`thermal-receipt ${is58 ? 'compact-58mm size-58mm' : ''}`} id="thermalReceipt">
      {/* Header */}
      <div className="rcpt-header">
        <div className="rcpt-logo">
          <img 
            src="/ar-mart-logo.png" 
            alt="AR Mart" 
            style={{ 
              height: is58 ? '40px' : '48px', 
              width: 'auto', 
              objectFit: 'contain', 
              margin: '0 auto 4px', 
              display: 'block' 
            }} 
          />
        </div>
        <h1 className="rcpt-store-name">{cfg.storeName || 'AR Mart'}</h1>
        <div className="rcpt-info-line">Address: {cfg.address || 'Braripora Handwara J&K-193221'}</div>
        <div className="rcpt-info-line">Phone : {cfg.phone || '01955317530'}.</div>
        <div className="rcpt-info-line">M. No, whatapp : {cfg.whatsapp || '9682329952'}.</div>
        <div className="rcpt-info-line">FSSAI Reg. No : {cfg.fssai || '21026252000118'}.</div>
      </div>

      <div className="rcpt-dashed-line"></div>

      {/* Invoice Meta */}
      <div className="rcpt-meta-grid">
        <div><strong>Invoice No. :</strong> <span>{invoice.invoiceNo}</span></div>
        <div className="text-right"><strong>Date :</strong> <span>{invoice.date}</span></div>
        <div className="rcpt-cust-meta">
          {(invoice.customerName || invoice.customerPhone) && (
            <span><strong>Cust:</strong> {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}</span>
          )}
        </div>
        <div className="text-right"><strong>Time :</strong> <span>{invoice.time}</span></div>
      </div>

      <div className="rcpt-solid-line"></div>

      {/* Items Table matching exact columns from sample */}
      <table className="rcpt-items-table">
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th className="col-item">ITEMS</th>
            <th className="col-unit">UNIT</th>
            <th className="col-qty">QTY</th>
            <th className="col-mrp">MRP</th>
            <th className="col-rate">RATE<br/><span className="sub-th">(Per Unit)</span></th>
            <th className="col-tax">TAX<br/><span className="sub-th">(Per Unit)</span></th>
            <th className="col-amt">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, idx) => (
            <tr key={idx}>
              <td className="col-num">{idx + 1}</td>
              <td className="col-item">{item.name}</td>
              <td className="col-unit">{item.unit || '1 PCS'}</td>
              <td className="col-qty">{item.qty}</td>
              <td className="col-mrp">{Number(item.mrp || item.rate || 0).toFixed(2)}</td>
              <td className="col-rate">{Number(item.rate || 0).toFixed(2)}</td>
              <td className="col-tax">{Number(item.tax || 0).toFixed(2)}</td>
              <td className="col-amt">{Number((item.qty || 1) * (item.rate || 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rcpt-solid-line"></div>

      {/* Totals Breakdown */}
      <div className="rcpt-totals-grid">
        <div className="rcpt-total-left">
          <div>Total Items : <strong>{invoice.items?.length || 0}</strong></div>
          <div>Total Quantity : <strong>{invoice.totalQty || (invoice.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0)}</strong></div>
        </div>
        <div className="rcpt-total-right">
          <div className="total-row"><span>Sub Total</span><span>:</span><span>{Number(invoice.subTotal || 0).toFixed(2)}</span></div>
          <div className="total-row"><span>Discount</span><span>:</span><span>{Number(invoice.discount || 0).toFixed(2)}</span></div>
          <div className="total-row"><span>Tax (GST 0%)</span><span>:</span><span>{Number(invoice.tax || 0).toFixed(2)}</span></div>
        </div>
      </div>

      <div className="rcpt-grand-total">
        <span>TOTAL AMOUNT :</span>
        <span>₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
      </div>

      <div className="rcpt-dashed-line"></div>

      {/* Greetings */}
      <div className="rcpt-center-text">
        <p className="rcpt-thankyou">Thank you for shopping with us!</p>
        <p className="rcpt-visitagain">Visit Again...</p>
      </div>

      {/* Bank Details */}
      <div className="rcpt-payment-box">
        <div className="rcpt-payment-badge">* For Payment *</div>
        <div className="rcpt-bank-details">
          <div className="bank-row"><span>Acct No.</span><span>:</span><strong>{cfg.bankAcct || '43749700977'}</strong></div>
          <div className="bank-row"><span>IFSC</span><span>:</span><strong>{cfg.bankIfsc || 'SBIN0003996'}</strong></div>
          <div className="bank-row"><span>NAME</span><span>:</span><strong>{cfg.bankName || 'AR DELIVERO'}</strong></div>
          <div className="bank-row"><span>Bank</span><span>:</span><strong>{cfg.bankBranch || 'SBI Handwara'}</strong></div>
        </div>
      </div>

      <div className="rcpt-dashed-line"></div>

      {/* QR Code */}
      <div className="rcpt-qr-section">
        <div className="rcpt-qr-title">
          {cfg.qrMode === 'upi' ? 'Or Use QR for Payments' : 'Scan with Mobile to Verify Official Receipt'}
        </div>
        <div className="rcpt-qr-code-box">
          <canvas ref={qrCanvasRef}></canvas>
        </div>
        <div className="rcpt-qr-name">
          {cfg.qrMode === 'upi' ? `Name : ${cfg.bankName || 'AR Delivero'}` : 'Official AR Mart Digital Stamp & Verification'}
        </div>
      </div>

      <div className="rcpt-dashed-line"></div>
      <div className="rcpt-cut-mark">✂ - - - - - - - - - - - - - - - - - - - - - - - - ✂</div>
    </div>
  );
}
