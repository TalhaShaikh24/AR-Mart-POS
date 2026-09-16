import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function ThermalReceipt({ invoice, storeConfig, isCompact = false }) {
  const verifyQrCanvasRef = useRef(null);
  const paymentQrCanvasRef = useRef(null);

  useEffect(() => {
    if (!invoice) return;

    // 1. Generate Top Compact Scan-to-Verify QR Code (Customer Digital Authenticity)
    if (verifyQrCanvasRef.current) {
      let baseUrl = storeConfig?.verifyBaseUrl;
      if (!baseUrl) {
        baseUrl = `${window.location.origin}/?verify=${encodeURIComponent(invoice.invoiceNo || '')}`;
      } else {
        baseUrl = `${baseUrl}?inv=${encodeURIComponent(invoice.invoiceNo || '')}`;
      }

      const compactData = {
        i: invoice.invoiceNo,
        d: invoice.date,
        t: invoice.time,
        c: invoice.customerName,
        p: invoice.customerPhone,
        ad: invoice.customerAddress || '',
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
        tp: invoice.taxPercent !== undefined ? Number(invoice.taxPercent) : (Number(invoice.tax || 0) > 0 && Number(invoice.subTotal || 0) > 0 ? Math.round((Number(invoice.tax) / Number(invoice.subTotal)) * 100) : 0),
        gt: Number(invoice.grandTotal || 0),
        s: storeConfig?.storeName || 'AR Mart',
        f: storeConfig?.fssai || '21026252000118'
      };

      let verifyPayload = baseUrl;
      try {
        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(compactData)))));
        verifyPayload = `${window.location.origin}/?verifyData=${encoded}`;
      } catch (err) {
        verifyPayload = baseUrl;
      }

      QRCode.toCanvas(verifyQrCanvasRef.current, verifyPayload, {
        width: isCompact || storeConfig?.paperSize === '58mm' ? 80 : 92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch(err => console.error('Verify QR Render error', err));
    }

    // 2. Generate Bottom Direct UPI Payment QR Code
    if (paymentQrCanvasRef.current) {
      const upiId = storeConfig?.upiId || `${storeConfig?.whatsapp || '9682329952'}@upi`;
      const payeeName = storeConfig?.bankName || 'AR DELIVERO';
      const amountVal = Number(invoice.grandTotal || 0).toFixed(2);
      const cleanInv = String(invoice.invoiceNo || '').replace(/[^a-zA-Z0-9]/g, '_');
      const paymentPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountVal}&cu=INR&tn=AR_Mart_${cleanInv}`;

      QRCode.toCanvas(paymentQrCanvasRef.current, paymentPayload, {
        width: isCompact || storeConfig?.paperSize === '58mm' ? 140 : 175,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch(err => console.error('Payment QR Render error', err));
    }
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

      {/* Top Compact Scan to Verify Bill QR */}
      <div className="rcpt-top-verify-box">
        <div className="rcpt-top-verify-title">★ SCAN TO VERIFY BILL ★</div>
        <div className="rcpt-top-verify-qr-wrap">
          <canvas ref={verifyQrCanvasRef} className="rcpt-top-verify-canvas"></canvas>
        </div>
        <div className="rcpt-top-verify-sub">Official Digital Authenticity Certificate</div>
      </div>

      <div className="rcpt-dashed-line"></div>

      {/* 3. Invoice Meta: Invoice No on left, Date & Time on right */}
      <div className="rcpt-meta-row">
        <div className="rcpt-meta-left">
          <div className="rcpt-inv-line">
            <span>Invoice No. : </span>
            <strong>{invoice.invoiceNo}</strong>
          </div>
          {(invoice.customerName || invoice.customerPhone || invoice.customerAddress) && (
            <div className="rcpt-meta-customer">
              <div>
                <span>Cust : </span>
                <strong>{invoice.customerName}</strong>
                {invoice.customerPhone ? ` (${invoice.customerPhone})` : ''}
              </div>
              {invoice.customerAddress && (
                <div className="rcpt-cust-addr-line">
                  <span>Address : </span>
                  <span>{invoice.customerAddress}</span>
                </div>
              )}
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
            <span className="totals-lbl">
              Tax (GST {invoice.taxPercent !== undefined ? invoice.taxPercent : (tax > 0 && subTotal > 0 ? Math.round((tax / subTotal) * 100) : 0)}%)
            </span>
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
          <canvas ref={paymentQrCanvasRef} className="rcpt-qr-canvas"></canvas>
          <div className="rcpt-qr-center-badge">
            <span className="qr-badge-ar">AR</span>
            <span className="qr-badge-sub">DELIVERO</span>
          </div>
        </div>

        <div className="rcpt-qr-footer-name">Name : {cfg.bankName || 'AR Delivero'}</div>
        <div className="rcpt-qr-footer-upi" style={{ fontSize: '0.74rem', fontWeight: '700', marginTop: '1px', color: '#111827' }}>
          UPI: {cfg.upiId || `${cfg.whatsapp || '9682329952'}@upi`}
        </div>
        <div className="rcpt-qr-footer-apps" style={{ fontSize: '0.62rem', color: '#4b5563', marginTop: '1px' }}>
          Scan to Pay (GPay / PhonePe / Paytm)
        </div>
      </div>

      {/* 13. Bottom Dashed Line */}
      <div className="rcpt-dashed-line"></div>
    </div>
  );
}
