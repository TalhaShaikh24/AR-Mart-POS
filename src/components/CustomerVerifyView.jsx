import React, { useState, useEffect, useRef } from 'react';
import ArMartLogo from './ArMartLogo';
import { ShieldCheck, CheckCircle2, ArrowLeft, QrCode, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

export default function CustomerVerifyView({ invoiceData, onBack, storeConfig }) {
  const [data, setData] = useState(invoiceData);
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const paymentQrRef = useRef(null);

  useEffect(() => {
    if (invoiceData) {
      setData(invoiceData);
      return;
    }

    // Check query params if accessed directly from URL / mobile browser
    const params = new URLSearchParams(window.location.search);
    const verifyData = params.get('verifyData');
    const verifyInv = params.get('verify') || params.get('inv');

    if (verifyData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(verifyData)))));
        setData({
          invoiceNo: decoded.i,
          date: decoded.d,
          time: decoded.t,
          customerName: decoded.c,
          customerPhone: decoded.p,
          customerAddress: decoded.ad || '',
          items: (decoded.it || []).map(x => ({ name: x.n, unit: x.u, qty: x.q, rate: x.r, amount: x.a })),
          subTotal: decoded.st,
          discount: decoded.ds,
          tax: decoded.tx,
          taxPercent: decoded.tp !== undefined ? decoded.tp : (decoded.tx > 0 && decoded.st > 0 ? Math.round((decoded.tx / decoded.st) * 100) : 0),
          grandTotal: decoded.gt,
          store: { 
            name: decoded.s || 'AR Mart', 
            fssai: decoded.f || '21026252000118',
            bankName: 'AR DELIVERO',
            upiId: '9682329952@upi',
            bankAcct: '43749700977',
            bankIfsc: 'SBIN0003996',
            bankBranch: 'SBI Handwara'
          }
        });
      } catch (e) {
        console.error('Failed to parse verify payload', e);
      }
    } else if (verifyInv) {
      // Fetch from API
      setLoading(true);
      fetch(`/api/verify/${encodeURIComponent(verifyInv)}`)
        .then(res => res.json())
        .then(res => {
          if (res.verified && res.invoice) {
            setData(res.invoice);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [invoiceData]);

  const invoice = data || {
    invoiceNo: 'ARM/2025/05/26/001',
    date: '26/05/2025',
    time: '01:35 PM',
    customerName: 'Walk-in Customer',
    store: { 
      name: 'AR Mart', 
      fssai: '21026252000118', 
      phone: '01955317530', 
      whatsapp: '9682329952',
      address: 'Braripora Handwara J&K-193221',
      bankName: 'AR DELIVERO',
      upiId: '9682329952@upi',
      bankAcct: '43749700977',
      bankIfsc: 'SBIN0003996',
      bankBranch: 'SBI Handwara'
    },
    items: [
      { name: 'Rice Basmati', unit: '1 KG', qty: 1, rate: 110, amount: 110 },
      { name: 'Atta (Wheat Flour)', unit: '5 KG', qty: 1, rate: 199, amount: 199 },
      { name: 'Sugar', unit: '1 KG', qty: 1, rate: 45, amount: 45 },
      { name: 'Cooking Oil', unit: '1 L', qty: 1, rate: 165, amount: 165 },
      { name: 'Tea (Tata)', unit: '250 g', qty: 1, rate: 135, amount: 135 }
    ],
    subTotal: 654.00,
    discount: 14.00,
    tax: 0.00,
    grandTotal: 640.00
  };

  // Payment Details calculation
  const upiId = invoice.store?.upiId || storeConfig?.upiId || `${invoice.store?.whatsapp || '9682329952'}@upi`;
  const payeeName = invoice.store?.bankName || storeConfig?.bankName || 'AR DELIVERO';
  const bankAcct = invoice.store?.bankAcct || storeConfig?.bankAcct || '43749700977';
  const bankIfsc = invoice.store?.bankIfsc || storeConfig?.bankIfsc || 'SBIN0003996';
  const bankBranch = invoice.store?.bankBranch || storeConfig?.bankBranch || 'SBI Handwara';
  const amountStr = Number(invoice.grandTotal || 0).toFixed(2);
  const cleanInv = String(invoice.invoiceNo || '').replace(/[^a-zA-Z0-9]/g, '_');
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountStr}&cu=INR&tn=AR_Mart_${cleanInv}`;

  // Generate UPI Payment QR Code
  useEffect(() => {
    if (!paymentQrRef.current || !invoice) return;

    QRCode.toCanvas(paymentQrRef.current, upiUri, {
      width: 175,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }).catch(err => console.error('Failed to render UPI QR', err));
  }, [upiUri, invoice]);

  const handleCopyUpi = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upiId);
    }
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  if (loading) {
    return (
      <div className="verify-loading-container">
        <div className="verify-spinner"></div>
        <p>Verifying official receipt with AR Mart servers...</p>
      </div>
    );
  }

  return (
    <div className="mobile-verify-wrapper">
      {onBack && (
        <button className="back-pos-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to POS Billing
        </button>
      )}

      <div className="mobile-verify-card">
        {/* Header */}
        <div className="mobile-verify-header">
          <ArMartLogo width={210} height={60} showTagline={true} />
          
          <div className="official-verified-badge">
            <div className="badge-icon-box">
              <CheckCircle2 size={24} />
            </div>
            <div className="badge-text-box">
              <h3>Official Receipt Verified</h3>
              <p>Authentic store purchase issued by AR Mart</p>
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="mobile-verify-body">
          <div className="v-meta-row">
            <div>
              <span className="v-label">INVOICE NO</span>
              <strong className="v-val text-brand">{invoice.invoiceNo}</strong>
            </div>
            <div className="text-right">
              <span className="v-label">DATE & TIME</span>
              <strong className="v-val">{invoice.date} • {invoice.time}</strong>
            </div>
          </div>

          <div className="v-store-box">
            <div className="v-store-title-row">
              <strong>{invoice.store?.name || 'AR Mart'}</strong>
              <span className="v-fssai">FSSAI: {invoice.store?.fssai || '21026252000118'}</span>
            </div>
            <div className="v-store-sub">Address: {invoice.store?.address || 'Braripora Handwara J&K-193221'}</div>
            <div className="v-store-sub">Support: 01955317530 • WhatsApp: 9682329952</div>
          </div>

          {(invoice.customerName || invoice.customerAddress) && (
            <div className="v-cust-bar">
              <div>Billed To: <strong>{invoice.customerName || 'Customer'}</strong> {invoice.customerPhone && `(${invoice.customerPhone})`}</div>
              {invoice.customerAddress && (
                <div style={{ marginTop: '3px', fontSize: '0.78rem', color: '#1e40af' }}>
                  Address: <strong>{invoice.customerAddress}</strong>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="v-table-wrap">
            <table className="v-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="v-col-idx">{idx + 1}</td>
                    <td>
                      <div className="v-item-name">{item.name}</div>
                      <div className="v-item-unit">{item.unit}</div>
                    </td>
                    <td className="text-center font-mono">{item.qty}</td>
                    <td className="text-right font-mono">₹{Number(item.rate).toFixed(2)}</td>
                    <td className="text-right font-mono font-bold">₹{Number(item.amount || (item.qty * item.rate)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="v-totals-box">
            <div className="v-total-row">
              <span>Sub Total</span>
              <span>₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="v-total-row discount">
                <span>Discount</span>
                <span>-₹{Number(invoice.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="v-total-row">
              <span>Tax (GST {invoice.taxPercent !== undefined ? invoice.taxPercent : (invoice.tax > 0 && invoice.subTotal > 0 ? Math.round((invoice.tax / invoice.subTotal) * 100) : 0)}%)</span>
              <span>₹{Number(invoice.tax || 0).toFixed(2)}</span>
            </div>
            <div className="v-divider"></div>
            <div className="v-grand-row">
              <span>TOTAL PAID</span>
              <span className="v-grand-amt">₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Direct Payment QR & 1-Tap UPI Pay */}
          <div className="v-payment-card">
            <div className="v-payment-header">
              <div className="v-payment-title-box">
                <QrCode size={19} className="v-pay-icon" />
                <div>
                  <h4 className="v-pay-title">Direct Payment via UPI / QR</h4>
                  <p className="v-pay-subtitle">Scan QR or tap to pay directly with any UPI app</p>
                </div>
              </div>
              <span className="v-pay-badge-instant">⚡ Instant Pay</span>
            </div>

            <div className="v-payment-body">
              {/* QR Container with AR DELIVERO Center Badge */}
              <div className="v-qr-canvas-box">
                <canvas ref={paymentQrRef} className="v-pay-qr-canvas"></canvas>
                <div className="v-qr-center-chip">
                  <span className="v-chip-main">AR</span>
                  <span className="v-chip-sub">DELIVERO</span>
                </div>
              </div>

              {/* Payee Info */}
              <div className="v-pay-meta">
                <div className="v-pay-meta-row">
                  <span className="v-pay-lbl">Payee:</span>
                  <strong className="v-pay-val">{payeeName}</strong>
                </div>

                <div className="v-pay-meta-row">
                  <span className="v-pay-lbl">UPI ID:</span>
                  <div className="v-upi-copy-wrap">
                    <span className="v-upi-text font-mono">{upiId}</span>
                    <button 
                      type="button" 
                      className="v-copy-btn" 
                      onClick={handleCopyUpi} 
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="v-pay-meta-row">
                  <span className="v-pay-lbl">Amount:</span>
                  <strong className="v-pay-amt font-mono">₹{amountStr}</strong>
                </div>

                <div className="v-pay-bank-line">
                  <span>Bank: <strong>{bankBranch}</strong></span>
                  <span>A/C: <strong>{bankAcct}</strong> • IFSC: <strong>{bankIfsc}</strong></span>
                </div>
              </div>
            </div>

            {/* Mobile 1-Tap Payment Link */}
            <a 
              href={upiUri} 
              className="v-direct-pay-button"
            >
              <div className="v-btn-top">
                <span>⚡ Pay ₹{amountStr} via UPI App</span>
              </div>
              <div className="v-btn-sub">
                Opens Google Pay, PhonePe, Paytm, BHIM or any UPI app
              </div>
            </a>
          </div>

          {/* Security Seal */}
          <div className="v-security-seal">
            <ShieldCheck size={28} className="shield-icon" />
            <div>
              <strong>Digitally Authenticated Certificate</strong>
              <p>Confirmed genuine transaction recorded in AR Mart POS database.</p>
            </div>
          </div>
        </div>

        <div className="mobile-verify-footer">
          <p>AR Mart Handwara • Fast. Fresh. Reliable</p>
        </div>
      </div>
    </div>
  );
}
