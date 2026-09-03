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
      // Mobile-friendly verification certificate link (Bypasses cashier login screen)
      let baseUrl = storeConfig?.verifyBaseUrl;
      if (!baseUrl) {
        baseUrl = `${window.location.origin}/?verify=${encodeURIComponent(invoice.invoiceNo || '')}`;
      } else {
        baseUrl = `${baseUrl}?inv=${encodeURIComponent(invoice.invoiceNo || '')}`;
      }

      // Encode structured payload for instant mobile scan & verify
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
      width: isCompact || storeConfig?.paperSize === '58mm' ? 140 : 175,
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

  // Calculations & Formatting
  const totalQty = invoice.totalQty || (invoice.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const subTotal = Number(invoice.subTotal || 0);
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.grandTotal || 0);

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className={`thermal-receipt ${is58 ? 'compact-58mm size-58mm' : ''}`} id="thermalReceipt">
      {/* 1. Header: Logo, Tagline, Store Name, Address, Contact & FSSAI */}
      <div className="rcpt-header">
        <div className="rcpt-logo-wrap">
          <img 
            src="/ar-mart-logo.png" 
            alt="AR Mart" 
            className="rcpt-logo-img"
          />
        </div>
        <div className="rcpt-tagline">QUALITY | TRUST | VALUE</div>
        <h1 className="rcpt-store-name">{cfg.storeName || 'AR Mart'}</h1>
        <div className="rcpt-info-line">Address: {cfg.address || 'Braripora Handwara J&K-193221'}</div>
        <div className="rcpt-info-line">Phone : {cfg.phone || '01955317530'}.</div>
        <div className="rcpt-info-line">M. No, whatapp : {cfg.whatsapp || '9682329952'}.</div>
        <div className="rcpt-info-line">FSSAI Reg. No : {cfg.fssai || '21026252000118'}.</div>
      </div>

      {/* 2. Top Dashed Line Divider */}
      <div className="rcpt-dashed-line"></div>

      {/* 3. Invoice Meta: Invoice No on left, Date & Time on right */}
      <div className="rcpt-meta-row">
        <div className="rcpt-meta-left">
          <span>Invoice No. : </span>
          <strong>{invoice.invoiceNo}</strong>
          {(invoice.customerName || invoice.customerPhone) && (
            <div className="rcpt-meta-customer">
              <span>Cust: {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}</span>
            </div>
          )}
        </div>
        <div className="rcpt-meta-right">
          <div><span>Date : </span><strong>{invoice.date}</strong></div>
          <div><span>Time : </span><span>{invoice.time}</span></div>
        </div>
      </div>

      {/* 4. Solid Line Divider */}
      <div className="rcpt-solid-line"></div>

      {/* 5. Items Table matching exact 8 columns */}
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
          {(invoice.items || []).map((item, idx) => {
            const itemMrp = Number(item.mrp || item.rate || 0);
            const itemRate = Number(item.rate || 0);
            const itemTax = Number(item.tax || 0);
            const itemAmount = Number((item.qty || 1) * itemRate);

            return (
              <tr key={idx}>
                <td className="col-num">{idx + 1}</td>
                <td className="col-item">{item.name}</td>
                <td className="col-unit">{item.unit || '1 PCS'}</td>
                <td className="col-qty">{item.qty}</td>
                <td className="col-mrp">{itemMrp.toFixed(2)}</td>
                <td className="col-rate">{itemRate.toFixed(2)}</td>
                <td className="col-tax">{itemTax.toFixed(2)}</td>
                <td className="col-amt">{itemAmount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 6. Solid Line Divider */}
      <div className="rcpt-solid-line"></div>

      {/* 7. Totals Section (Left: Total Items, Total Qty; Right: Sub Total, Disc, Tax, TOTAL AMOUNT) */}
      <div className="rcpt-totals-section">
        <div className="rcpt-totals-left">
          <div className="totals-line">
            <span className="totals-lbl">Total Items</span>
            <span className="totals-colon">:</span>
            <span className="totals-val font-mono"><strong>{invoice.items?.length || 0}</strong></span>
          </div>
          <div className="totals-line">
            <span className="totals-lbl">Total Quantity</span>
            <span className="totals-colon">:</span>
            <span className="totals-val font-mono"><strong>{totalQty}</strong></span>
          </div>
        </div>

        <div className="rcpt-totals-right">
          <div className="totals-line">
            <span className="totals-lbl">Sub Total</span>
            <span className="totals-colon">:</span>
            <span className="totals-val font-mono">{formatMoney(subTotal)}</span>
          </div>
          <div className="totals-line">
            <span className="totals-lbl">Discount</span>
            <span className="totals-colon">:</span>
            <span className="totals-val font-mono">{formatMoney(discount)}</span>
          </div>
          <div className="totals-line">
            <span className="totals-lbl">Tax (GST 0%)</span>
            <span className="totals-colon">:</span>
            <span className="totals-val font-mono">{formatMoney(tax)}</span>
          </div>
          <div className="totals-line grand-total-line">
            <span className="totals-lbl bold">TOTAL AMOUNT</span>
            <span className="totals-colon">:</span>
            <span className="totals-val bold font-mono grand-val">₹{formatMoney(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 8. Dashed Line Divider */}
      <div className="rcpt-dashed-line"></div>

      {/* 9. Greetings */}
      <div className="rcpt-greetings">
        <p className="rcpt-thankyou">Thank you for shopping with us!</p>
        <p className="rcpt-visitagain">Visit Again...</p>
      </div>

      {/* 10. Bank Details (* For Payment *) */}
      <div className="rcpt-payment-box">
        <div className="rcpt-payment-badge">* For Payment *</div>
        <div className="rcpt-bank-table">
          <div className="bank-row">
            <span className="bank-lbl">Acct No.</span>
            <span className="bank-colon">:</span>
            <span className="bank-val font-mono">{cfg.bankAcct || '43749700977'}</span>
          </div>
          <div className="bank-row">
            <span className="bank-lbl">IFSC</span>
            <span className="bank-colon">:</span>
            <span className="bank-val font-mono">{cfg.bankIfsc || 'SBIN0003996'}</span>
          </div>
          <div className="bank-row">
            <span className="bank-lbl">NAME</span>
            <span className="bank-colon">:</span>
            <span className="bank-val">{cfg.bankName || 'AR DELIVERO'}</span>
          </div>
          <div className="bank-row">
            <span className="bank-lbl">Bank</span>
            <span className="bank-colon">:</span>
            <span className="bank-val">{cfg.bankBranch || 'SBI Handwara'}</span>
          </div>
        </div>
      </div>

      {/* 11. Dashed Line Divider */}
      <div className="rcpt-dashed-line"></div>

      {/* 12. QR Code Section (Or / Use QR for Payments / Canvas with Logo / Name : AR Delivero) */}
      <div className="rcpt-qr-section">
        <div className="rcpt-qr-title-top">Or</div>
        <div className="rcpt-qr-title-sub">Use QR for Payments</div>
        
        <div className="rcpt-qr-container">
          <canvas ref={qrCanvasRef} className="rcpt-qr-canvas"></canvas>
          <div className="rcpt-qr-center-badge">
            <span className="qr-badge-ar">AR</span>
            <span className="qr-badge-sub">DELIVERO</span>
          </div>
        </div>

        <div className="rcpt-qr-footer-name">Name : {cfg.bankName || 'AR Delivero'}</div>
      </div>

      {/* 13. Bottom Dashed Line */}
      <div className="rcpt-dashed-line"></div>
    </div>
  );
}
