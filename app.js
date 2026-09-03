/**
 * AR Mart POS - Core Application Logic
 */

// Default product catalog based on AR Mart supermarket inventory
const DEFAULT_PRODUCTS = [
  { id: 'ARM001', name: 'Rice Basmati', category: 'Grains & Flours', unit: '1 KG', mrp: 110, rate: 110, tax: 0, barcode: '8901001' },
  { id: 'ARM002', name: 'Atta (Wheat Flour)', category: 'Grains & Flours', unit: '5 KG', mrp: 199, rate: 199, tax: 0, barcode: '8901002' },
  { id: 'ARM003', name: 'Sugar', category: 'Grains & Flours', unit: '1 KG', mrp: 45, rate: 45, tax: 0, barcode: '8901003' },
  { id: 'ARM004', name: 'Dal Chana', category: 'Grains & Flours', unit: '1 KG', mrp: 110, rate: 110, tax: 0, barcode: '8901004' },
  { id: 'ARM005', name: 'Cooking Oil', category: 'Oils & Ghee', unit: '1 L', mrp: 165, rate: 165, tax: 0, barcode: '8901005' },
  { id: 'ARM006', name: 'Milk', category: 'Dairy & Beverages', unit: '1 L', mrp: 70, rate: 70, tax: 0, barcode: '8901006' },
  { id: 'ARM007', name: 'Tea (Tata)', category: 'Dairy & Beverages', unit: '250 g', mrp: 135, rate: 135, tax: 0, barcode: '8901007' },
  { id: 'ARM008', name: 'Salt', category: 'Spices & Salt', unit: '1 KG', mrp: 20, rate: 20, tax: 0, barcode: '8901008' },
  { id: 'ARM009', name: 'Turmeric Powder', category: 'Spices & Salt', unit: '100 g', mrp: 25, rate: 25, tax: 0, barcode: '8901009' },
  { id: 'ARM010', name: 'Red Chili Powder', category: 'Spices & Salt', unit: '100 g', mrp: 25, rate: 25, tax: 0, barcode: '8901010' },
  { id: 'ARM011', name: 'Soap', category: 'Personal Care', unit: '125 g', mrp: 35, rate: 35, tax: 0, barcode: '8901011' },
  { id: 'ARM012', name: 'Shampoo', category: 'Personal Care', unit: '180 ml', mrp: 120, rate: 120, tax: 0, barcode: '8901012' },
  { id: 'ARM013', name: 'Toothpaste', category: 'Personal Care', unit: '100 g', mrp: 90, rate: 90, tax: 0, barcode: '8901013' },
  { id: 'ARM014', name: 'Biscuits', category: 'Snacks & Bakery', unit: '200 g', mrp: 60, rate: 60, tax: 0, barcode: '8901014' },
  { id: 'ARM015', name: 'Cold Drink', category: 'Dairy & Beverages', unit: '500 ml', mrp: 60, rate: 60, tax: 0, barcode: '8901015' },
  { id: 'ARM016', name: 'Bread', category: 'Snacks & Bakery', unit: '400 g', mrp: 45, rate: 45, tax: 0, barcode: '8901016' },
  { id: 'ARM017', name: 'Eggs (Pack of 6)', category: 'Dairy & Beverages', unit: '6 PCS', mrp: 78, rate: 78, tax: 0, barcode: '8901017' },
  { id: 'ARM018', name: 'Bananas', category: 'Fruits & Fresh', unit: '1 KG', mrp: 60, rate: 60, tax: 0, barcode: '8901018' },
  { id: 'ARM019', name: 'Apples', category: 'Fruits & Fresh', unit: '1 KG', mrp: 150, rate: 150, tax: 0, barcode: '8901019' },
  { id: 'ARM020', name: 'Detergent Powder', category: 'Personal Care', unit: '1 KG', mrp: 125, rate: 125, tax: 0, barcode: '8901020' },
  { id: 'ARM021', name: 'Mustard Oil', category: 'Oils & Ghee', unit: '1 L', mrp: 155, rate: 155, tax: 0, barcode: '8901021' },
  { id: 'ARM022', name: 'Moong Dal', category: 'Grains & Flours', unit: '1 KG', mrp: 130, rate: 130, tax: 0, barcode: '8901022' }
];

// Default Store Configuration
const DEFAULT_STORE_CONFIG = {
  storeName: 'AR Mart',
  address: 'Braripora Handwara J&K-193221',
  phone: '01955317530',
  whatsapp: '9682329952',
  fssai: '21026252000118',
  bankAcct: '43749700977',
  bankIfsc: 'SBIN0003996',
  bankName: 'AR DELIVERO',
  bankBranch: 'SBI Handwara',
  paperSize: '80mm',
  qrMode: 'verify', // 'verify', 'upi', 'offline'
  verifyBaseUrl: ''
};

// Application State
let appState = {
  products: [],
  cart: [],
  storeConfig: { ...DEFAULT_STORE_CONFIG },
  invoices: [],
  currentInvoiceNumber: '',
  activeCategory: 'all',
  searchQuery: '',
  selectedPayment: 'CASH',
  discount: 0
};

// Initialize POS on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initClock();
  initEventListeners();
  renderCategories();
  renderProducts();
  generateNewInvoiceNumber();
  renderCart();
  updateThermalSettingsUI();
});

// Load / Initialize LocalStorage
function initStorage() {
  const storedProducts = localStorage.getItem('armart_products');
  appState.products = storedProducts ? JSON.parse(storedProducts) : [...DEFAULT_PRODUCTS];

  const storedConfig = localStorage.getItem('armart_config');
  if (storedConfig) {
    appState.storeConfig = { ...DEFAULT_STORE_CONFIG, ...JSON.parse(storedConfig) };
  }

  const storedInvoices = localStorage.getItem('armart_invoices');
  appState.invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
}

function saveProducts() {
  localStorage.setItem('armart_products', JSON.stringify(appState.products));
}

function saveStoreConfig() {
  localStorage.setItem('armart_config', JSON.stringify(appState.storeConfig));
}

function saveInvoices() {
  localStorage.setItem('armart_invoices', JSON.stringify(appState.invoices));
}

// Live Clock
function initClock() {
  const clockEl = document.getElementById('liveClock');
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// Generate Invoice Number ARM/YYYY/MM/DD/001
function generateNewInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Count invoices created today
  const todayPrefix = `ARM/${year}/${month}/${day}/`;
  const todayInvoices = appState.invoices.filter(inv => inv.invoiceNo && inv.invoiceNo.startsWith(todayPrefix));
  const nextSeq = String(todayInvoices.length + 1).padStart(3, '0');

  appState.currentInvoiceNumber = `${todayPrefix}${nextSeq}`;
  document.getElementById('currentInvoiceNo').textContent = appState.currentInvoiceNumber;
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  const filtered = appState.products.filter(p => {
    const matchCategory = appState.activeCategory === 'all' || p.category === appState.activeCategory;
    const matchSearch = !appState.searchQuery || 
      p.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) || 
      (p.barcode && p.barcode.includes(appState.searchQuery));
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #94a3b8;">No products found matching "${appState.searchQuery}"</div>`;
    return;
  }

  filtered.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div>
        <div class="prod-category-badge">${prod.category}</div>
        <div class="prod-name">${escapeHtml(prod.name)}</div>
        <div class="prod-unit">${escapeHtml(prod.unit)}</div>
      </div>
      <div class="prod-pricing">
        <span class="prod-rate">₹${Number(prod.rate).toFixed(2)}</span>
        ${prod.mrp > prod.rate ? `<span class="prod-mrp">₹${Number(prod.mrp).toFixed(2)}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => addToCart(prod));
    grid.appendChild(card);
  });
}

// Categories Filter Bar
function renderCategories() {
  const catButtons = document.querySelectorAll('.cat-pill');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

// Add Item to Cart
function addToCart(product, quantity = 1) {
  const existing = appState.cart.find(item => item.id === product.id && item.unit === product.unit);
  if (existing) {
    existing.qty = Math.round((existing.qty + quantity) * 100) / 100;
  } else {
    appState.cart.push({
      id: product.id,
      name: product.name,
      category: product.category || 'General',
      unit: product.unit || '1 PCS',
      mrp: Number(product.mrp || product.rate),
      rate: Number(product.rate),
      tax: Number(product.tax || 0),
      qty: quantity
    });
  }
  renderCart();
}

// Remove from Cart
function removeFromCart(index) {
  appState.cart.splice(index, 1);
  renderCart();
}

// Update Cart Item Quantity
function updateCartQty(index, newQty) {
  const val = parseFloat(newQty);
  if (isNaN(val) || val <= 0) {
    removeFromCart(index);
    return;
  }
  appState.cart[index].qty = Math.round(val * 100) / 100;
  renderCart();
}

// Render Cart Table & Totals
function renderCart() {
  const tbody = document.getElementById('cartTableBody');
  const emptyState = document.getElementById('emptyCartState');
  const table = document.getElementById('cartTable');
  
  tbody.innerHTML = '';

  if (appState.cart.length === 0) {
    emptyState.style.display = 'flex';
    table.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    table.style.display = 'table';
  }

  let totalItemsCount = appState.cart.length;
  let totalQty = 0;
  let subTotal = 0;
  let totalTax = 0;

  appState.cart.forEach((item, index) => {
    const amount = item.qty * item.rate;
    totalQty += item.qty;
    subTotal += amount;
    totalTax += (item.qty * item.tax);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-cat">${escapeHtml(item.category)}</div>
      </td>
      <td><span style="font-size:0.75rem; color:#64748b;">${escapeHtml(item.unit)}</span></td>
      <td>
        <div class="qty-control">
          <button class="qty-btn dec-btn" data-index="${index}">-</button>
          <input type="number" class="qty-input" value="${item.qty}" min="0.1" step="any" data-index="${index}">
          <button class="qty-btn inc-btn" data-index="${index}">+</button>
        </div>
      </td>
      <td class="rate-cell">₹${item.rate.toFixed(2)}</td>
      <td class="amt-cell">₹${amount.toFixed(2)}</td>
      <td>
        <button class="remove-item-btn" data-index="${index}" title="Remove">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Calculate totals with discount
  const discountInput = document.getElementById('billDiscountInput');
  const discountVal = parseFloat(discountInput.value) || 0;
  const grandTotal = Math.max(0, subTotal - discountVal + totalTax);

  document.getElementById('summaryItemsQty').textContent = `${totalItemsCount} Items (${Math.round(totalQty * 100) / 100} Qty)`;
  document.getElementById('summarySubTotal').textContent = `₹${subTotal.toFixed(2)}`;
  document.getElementById('summaryTax').textContent = `₹${totalTax.toFixed(2)}`;
  document.getElementById('summaryGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;

  // Attach dynamic event listeners for cart rows
  tbody.querySelectorAll('.dec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      updateCartQty(idx, appState.cart[idx].qty - 1);
    });
  });

  tbody.querySelectorAll('.inc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      updateCartQty(idx, appState.cart[idx].qty + 1);
    });
  });

  tbody.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      updateCartQty(idx, e.target.value);
    });
  });

  tbody.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      removeFromCart(idx);
    });
  });
}

// Clear Cart
function clearCart() {
  if (appState.cart.length > 0 && !confirm('Are you sure you want to clear the current bill?')) {
    return;
  }
  appState.cart = [];
  document.getElementById('customerName').value = '';
  document.getElementById('customerPhone').value = '';
  document.getElementById('billDiscountInput').value = '0';
  renderCart();
  generateNewInvoiceNumber();
}

// Populate and Build Thermal Receipt Structure
function prepareReceiptData(customInvoice = null) {
  const invoice = customInvoice || buildCurrentInvoiceObject();
  const cfg = appState.storeConfig;

  // Header Details
  document.getElementById('rcptStoreName').textContent = cfg.storeName;
  document.getElementById('rcptAddress').textContent = `Address: ${cfg.address}`;
  document.getElementById('rcptPhone').textContent = `Phone : ${cfg.phone}.`;
  document.getElementById('rcptWhatsapp').textContent = `M. No, whatapp : ${cfg.whatsapp}.`;
  document.getElementById('rcptFssai').textContent = `FSSAI Reg. No : ${cfg.fssai}.`;

  // Invoice & Customer Meta
  document.getElementById('rcptInvoiceNo').textContent = invoice.invoiceNo;
  document.getElementById('rcptDate').textContent = invoice.date;
  document.getElementById('rcptTime').textContent = invoice.time;

  const custMetaEl = document.getElementById('rcptCustMeta');
  if (invoice.customerName || invoice.customerPhone) {
    custMetaEl.innerHTML = `<strong>Cust:</strong> ${escapeHtml(invoice.customerName || '')} ${invoice.customerPhone ? '(' + escapeHtml(invoice.customerPhone) + ')' : ''}`;
  } else {
    custMetaEl.innerHTML = '';
  }

  // Items Table Rows
  const itemsBody = document.getElementById('rcptItemsBody');
  itemsBody.innerHTML = '';

  invoice.items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-num">${index + 1}</td>
      <td class="col-item">${escapeHtml(item.name)}</td>
      <td class="col-unit">${escapeHtml(item.unit)}</td>
      <td class="col-qty">${item.qty}</td>
      <td class="col-mrp">${Number(item.mrp || item.rate).toFixed(2)}</td>
      <td class="col-rate">${Number(item.rate).toFixed(2)}</td>
      <td class="col-tax">${Number(item.tax || 0).toFixed(2)}</td>
      <td class="col-amt">${(item.qty * item.rate).toFixed(2)}</td>
    `;
    itemsBody.appendChild(tr);
  });

  // Totals Breakdown
  document.getElementById('rcptTotalItems').textContent = invoice.items.length;
  document.getElementById('rcptTotalQty').textContent = invoice.totalQty;
  document.getElementById('rcptSubTotal').textContent = invoice.subTotal.toFixed(2);
  document.getElementById('rcptDiscount').textContent = invoice.discount.toFixed(2);
  document.getElementById('rcptTax').textContent = invoice.tax.toFixed(2);
  document.getElementById('rcptGrandTotal').textContent = `₹${invoice.grandTotal.toFixed(2)}`;

  // Bank Info
  document.getElementById('rcptBankAcct').textContent = cfg.bankAcct;
  document.getElementById('rcptBankIfsc').textContent = cfg.bankIfsc;
  document.getElementById('rcptBankName').textContent = cfg.bankName;
  document.getElementById('rcptBankBranch').textContent = cfg.bankBranch;

  // Paper width class
  const receiptEl = document.getElementById('thermalReceipt');
  if (cfg.paperSize === '58mm') {
    receiptEl.classList.add('compact-58mm');
  } else {
    receiptEl.classList.remove('compact-58mm');
  }

  // Generate Dynamic QR Code
  generateReceiptQR(invoice);

  return invoice;
}

// Build Current Invoice Object
function buildCurrentInvoiceObject() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  let totalQty = 0;
  let subTotal = 0;
  let totalTax = 0;

  appState.cart.forEach(item => {
    totalQty += item.qty;
    subTotal += (item.qty * item.rate);
    totalTax += (item.qty * (item.tax || 0));
  });

  const discount = parseFloat(document.getElementById('billDiscountInput').value) || 0;
  const grandTotal = Math.max(0, subTotal - discount + totalTax);

  return {
    invoiceNo: appState.currentInvoiceNumber,
    date: dateStr,
    time: timeStr,
    timestamp: now.toISOString(),
    customerName: document.getElementById('customerName').value.trim(),
    customerPhone: document.getElementById('customerPhone').value.trim(),
    items: JSON.parse(JSON.stringify(appState.cart)),
    totalQty: Math.round(totalQty * 100) / 100,
    subTotal: subTotal,
    discount: discount,
    tax: totalTax,
    grandTotal: grandTotal,
    paymentMethod: appState.selectedPayment,
    store: {
      name: appState.storeConfig.storeName,
      address: appState.storeConfig.address,
      phone: appState.storeConfig.phone,
      whatsapp: appState.storeConfig.whatsapp,
      fssai: appState.storeConfig.fssai
    }
  };
}

// Generate QR Code for Receipt
function generateReceiptQR(invoice) {
  const container = document.getElementById('rcptQrCodeContainer');
  const titleEl = document.getElementById('rcptQrTitle');
  const subLabelEl = document.getElementById('rcptQrSubLabel');
  container.innerHTML = '';

  let qrPayload = '';
  const mode = appState.storeConfig.qrMode;

  if (mode === 'upi') {
    titleEl.textContent = 'Or Use QR for Payments';
    subLabelEl.textContent = `Name : ${appState.storeConfig.bankName}`;
    // Generate UPI Payment URI
    const upiId = appState.storeConfig.whatsapp + '@upi'; // Standard UPI ID or custom
    qrPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(appState.storeConfig.bankName)}&am=${invoice.grandTotal.toFixed(2)}&cu=INR&tn=AR_Mart_Bill_${invoice.invoiceNo.replace(/\//g, '_')}`;
  } else if (mode === 'offline') {
    titleEl.textContent = 'Official AR Mart Receipt QR';
    subLabelEl.textContent = `Invoice: ${invoice.invoiceNo}`;
    // Compact Offline Payload
    qrPayload = `AR MART OFFICIAL RECEIPT\nInv: ${invoice.invoiceNo}\nDate: ${invoice.date} ${invoice.time}\nItems: ${invoice.items.length} (Qty: ${invoice.totalQty})\nTotal: ₹${invoice.grandTotal.toFixed(2)}\nFSSAI: ${appState.storeConfig.fssai}\nVerified Authentic`;
  } else {
    // Standard Verification Link (Directly scan with Phone camera -> Opens verify.html)
    titleEl.textContent = 'Scan with Phone to Verify Official Receipt';
    subLabelEl.textContent = 'AR Mart Digital Stamp & Verification';

    // Base URL resolution
    let baseUrl = appState.storeConfig.verifyBaseUrl;
    if (!baseUrl) {
      const currentUrl = window.location.href.split('?')[0].split('#')[0];
      baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + 'verify.html';
    }

    // Encode verification payload
    const compactData = {
      i: invoice.invoiceNo,
      d: invoice.date,
      t: invoice.time,
      c: invoice.customerName || undefined,
      p: invoice.customerPhone || undefined,
      it: invoice.items.map(x => ({ n: x.name, u: x.unit, q: x.qty, r: x.rate, a: x.qty * x.rate })),
      st: invoice.subTotal,
      ds: invoice.discount,
      tx: invoice.tax,
      gt: invoice.grandTotal,
      s: invoice.store.name,
      f: invoice.store.fssai
    };

    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(compactData)))));
    qrPayload = `${baseUrl}?data=${encoded}`;
  }

  // Render QR Code canvas
  new QRCode(container, {
    text: qrPayload,
    width: 140,
    height: 140,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

// Print Receipt Trigger
function printThermalReceipt() {
  if (appState.cart.length === 0) {
    alert('Cannot print an empty bill. Please add products to cart.');
    return;
  }

  const invoice = prepareReceiptData();

  // Save invoice to history
  appState.invoices.unshift(invoice);
  saveInvoices();

  // Trigger browser print dialog (Thermal CSS applies automatically)
  window.print();

  // Reset bill for next customer
  setTimeout(() => {
    appState.cart = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('billDiscountInput').value = '0';
    renderCart();
    generateNewInvoiceNumber();
  }, 1000);
}

// Preview Receipt in Modal
function previewReceipt() {
  if (appState.cart.length === 0) {
    alert('Please add products to cart to preview the receipt.');
    return;
  }
  prepareReceiptData();
  const receiptClone = document.getElementById('thermalReceipt').cloneNode(true);
  const container = document.getElementById('previewModalContent');
  container.innerHTML = '';
  container.appendChild(receiptClone);
  openModal('previewModal');
}

// Initialize all UI Event Listeners & Shortcuts
function initEventListeners() {
  // Product Search
  const searchInput = document.getElementById('productSearch');
  const clearSearchBtn = document.getElementById('btnClearSearch');

  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value.trim();
    clearSearchBtn.style.display = appState.searchQuery ? 'block' : 'none';
    
    // Check for exact barcode scan match
    const exactBarcodeMatch = appState.products.find(p => p.barcode && p.barcode === appState.searchQuery);
    if (exactBarcodeMatch) {
      addToCart(exactBarcodeMatch);
      searchInput.value = '';
      appState.searchQuery = '';
      clearSearchBtn.style.display = 'none';
    }
    renderProducts();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderProducts();
    searchInput.focus();
  });

  // Discount Input Change
  document.getElementById('billDiscountInput').addEventListener('input', () => {
    renderCart();
  });

  // Payment Radio Toggle
  document.querySelectorAll('.pay-radio').forEach(radio => {
    radio.addEventListener('click', () => {
      document.querySelectorAll('.pay-radio').forEach(r => r.classList.remove('active'));
      radio.classList.add('active');
      appState.selectedPayment = radio.querySelector('input').value;
    });
  });

  // Clear Cart Button
  document.getElementById('btnClearCart').addEventListener('click', clearCart);

  // Print & Preview Buttons
  document.getElementById('btnPrintReceipt').addEventListener('click', printThermalReceipt);
  document.getElementById('btnPreviewReceipt').addEventListener('click', previewReceipt);
  document.getElementById('btnPrintFromPreview').addEventListener('click', () => {
    closeModal('previewModal');
    printThermalReceipt();
  });
  document.getElementById('btnClosePreview').addEventListener('click', () => closeModal('previewModal'));

  // Top Nav Modal Triggers
  document.getElementById('btnHistory').addEventListener('click', openHistoryModal);
  document.getElementById('btnVerifyModal').addEventListener('click', () => openModal('verifyModal'));
  document.getElementById('btnManageProducts').addEventListener('click', openProductsModal);
  document.getElementById('btnSettings').addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('btnCustomItem').addEventListener('click', () => openModal('customItemModal'));

  // Close Modals
  document.getElementById('btnCloseVerifyModal').addEventListener('click', () => closeModal('verifyModal'));
  document.getElementById('btnCloseHistoryModal').addEventListener('click', () => closeModal('historyModal'));
  document.getElementById('btnCloseProductsModal').addEventListener('click', () => closeModal('productsModal'));
  document.getElementById('btnCloseSettingsModal').addEventListener('click', () => closeModal('settingsModal'));
  document.getElementById('btnCloseCustomItemModal').addEventListener('click', () => closeModal('customItemModal'));

  // Run Verification Search
  document.getElementById('btnRunVerification').addEventListener('click', runManualVerification);
  document.getElementById('verifyInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runManualVerification();
  });

  // Add Custom Item Form
  document.getElementById('customItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('customItemName').value.trim();
    const unit = document.getElementById('customItemUnit').value.trim();
    const qty = parseFloat(document.getElementById('customItemQty').value) || 1;
    const rate = parseFloat(document.getElementById('customItemRate').value) || 0;
    const mrp = parseFloat(document.getElementById('customItemMrp').value) || rate;

    if (!name || rate <= 0) {
      alert('Please enter a valid item name and rate.');
      return;
    }

    addToCart({
      id: 'CUSTOM_' + Date.now(),
      name: name,
      category: 'General',
      unit: unit,
      mrp: mrp,
      rate: rate,
      tax: 0
    }, qty);

    document.getElementById('customItemForm').reset();
    closeModal('customItemModal');
  });

  // Add Product Form in Management Modal
  document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
      id: 'ARM' + String(appState.products.length + 1).padStart(3, '0'),
      name: document.getElementById('prodName').value.trim(),
      category: document.getElementById('prodCategory').value,
      unit: document.getElementById('prodUnit').value.trim(),
      mrp: parseFloat(document.getElementById('prodMrp').value) || 0,
      rate: parseFloat(document.getElementById('prodRate').value) || 0,
      barcode: document.getElementById('prodBarcode').value.trim(),
      tax: 0
    };

    appState.products.unshift(newProduct);
    saveProducts();
    renderProducts();
    renderProductsTable();
    document.getElementById('addProductForm').reset();
  });

  // Save Settings Form
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    appState.storeConfig.storeName = document.getElementById('setStoreName').value.trim();
    appState.storeConfig.address = document.getElementById('setAddress').value.trim();
    appState.storeConfig.phone = document.getElementById('setPhone').value.trim();
    appState.storeConfig.whatsapp = document.getElementById('setWhatsapp').value.trim();
    appState.storeConfig.fssai = document.getElementById('setFssai').value.trim();
    appState.storeConfig.bankAcct = document.getElementById('setBankAcct').value.trim();
    appState.storeConfig.bankIfsc = document.getElementById('setBankIfsc').value.trim();
    appState.storeConfig.bankName = document.getElementById('setBankName').value.trim();
    appState.storeConfig.bankBranch = document.getElementById('setBankBranch').value.trim();
    appState.storeConfig.paperSize = document.getElementById('setPaperSize').value;
    appState.storeConfig.qrMode = document.getElementById('setQrMode').value;
    appState.storeConfig.verifyBaseUrl = document.getElementById('setVerifyBaseUrl').value.trim();

    saveStoreConfig();
    closeModal('settingsModal');
    alert('Store and thermal settings saved successfully!');
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If inside an input modal, don't trigger general shortcuts except Escape
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      return;
    }

    // F2 -> Search Focus
    if (e.key === 'F2') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }

    // Space or F8 -> Quick Checkout (when not typing in an input)
    if ((e.code === 'Space' || e.key === 'F8') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      printThermalReceipt();
    }
  });
}

// Modal Helpers
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Update Settings Inputs
function updateThermalSettingsUI() {
  const cfg = appState.storeConfig;
  document.getElementById('setStoreName').value = cfg.storeName;
  document.getElementById('setAddress').value = cfg.address;
  document.getElementById('setPhone').value = cfg.phone;
  document.getElementById('setWhatsapp').value = cfg.whatsapp;
  document.getElementById('setFssai').value = cfg.fssai;
  document.getElementById('setBankAcct').value = cfg.bankAcct;
  document.getElementById('setBankIfsc').value = cfg.bankIfsc;
  document.getElementById('setBankName').value = cfg.bankName;
  document.getElementById('setBankBranch').value = cfg.bankBranch;
  document.getElementById('setPaperSize').value = cfg.paperSize;
  document.getElementById('setQrMode').value = cfg.qrMode;
  document.getElementById('setVerifyBaseUrl').value = cfg.verifyBaseUrl || '';
}

// Open History Modal
function openHistoryModal() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '';

  let totalRev = 0;
  appState.invoices.forEach(inv => {
    totalRev += Number(inv.grandTotal || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(inv.invoiceNo)}</strong></td>
      <td>${inv.date} ${inv.time}</td>
      <td>${escapeHtml(inv.customerName || 'Walk-in')}</td>
      <td>${inv.items.length} items (${inv.totalQty} qty)</td>
      <td><strong>₹${Number(inv.grandTotal).toFixed(2)}</strong></td>
      <td>
        <button class="tbl-action-btn" onclick="reprintInvoice('${escapeHtml(inv.invoiceNo)}')">Reprint</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('statTotalBills').textContent = appState.invoices.length;
  document.getElementById('statTotalRevenue').textContent = `₹${totalRev.toFixed(2)}`;
  openModal('historyModal');
}

// Reprint Past Invoice
window.reprintInvoice = function(invoiceNo) {
  const found = appState.invoices.find(inv => inv.invoiceNo === invoiceNo);
  if (found) {
    closeModal('historyModal');
    prepareReceiptData(found);
    window.print();
  }
};

// Open Products Management Modal
function openProductsModal() {
  renderProductsTable();
  openModal('productsModal');
}

function renderProductsTable() {
  const tbody = document.getElementById('manageProductsTableBody');
  tbody.innerHTML = '';

  appState.products.forEach((prod, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(prod.name)}</strong></td>
      <td>${escapeHtml(prod.category)}</td>
      <td>${escapeHtml(prod.unit)}</td>
      <td>₹${Number(prod.mrp).toFixed(2)}</td>
      <td>₹${Number(prod.rate).toFixed(2)}</td>
      <td>
        <button class="tbl-action-btn danger" onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteProduct = function(index) {
  if (confirm('Delete this product from inventory?')) {
    appState.products.splice(index, 1);
    saveProducts();
    renderProducts();
    renderProductsTable();
  }
};

// Manual Verification Search
function runManualVerification() {
  const input = document.getElementById('verifyInput').value.trim();
  const card = document.getElementById('verifyResultCard');
  if (!input) return;

  const invoice = appState.invoices.find(inv => inv.invoiceNo.toLowerCase() === input.toLowerCase());

  if (invoice) {
    card.style.display = 'block';
    card.innerHTML = `
      <div class="verified-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        Official Verified Receipt
      </div>
      <div style="font-size:0.9rem; line-height: 1.6;">
        <div><strong>Store:</strong> ${escapeHtml(invoice.store.name)} (FSSAI: ${escapeHtml(invoice.store.fssai)})</div>
        <div><strong>Invoice:</strong> ${escapeHtml(invoice.invoiceNo)}</div>
        <div><strong>Date & Time:</strong> ${invoice.date} at ${invoice.time}</div>
        <div><strong>Total Amount:</strong> <strong style="color:#15803d; font-size:1.1rem;">₹${Number(invoice.grandTotal).toFixed(2)}</strong></div>
        <div><strong>Total Items:</strong> ${invoice.items.length} items (${invoice.totalQty} total qty)</div>
        <div style="margin-top: 8px; font-size:0.8rem; color:#64748b;">This receipt was officially generated and verified by AR Mart Point of Sale.</div>
      </div>
    `;
  } else {
    card.style.display = 'block';
    card.innerHTML = `
      <div style="color:#ef4444; font-weight:700; display:flex; align-items:center; gap:6px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Receipt Record Not Found
      </div>
      <p style="font-size:0.85rem; color:#64748b; margin-top:4px;">No official invoice matching "${escapeHtml(input)}" was found on this system.</p>
    `;
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
