/**
 * AR Mart - Receipt Verification Portal Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawData = urlParams.get('data');
  const invParam = urlParams.get('inv');

  if (rawData) {
    try {
      const decodedJson = decodeURIComponent(escape(atob(decodeURIComponent(rawData))));
      const data = JSON.parse(decodedJson);
      renderVerificationData(data);
    } catch (e) {
      console.error('Failed to parse verification payload', e);
      renderFallback(invParam);
    }
  } else if (invParam) {
    renderFallback(invParam);
  } else {
    // Show standard demo/sample verification
    renderSample();
  }
});

function renderVerificationData(d) {
  document.getElementById('invNo').textContent = d.i || 'ARM/2025/05/26/001';
  document.getElementById('invDateTime').textContent = `${d.d || '26/05/2025'} • ${d.t || '01:35 PM'}`;
  
  if (d.s) document.getElementById('storeName').textContent = d.s;
  if (d.f) document.getElementById('storeFssai').textContent = d.f;

  // Customer info if present
  if (d.c || d.p) {
    document.getElementById('customerInfoBar').style.display = 'block';
    document.getElementById('custNameVal').textContent = d.c || 'Customer';
    document.getElementById('custPhoneVal').textContent = d.p ? `(${d.p})` : '';
  }

  // Items table
  const tbody = document.getElementById('verifyItemsBody');
  tbody.innerHTML = '';

  if (d.it && Array.isArray(d.it)) {
    d.it.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div class="item-title">${escapeHtml(item.n)}</div>
          <div class="item-unit-tag">${escapeHtml(item.u || '')}</div>
        </td>
        <td class="text-center">${item.q}</td>
        <td class="text-right">₹${Number(item.r).toFixed(2)}</td>
        <td class="text-right font-mono"><strong>₹${Number(item.a || (item.q * item.r)).toFixed(2)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Totals
  document.getElementById('vSubTotal').textContent = `₹${Number(d.st || 0).toFixed(2)}`;
  
  if (d.ds && d.ds > 0) {
    document.getElementById('rowDiscount').style.display = 'flex';
    document.getElementById('vDiscount').textContent = `-₹${Number(d.ds).toFixed(2)}`;
  }

  document.getElementById('vTax').textContent = `₹${Number(d.tx || 0).toFixed(2)}`;
  document.getElementById('vGrandTotal').textContent = `₹${Number(d.gt || 0).toFixed(2)}`;
}

function renderFallback(invoiceNo) {
  // Check localStorage if available
  const storedInvoices = localStorage.getItem('armart_invoices');
  if (storedInvoices) {
    try {
      const invoices = JSON.parse(storedInvoices);
      const found = invoices.find(x => x.invoiceNo === invoiceNo);
      if (found) {
        renderVerificationData({
          i: found.invoiceNo,
          d: found.date,
          t: found.time,
          c: found.customerName,
          p: found.customerPhone,
          it: found.items.map(x => ({ n: x.name, u: x.unit, q: x.qty, r: x.rate, a: x.qty * x.rate })),
          st: found.subTotal,
          ds: found.discount,
          tx: found.tax,
          gt: found.grandTotal,
          s: found.store?.name,
          f: found.store?.fssai
        });
        return;
      }
    } catch (e) {}
  }
  renderSample(invoiceNo);
}

function renderSample(customInv = null) {
  renderVerificationData({
    i: customInv || 'ARM/2025/05/26/001',
    d: '26/05/2025',
    t: '01:35 PM',
    c: 'Walk-in Customer',
    s: 'AR Mart',
    f: '21026252000118',
    it: [
      { n: 'Rice Basmati', u: '1 KG', q: 1, r: 110, a: 110 },
      { n: 'Atta (Wheat Flour)', u: '5 KG', q: 1, r: 199, a: 199 },
      { n: 'Sugar', u: '1 KG', q: 1, r: 45, a: 45 },
      { n: 'Cooking Oil', u: '1 L', q: 1, r: 165, a: 165 },
      { n: 'Tea (Tata)', u: '250 g', q: 1, r: 135, a: 135 },
      { n: 'Soap', u: '125 g', q: 2, r: 35, a: 70 },
      { n: 'Apples', u: '1 KG', q: 1, r: 150, a: 150 }
    ],
    st: 874.00,
    ds: 24.00,
    tx: 0.00,
    gt: 850.00
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
