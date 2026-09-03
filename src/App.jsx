import React, { useState, useEffect, useRef } from 'react';
import ArMartLogo from './components/ArMartLogo';
import ThermalReceipt from './components/ThermalReceipt';
import CustomerVerifyView from './components/CustomerVerifyView';
import LoginScreen from './components/LoginScreen';
import HistoryModal from './components/HistoryModal';
import ProductsModal from './components/ProductsModal';
import SettingsModal from './components/SettingsModal';
import HeldBillsModal from './components/HeldBillsModal';
import CalculatorModal from './components/CalculatorModal';
import ProductCatalogDrawer from './components/ProductCatalogDrawer';
import NewCustomerModal from './components/NewCustomerModal';
import VerifySearchModal from './components/VerifySearchModal';
import ShortcutsModal from './components/ShortcutsModal';
import CustomItemModal from './components/CustomItemModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import SecurityModal from './components/SecurityModal';
import UsersModal from './components/UsersModal';

import { 
  Search, 
  Plus, 
  Trash2, 
  History, 
  ShieldCheck, 
  Package, 
  Users,
  Settings, 
  Printer, 
  Eye, 
  SlidersHorizontal,
  Barcode,
  Calculator,
  KeyRound,
  Keyboard,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  User,
  UserPlus,
  LogOut,
  PauseCircle,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Check,
  ChevronDown
} from 'lucide-react';

const INITIAL_USERS = [
  { username: 'zahid', name: 'Zahid Ahmed', role: 'Head Cashier', pin: '1234', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { username: 'aamir', name: 'Aamir Khan', role: 'Cashier', pin: '0000', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { username: 'admin', name: 'Store Manager', role: 'Admin', pin: '9999', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' }
];

export default function App() {
  // Check if viewing customer mobile verification certificate (Bill QR scan)
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const isVerifyMode = 
    urlParams.has('verify') || 
    urlParams.has('verifyData') || 
    urlParams.has('inv') ||
    hashParams.has('verify') ||
    hashParams.has('verifyData') ||
    hashParams.has('inv') ||
    window.location.pathname.includes('/verify');

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('armart_logged_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });
  // Terminal Lock State (Always requires PIN on browser launch or reload)
  const [isLocked, setIsLocked] = useState(true);
  const [availableUsers, setAvailableUsers] = useState(INITIAL_USERS);

  // App Theme & Fullscreen
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Data & State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [heldBills, setHeldBills] = useState([]);
  const [storeConfig, setStoreConfig] = useState({
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
    qrMode: 'verify',
    verifyBaseUrl: ''
  });

  // Billing Fields
  const [invoiceSeq, setInvoiceSeq] = useState('#12456');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdown, setSearchDropdown] = useState([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [roundoffEnabled, setRoundoffEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'Card' | 'Scan'

  // Inline Quick Add Custom Product Row state (Unit, MRP, Category, Discount)
  const [inlineName, setInlineName] = useState('');
  const [inlineCategory, setInlineCategory] = useState('General');
  const [inlineUnit, setInlineUnit] = useState('1 KG');
  const [inlineMrp, setInlineMrp] = useState('');
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlineDiscount, setInlineDiscount] = useState('');
  const [inlineQty, setInlineQty] = useState(1);

  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showVerifySearch, setShowVerifySearch] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  const searchInputRef = useRef(null);

  // Load initial backend data
  useEffect(() => {
    fetchInitialData();
    generateInvoiceSequence();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [pRes, sRes, iRes, uRes, hRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/settings').catch(() => null),
        fetch('/api/invoices').catch(() => null),
        fetch('/api/users').catch(() => null),
        fetch('/api/bills/hold').catch(() => null)
      ]);

      if (pRes && pRes.ok) setProducts(await pRes.json());
      if (sRes && sRes.ok) {
        const sData = await sRes.json();
        setStoreConfig(prev => ({ ...prev, ...sData }));
      }
      if (iRes && iRes.ok) setInvoices(await iRes.json());
      if (uRes && uRes.ok) {
        const usersData = await uRes.json();
        if (usersData?.length) setAvailableUsers(usersData);
      }
      if (hRes && hRes.ok) setHeldBills(await hRes.json());
    } catch (e) {
      console.warn('Using local fallback state', e);
    }
  };

  const generateInvoiceSequence = () => {
    const rand = Math.floor(10000 + Math.random() * 90000);
    setInvoiceSeq(`#${rand}`);
  };

  // Search autocomplete with keyboard index tracking
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchDropdown([]);
      setActiveSearchIndex(-1);
      return;
    }
    const clean = searchQuery.toLowerCase().trim();
    const matches = products.filter(p => 
      p.name.toLowerCase().includes(clean) || 
      (p.barcode && p.barcode.includes(clean)) ||
      (p.sku && p.sku.toLowerCase().includes(clean))
    ).slice(0, 8);
    setSearchDropdown(matches);
    setActiveSearchIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery, products]);

  // Handle keyboard navigation inside search dropdown (Arrow keys + Enter)
  const handleSearchKeyDown = (e) => {
    if (searchDropdown.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev < searchDropdown.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev > 0 ? prev - 1 : searchDropdown.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetItem = (activeSearchIndex >= 0 && searchDropdown[activeSearchIndex]) 
        ? searchDropdown[activeSearchIndex] 
        : searchDropdown[0];
      if (targetItem) {
        addToCart(targetItem);
        setSearchQuery('');
        setSearchDropdown([]);
        setActiveSearchIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setSearchDropdown([]);
      setActiveSearchIndex(-1);
    }
  };

  // Cart operations
  const addToCart = (product, qtyToAdd = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id && item.unit === product.unit);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: Math.round((updated[idx].qty + qtyToAdd) * 100) / 100 };
        return updated;
      }
      const itemMrp = Number(product.mrp || product.rate || 0);
      const itemRate = Number(product.rate || 0);
      const itemDiscount = product.discount !== undefined 
        ? Number(product.discount) 
        : (itemMrp > itemRate ? Math.round((itemMrp - itemRate) * 100) / 100 : 0);

      return [
        ...prev,
        {
          id: product.id || `PROD_${Date.now()}`,
          name: product.name,
          category: product.category || 'General',
          unit: product.unit || '1 KG',
          mrp: itemMrp,
          rate: itemRate,
          discount: itemDiscount,
          tax: Number(product.tax || 0),
          stock: product.stock || 250,
          sku: product.sku || product.barcode || `SKU-${Math.floor(1000000 + Math.random() * 9000000)}`,
          image: product.image || '',
          qty: qtyToAdd
        }
      ];
    });
    setSearchQuery('');
    setSearchDropdown([]);
  };

  const updateCartQty = (index, newQty) => {
    const val = parseFloat(newQty);
    if (isNaN(val) || val <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: Math.round(val * 100) / 100 };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllCart = () => {
    if (cart.length > 0 && !window.confirm('Clear all items from this order?')) return;
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
    setPromoCode('');
    generateInvoiceSequence();
  };

  // Inline Quick Add Custom Product Handlers
  const handleInlineMrpChange = (val) => {
    setInlineMrp(val);
    const m = parseFloat(val);
    if (!isNaN(m) && m > 0) {
      const d = parseFloat(inlineDiscount);
      if (!isNaN(d) && d > 0) {
        setInlinePrice(Math.max(0, m - d).toFixed(2));
      } else if (!inlinePrice) {
        setInlinePrice(val);
      }
    }
  };

  const handleInlinePriceChange = (val) => {
    setInlinePrice(val);
    const r = parseFloat(val);
    const m = parseFloat(inlineMrp);
    if (!isNaN(m) && !isNaN(r) && m >= r) {
      setInlineDiscount((m - r).toFixed(2));
    }
  };

  const handleInlineDiscountChange = (val) => {
    setInlineDiscount(val);
    const d = parseFloat(val);
    const m = parseFloat(inlineMrp);
    if (!isNaN(m) && m > 0 && !isNaN(d) && d >= 0) {
      setInlinePrice(Math.max(0, m - d).toFixed(2));
    }
  };

  const handleInlineAdd = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(inlinePrice);
    const mrpNum = parseFloat(inlineMrp) || rateNum;
    const discNum = parseFloat(inlineDiscount) || Math.max(0, mrpNum - rateNum);
    if (!inlineName.trim() || isNaN(rateNum) || rateNum <= 0) {
      alert('Please enter an Item Description and a valid Rate.');
      return;
    }

    addToCart({
      id: `CUSTOM_${Date.now()}`,
      name: inlineName.trim(),
      category: inlineCategory || 'General',
      unit: inlineUnit || '1 KG',
      mrp: mrpNum,
      rate: rateNum,
      discount: discNum,
      tax: 0,
      stock: 100,
      sku: `CUSTOM-${Date.now().toString().slice(-6)}`
    }, inlineQty);

    setInlineName('');
    setInlineMrp('');
    setInlinePrice('');
    setInlineDiscount('');
    setInlineQty(1);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = cart.reduce((sum, item) => sum + (item.qty * (item.tax || 0)), 0);
  const grossTotal = subtotal + tax;
  const rawPayable = Math.max(0, grossTotal - discountAmount);
  const totalPayable = roundoffEnabled ? Math.round(rawPayable) : rawPayable;
  const roundoffDiff = Math.abs(totalPayable - rawPayable);

  // Apply Promo code
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'SAVE50') {
      setDiscountAmount(50);
      alert('Promo code SAVE50 applied! ₹50.00 discount granted.');
    } else if (clean === 'ARMART10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      alert(`Promo code ARMART10 applied! 10% (₹${disc}) discount granted.`);
    } else {
      const numVal = parseFloat(promoCode);
      if (!isNaN(numVal) && numVal > 0) {
        setDiscountAmount(numVal);
        alert(`Discount of ₹${numVal.toFixed(2)} applied.`);
      } else {
        alert('Invalid promo code. Try SAVE50 or enter discount amount.');
      }
    }
  };

  // Hold Bill
  const handleHoldBill = async () => {
    if (cart.length === 0) {
      alert('Cannot hold an empty bill.');
      return;
    }

    const held = {
      id: `HOLD_${Date.now()}`,
      invoiceNo: invoiceSeq,
      customerName: customerName || 'Walk-in',
      customerPhone,
      items: cart,
      subtotal,
      discount: discountAmount,
      grandTotal: totalPayable,
      biller: currentUser.name,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHeldBills(prev => [held, ...prev]);
    try {
      await fetch('/api/bills/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(held)
      });
    } catch (e) {}

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
    generateInvoiceSequence();
    alert(`Bill ${held.invoiceNo} is now on hold.`);
  };

  const handleResumeBill = (bill) => {
    setCart(bill.items || []);
    setCustomerName(bill.customerName === 'Walk-in' ? '' : bill.customerName);
    setCustomerPhone(bill.customerPhone || '');
    setDiscountAmount(bill.discount || 0);
    setInvoiceSeq(bill.invoiceNo);
    setShowHeldBills(false);

    // remove from held list
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
    fetch(`/api/bills/hold/${bill.id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Prepare full invoice object for thermal printing & storage
  const buildFinalInvoice = () => {
    const now = new Date();
    return {
      invoiceNo: `ARM/${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${invoiceSeq.replace('#','')}`,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: now.toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: cart.map(x => ({
        id: x.id,
        name: x.name,
        category: x.category || 'General',
        unit: x.unit || '1 PCS',
        qty: x.qty,
        mrp: Number(x.mrp || x.rate),
        rate: Number(x.rate),
        discount: Number(x.discount || 0),
        tax: Number(x.tax || 0),
        amount: Number(x.qty * x.rate)
      })),
      totalItems: cart.length,
      totalQty: Math.round(cart.reduce((s, i) => s + i.qty, 0) * 100) / 100,
      subTotal: subtotal,
      discount: Number(discountAmount || 0) + cart.reduce((s, i) => s + (Number(i.discount || 0) * Number(i.qty || 1)), 0),
      tax: tax,
      grandTotal: totalPayable,
      paymentMethod: paymentMethod,
      biller: currentUser.name,
      store: {
        name: storeConfig.storeName,
        address: storeConfig.address,
        phone: storeConfig.phone,
        whatsapp: storeConfig.whatsapp,
        fssai: storeConfig.fssai
      }
    };
  };

  // Make Payment & Print Thermal Receipt
  const handleMakePayment = async () => {
    if (cart.length === 0) {
      alert('Please add items to the cart before checkout.');
      return;
    }

    const finalInvoice = buildFinalInvoice();
    setReceiptToPrint(finalInvoice);

    // Save to MongoDB / Express API
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalInvoice)
      });
      setInvoices(prev => [finalInvoice, ...prev]);
    } catch (err) {
      console.error('Invoice save error', err);
    }

    // Trigger Print after allowing QR canvas & items to fully render
    setTimeout(() => {
      window.print();
      // Reset POS for next customer
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
      setPromoCode('');
      generateInvoiceSequence();
    }, 400);
  };

  const handlePreviewInvoice = () => {
    if (cart.length === 0) {
      alert('Please add items to the cart to preview receipt.');
      return;
    }
    const finalInvoice = buildFinalInvoice();
    setReceiptToPrint(finalInvoice);
    setShowPreview(true);
  };

  const handlePrintFromPreview = () => {
    setShowPreview(false);
    setTimeout(() => {
      window.print();
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
      setPromoCode('');
      generateInvoiceSequence();
    }, 300);
  };

  const handleReprintInvoice = (inv) => {
    setReceiptToPrint(inv);
    setShowHistory(false);
    setShowPreview(true); // Open in preview so they can see all details and print!
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    setIsLocked(true);
    localStorage.setItem('armart_is_locked', 'true');
  };

  // Global POS Keyboard Shortcuts
  useEffect(() => {
    if (isLocked) return;

    const handleGlobalKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName);

      // F1: Shortcuts Guide Modal
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // F2: Focus Search Input
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // F4: Catalog Drawer
      if (e.key === 'F4') {
        e.preventDefault();
        setShowCatalogDrawer(prev => !prev);
        return;
      }

      // F7: Hold Bill
      if (e.key === 'F7') {
        e.preventDefault();
        handleHoldBill();
        return;
      }

      // F8: Held Bills List
      if (e.key === 'F8') {
        e.preventDefault();
        setShowHeldBills(prev => !prev);
        return;
      }

      // F9: Custom Loose Item
      if (e.key === 'F9') {
        e.preventDefault();
        setShowCustomItem(prev => !prev);
        return;
      }

      // F10 or Ctrl+Enter: Make Payment & Checkout
      if (e.key === 'F10' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleMakePayment();
        return;
      }

      // F11: Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Escape: Close any open modal / drawer / search dropdown
      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        setShowHistory(false);
        setShowProducts(false);
        setShowSettings(false);
        setShowCalculator(false);
        setShowHeldBills(false);
        setShowCatalogDrawer(false);
        setShowNewCustomer(false);
        setShowVerifySearch(false);
        setShowCustomItem(false);
        setShowSecurityModal(false);
        setSearchDropdown([]);
        setActiveSearchIndex(-1);
        return;
      }

      // If user is currently typing in an input field, do not hijack Alt keys
      if (isInput) return;

      // Alt + C: Calculator
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setShowCalculator(prev => !prev);
      } else if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowHistory(prev => !prev);
      } else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setShowProducts(prev => !prev);
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setShowSettings(prev => !prev);
      } else if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setShowVerifySearch(prev => !prev);
      } else if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setShowNewCustomer(prev => !prev);
      } else if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLocked, cart, products, subtotal, discountAmount, totalPayable, invoiceSeq, customerName, customerPhone, paymentMethod, storeConfig, currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLocked(false);
    localStorage.setItem('armart_logged_user', JSON.stringify(user));
  };

  // 1. If customer scanned QR code on bill or is viewing verification certificate -> OPEN DIRECTLY (NO LOGIN)
  if (isVerifyMode) {
    return <CustomerVerifyView />;
  }

  // 2. If POS Terminal Lock Screen is active (requires cashier PIN)
  if (isLocked) {
    return (
      <LoginScreen 
        onLogin={handleLoginSuccess}
        availableUsers={availableUsers}
      />
    );
  }

  return (
    <>
    <div className={`fidelity-pos-wrapper ${darkMode ? 'dark-theme' : ''}`}>
      {/* PREMIUM TOP GREEN BAR */}
      <header className="fidelity-header">
        <div className="f-header-left">
          <div className="f-logo-wrap">
            <ArMartLogo height={44} showTagline={true} />
          </div>
          <div className="f-header-divider" />
          <div className="f-terminal-info">
            <span className="f-terminal-label">POS Terminal</span>
            <span className="f-terminal-name">Handwara · Register #1</span>
          </div>
          <div className="f-status-dot" title="System Online" />
        </div>

        <div className="f-header-right">
          {/* Keyboard Shortcuts Reference Guide */}
          <button className="f-icon-btn" onClick={() => setShowShortcutsModal(true)} title="Keyboard Shortcuts (F1)">
            <Keyboard size={17} />
          </button>

          {/* Quick Calculator */}
          <button className="f-icon-btn" onClick={() => setShowCalculator(true)} title="Calculator (Alt+C)">
            <Calculator size={17} />
          </button>

          {/* Fullscreen Toggle */}
          <button className="f-icon-btn" onClick={toggleFullscreen} title="Fullscreen (F11)">
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          {/* Dark Mode Toggle */}
          <div className="f-theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark/Light Mode">
            <div className={`toggle-track ${darkMode ? 'active' : ''}`}>
              <div className="toggle-thumb">
                {darkMode ? <Moon size={10} /> : <Sun size={10} />}
              </div>
            </div>
            <span className="toggle-label">{darkMode ? 'Dark' : 'Light'}</span>
          </div>

          <div className="f-header-divider" />

          {/* Nav Buttons */}
          <button className="f-text-btn" onClick={() => setShowHistory(true)}>
            <History size={14} /> <span>History</span>
          </button>
          <button className="f-text-btn" onClick={() => setShowVerifySearch(true)}>
            <ShieldCheck size={14} /> <span>Verify</span>
          </button>
          <button className="f-text-btn" onClick={() => setShowProducts(true)}>
            <Package size={14} /> <span>Products</span>
          </button>
          {currentUser?.role === 'Admin' && (
            <button 
              className="f-text-btn" 
              onClick={() => setShowUsersModal(true)} 
              title="Manage POS Users & Cashiers"
              style={{ color: '#86efac', borderColor: 'rgba(134, 239, 172, 0.4)' }}
            >
              <Users size={14} /> <span>Users</span>
            </button>
          )}
          <button className="f-text-btn" onClick={() => setShowSettings(true)}>
            <Settings size={14} /> <span>Settings</span>
          </button>
          <button className="f-text-btn" onClick={() => setShowSecurityModal(true)} title="Terminal Security & PIN Reset">
            <KeyRound size={14} /> <span>Security</span>
          </button>

          {/* Cashier Pill */}
          <div className="f-user-pill">
            <img 
              src={currentUser.avatar || INITIAL_USERS[0].avatar} 
              alt={currentUser.name} 
              className="f-user-avatar" 
              onClick={() => setShowSecurityModal(true)}
              style={{ cursor: 'pointer' }}
              title="Click to Change PIN"
            />
            <span 
              className="f-user-name" 
              onClick={() => setShowSecurityModal(true)} 
              style={{ cursor: 'pointer' }} 
              title="Click to Change PIN"
            >
              {currentUser.name.split(' ')[0]} {currentUser.role === 'Admin' ? '★' : ''}
            </span>
            <button className="f-logout-btn" onClick={() => setShowSecurityModal(true)} title="Change / Reset PIN">
              <KeyRound size={13} />
            </button>
            <button className="f-logout-btn" onClick={handleLogout} title="Lock Terminal / Switch Cashier">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* POS CONTAINER SCREEN */}
      <div className="fidelity-container">
        {/* TOP BAR: SEARCH & SELECT BILLER */}
        <div className="fidelity-top-actions">
          {/* Left: Product Search Box */}
          <div className="f-search-row">
            <div className="f-search-input-wrap">
              <Search className="f-search-icon" size={19} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search by product name, barcode, SKU (F2)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery && (
                <button className="f-search-clear" onClick={() => { setSearchQuery(''); setActiveSearchIndex(-1); }}>&times;</button>
              )}

              {/* Instant Search Autocomplete Dropdown with Keyboard Arrow Keys Support */}
              {searchDropdown.length > 0 && (
                <div className="f-search-dropdown">
                  {searchDropdown.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`f-search-dropdown-item ${activeSearchIndex === idx ? 'active-kb-item' : ''}`}
                      onClick={() => {
                        addToCart(item);
                        setSearchQuery('');
                        setSearchDropdown([]);
                        setActiveSearchIndex(-1);
                      }}
                      onMouseEnter={() => setActiveSearchIndex(idx)}
                    >
                      <div className="s-drop-left">
                        <strong className="s-drop-name">{item.name}</strong>
                        <span className="s-drop-sku">SKU: {item.barcode || item.id} • Stock: {item.stock || 250}</span>
                      </div>
                      <div className="s-drop-right">
                        <span className="s-drop-rate">₹{Number(item.rate).toFixed(2)}</span>
                        <span className="s-drop-unit">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Filter Button */}
            <button className="f-filter-btn" onClick={() => setShowCatalogDrawer(true)} title="Browse Categories & Products">
              <SlidersHorizontal size={18} />
            </button>

            {/* Scan Barcode Button */}
            <button className="f-scan-btn" onClick={() => { searchInputRef.current?.focus(); alert('Ready for Barcode Scanner. Scan any product barcode.'); }}>
              <Barcode size={18} />
              <span>Scan Barcode</span>
            </button>
          </div>

          {/* Right: Select Biller Selector */}
          <div className="f-biller-selector-box">
            <span className="biller-label">Select Biller</span>
            <div className="biller-dropdown-pill">
              <img src={currentUser.avatar || INITIAL_USERS[0].avatar} alt={currentUser.name} className="biller-avatar" />
              <select 
                value={currentUser.username} 
                onChange={(e) => {
                  const u = availableUsers.find(x => x.username === e.target.value);
                  if (u) setCurrentUser(u);
                }}
              >
                {availableUsers.map(u => (
                  <option key={u.username} value={u.username}>{u.name} ({u.role})</option>
                ))}
              </select>
              <ChevronDown size={14} className="biller-chevron" />
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN ORDER WORKSPACE */}
        <div className="fidelity-grid">
          {/* LEFT: ORDER DETAILS CARD */}
          <div className="f-order-details-card">
            {/* Header */}
            <div className="f-order-header">
              <div className="f-order-title-group">
                <h2>ORDER DETAILS</h2>
                <span className="f-items-badge">Items: {cart.length}</span>
                {heldBills.length > 0 && (
                  <button className="f-held-badge-btn" onClick={() => setShowHeldBills(true)}>
                    <PauseCircle size={14} /> Held ({heldBills.length})
                  </button>
                )}
              </div>
              <button className="f-clear-all-btn" onClick={clearAllCart}>
                Clear All ✕
              </button>
            </div>

            {/* Order Items Table Header */}
            <div className="f-table-head">
              <div className="th-col th-product">Product</div>
              <div className="th-col th-price">Price ↓</div>
              <div className="th-col th-quantity">Quantity</div>
              <div className="th-col th-subtotal">Subtotal</div>
              <div className="th-col th-action">Action</div>
            </div>

            {/* Quick Inline "Add a Custom Product" Row (Unit, MRP, Category, Discount) */}
            <form className="f-inline-add-row" onSubmit={handleInlineAdd}>
              <div className="inline-field-group inline-name-col">
                <span className="inline-field-label">Custom Item</span>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Paneer, Loose Rice" 
                  className="inline-input-name"
                  value={inlineName}
                  onChange={e => setInlineName(e.target.value)}
                  required
                />
              </div>

              <div className="inline-field-group inline-cat-col">
                <span className="inline-field-label">Category</span>
                <select 
                  className="inline-select-cat"
                  value={inlineCategory}
                  onChange={e => setInlineCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Grains & Flours">Grains & Flours</option>
                  <option value="Oils & Ghee">Oils & Ghee</option>
                  <option value="Spices & Salt">Spices & Salt</option>
                  <option value="Dairy & Beverages">Dairy & Beverages</option>
                  <option value="Snacks & Bakery">Snacks & Bakery</option>
                  <option value="Fruits & Fresh">Fruits & Fresh</option>
                  <option value="Dry Fruits">Dry Fruits</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>

              <div className="inline-field-group inline-unit-col">
                <span className="inline-field-label">Unit</span>
                <select 
                  className="inline-select-unit"
                  value={inlineUnit}
                  onChange={e => setInlineUnit(e.target.value)}
                >
                  <option value="1 KG">1 KG</option>
                  <option value="500 g">500 g</option>
                  <option value="250 g">250 g</option>
                  <option value="100 g">100 g</option>
                  <option value="1 PCS">1 PCS</option>
                  <option value="1 L">1 L</option>
                  <option value="500 ml">500 ml</option>
                  <option value="Pack">Pack</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>

              <div className="inline-field-group inline-num-col">
                <span className="inline-field-label">MRP (₹)</span>
                <input 
                  type="number" 
                  placeholder="MRP" 
                  step="0.5"
                  className="inline-input-num"
                  value={inlineMrp}
                  onChange={e => handleInlineMrpChange(e.target.value)}
                />
              </div>

              <div className="inline-field-group inline-num-col">
                <span className="inline-field-label">Rate (₹)*</span>
                <input 
                  type="number" 
                  placeholder="Rate" 
                  step="0.5"
                  className="inline-input-num inline-rate-input"
                  value={inlinePrice}
                  onChange={e => handleInlinePriceChange(e.target.value)}
                  required
                />
              </div>

              <div className="inline-field-group inline-num-col">
                <span className="inline-field-label">Disc (₹)</span>
                <input 
                  type="number" 
                  placeholder="Disc" 
                  step="0.5"
                  className="inline-input-num"
                  value={inlineDiscount}
                  onChange={e => handleInlineDiscountChange(e.target.value)}
                />
              </div>

              <div className="inline-field-group inline-qty-col">
                <span className="inline-field-label">Qty</span>
                <div className="inline-qty-pill">
                  <button type="button" onClick={() => setInlineQty(Math.max(1, inlineQty - 1))}>-</button>
                  <span>{inlineQty}</span>
                  <button type="button" onClick={() => setInlineQty(inlineQty + 1)}>+</button>
                </div>
              </div>

              <button type="submit" className="inline-add-btn" title="Add Custom Item to Cart">
                <Plus size={15} /> <span>Add</span>
              </button>

              <button 
                type="button" 
                className="inline-more-btn" 
                onClick={() => setShowCustomItem(true)} 
                title="Open Detailed Custom Product Modal"
              >
                Full Form
              </button>
            </form>

            {/* Order Items List */}
            <div className="f-order-items-list">
              {cart.length === 0 ? (
                <div className="f-empty-order">
                  <div className="f-empty-icon">🛒</div>
                  <h3>No items added to order</h3>
                  <p>Type in the search bar above, scan a barcode, or browse categories</p>
                  <button className="f-open-catalog-btn" onClick={() => setShowCatalogDrawer(true)}>
                    <Plus size={16} /> Browse Product Catalog
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="f-order-row">
                    {/* Product info with thumbnail */}
                    <div className="f-col-prod">
                      <div className="f-prod-thumb">
                        <span>🛍️</span>
                      </div>
                      <div className="f-prod-meta">
                        <strong className="f-prod-name">{item.name}</strong>
                        <span className="f-prod-sku">
                          {item.category && <span style={{ color: '#0284c7', fontWeight: 600 }}>{item.category} • </span>}
                          Unit: <strong>{item.unit}</strong>
                          {Number(item.mrp || 0) > Number(item.rate || 0) && (
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '5px' }}>
                              ₹{Number(item.mrp).toFixed(2)}
                            </span>
                          )}
                          {Number(item.discount || 0) > 0 && (
                            <span style={{ color: '#16a34a', fontWeight: 700, marginLeft: '5px' }}>
                              Save ₹{Number(item.discount).toFixed(2)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="f-col-price font-mono">
                      ₹{Number(item.rate).toFixed(2)}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="f-col-qty">
                      <div className="f-qty-stepper">
                        <button onClick={() => updateCartQty(idx, item.qty - 1)}>-</button>
                        <input 
                          type="number" 
                          step="any" 
                          value={item.qty} 
                          onChange={e => updateCartQty(idx, e.target.value)} 
                        />
                        <button onClick={() => updateCartQty(idx, item.qty + 1)}>+</button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="f-col-subtotal font-mono">
                      ₹{(item.qty * item.rate).toFixed(2)}
                    </div>

                    {/* Trash Action */}
                    <div className="f-col-action">
                      <button className="f-trash-btn" onClick={() => removeFromCart(idx)} title="Remove Item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: INVOICE & PAYMENT CARD */}
          <div className="f-invoice-card">
            {/* Invoice Header */}
            <div className="f-invoice-header">
              <h3>INVOICE</h3>
              <span className="f-invoice-num">{invoiceSeq}</span>
            </div>

            {/* Invoice Body */}
            <div className="f-invoice-body">
              {/* Customer ID & New User Buttons */}
              <div className="f-customer-row">
                <div className="f-cust-input-box">
                  <User size={15} className="cust-icon" />
                  <input 
                    type="text" 
                    placeholder="Customer Name / Mobile" 
                    value={customerName || customerPhone}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <button className="f-new-user-btn" onClick={() => setShowNewCustomer(true)}>
                  <UserPlus size={15} />
                  <span>New User</span>
                </button>
              </div>

              {/* Payment Summary */}
              <div className="f-payment-summary-section">
                <h4 className="f-summary-title">Payment Summary</h4>

                <div className="f-sum-line">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="f-sum-line">
                  <span>Tax (GST 0%)</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>

                {/* Promo Code Input */}
                <form className="f-promo-row" onSubmit={handleApplyPromo}>
                  <div className="f-promo-input-wrap">
                    <Tag size={14} className="promo-icon" />
                    <input 
                      type="text" 
                      placeholder="Promo Code or ₹ Amount" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="f-promo-apply-btn">Apply</button>
                </form>

                <div className="f-sum-line">
                  <span>Total</span>
                  <span className="font-mono">₹{grossTotal.toFixed(2)}</span>
                </div>

                <div className="f-sum-line">
                  <span>Discount</span>
                  <span className="font-mono text-green">- ₹{discountAmount.toFixed(2)}</span>
                </div>

                <div className="f-sum-line roundoff-line">
                  <div className="roundoff-label-group">
                    <span>Roundoff</span>
                    <label className="f-switch">
                      <input 
                        type="checkbox" 
                        checked={roundoffEnabled} 
                        onChange={e => setRoundoffEnabled(e.target.checked)} 
                      />
                      <span className="f-slider"></span>
                    </label>
                  </div>
                  <span className="font-mono">₹{roundoffDiff.toFixed(2)}</span>
                </div>

                <div className="f-payable-box">
                  <span className="payable-label">Total Payable</span>
                  <span className="payable-val">₹{totalPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Select Payment Method */}
              <div className="f-payment-methods-section">
                <h4 className="f-method-title">Select Payment Method</h4>
                <div className="f-methods-grid">
                  <div 
                    className={`f-method-card ${paymentMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Cash')}
                  >
                    <Banknote size={20} />
                    <span>Cash</span>
                    {paymentMethod === 'Cash' && <div className="method-check"><Check size={12} /></div>}
                  </div>

                  <div 
                    className={`f-method-card ${paymentMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <CreditCard size={20} />
                    <span>Card</span>
                    {paymentMethod === 'Card' && <div className="method-check"><Check size={12} /></div>}
                  </div>

                  <div 
                    className={`f-method-card ${paymentMethod === 'Scan' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Scan')}
                  >
                    <QrCode size={20} />
                    <span>Scan</span>
                    {paymentMethod === 'Scan' && <div className="method-check"><Check size={12} /></div>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="f-invoice-actions">
                <button className="f-make-payment-btn" onClick={handleMakePayment}>
                  <Printer size={18} />
                  <span>Make Payment & Print (F10)</span>
                </button>

                <div className="f-secondary-actions-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>
                  <button className="btn-table-action" onClick={handlePreviewInvoice} style={{ height: '42px', justifyContent: 'center' }} title="Preview Thermal Receipt">
                    <Eye size={15} />
                    <span>Preview</span>
                  </button>
                  <button className="f-hold-btn" onClick={handleHoldBill} style={{ height: '42px' }} title="Hold Order (F7)">
                    <PauseCircle size={15} />
                    <span>Hold (F7)</span>
                  </button>
                  <button className="f-cancel-btn" onClick={clearAllCart} style={{ height: '42px' }} title="Cancel Order">
                    <Trash2 size={15} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* FOOTER */}
        <footer className="fidelity-footer">
          <p>Copyright © 2026 AR Mart. All Rights Reserved. • Fast. Fresh. Reliable</p>
        </footer>
      </div>
      {/* THERMAL PRINT PORTAL — rendered cleanly without destructive 0x0 inline style */}
      {receiptToPrint && (
        <div id="thermal-print-root" className="thermal-print-portal">
          <ThermalReceipt
            invoice={receiptToPrint}
            storeConfig={storeConfig}
          />
        </div>
      )}
    </div>

    {/* ALL MODALS — rendered outside the main wrapper to avoid stacking context issues */}
    <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
    <HeldBillsModal 
      isOpen={showHeldBills} 
      onClose={() => setShowHeldBills(false)} 
      heldBills={heldBills} 
      onResumeBill={handleResumeBill}
      onDeleteHeldBill={(id) => {
        setHeldBills(prev => prev.filter(b => b.id !== id));
        fetch(`/api/bills/hold/${id}`, { method: 'DELETE' }).catch(() => {});
      }}
    />
    <ProductCatalogDrawer 
      isOpen={showCatalogDrawer} 
      onClose={() => setShowCatalogDrawer(false)} 
      products={products}
      onAddToCart={(item) => addToCart(item, 1)}
    />
    <NewCustomerModal 
      isOpen={showNewCustomer} 
      onClose={() => setShowNewCustomer(false)}
      onSaveCustomer={(cust) => {
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone);
      }}
    />
    <HistoryModal 
      isOpen={showHistory} 
      onClose={() => setShowHistory(false)} 
      invoices={invoices} 
      onReprint={handleReprintInvoice} 
    />
    <ProductsModal 
      isOpen={showProducts} 
      onClose={() => setShowProducts(false)} 
      products={products} 
      onAddProduct={async (newProd) => {
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProd)
          });
          if (res.ok) {
            const created = await res.json();
            setProducts(prev => [created, ...prev]);
          }
        } catch (e) {
          setProducts(prev => [newProd, ...prev]);
        }
      }} 
      onDeleteProduct={async (id) => {
        try {
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
        } catch (e) {}
        setProducts(prev => prev.filter(p => p.id !== id));
      }} 
    />
    <SettingsModal 
      isOpen={showSettings} 
      onClose={() => setShowSettings(false)} 
      storeConfig={storeConfig} 
      onSaveSettings={async (saved) => {
        setStoreConfig(saved);
        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saved)
          });
        } catch (e) {}
      }} 
    />
    <VerifySearchModal 
      isOpen={showVerifySearch} 
      onClose={() => setShowVerifySearch(false)} 
      invoices={invoices} 
    />
    <ShortcutsModal 
      isOpen={showShortcutsModal} 
      onClose={() => setShowShortcutsModal(false)} 
    />
    <CustomItemModal 
      isOpen={showCustomItem} 
      onClose={() => setShowCustomItem(false)} 
      onAddCustomItem={(item) => addToCart(item, item.qty || 1)} 
    />
    <ReceiptPreviewModal 
      isOpen={showPreview} 
      onClose={() => setShowPreview(false)} 
      invoice={receiptToPrint} 
      storeConfig={storeConfig} 
      onPrint={handlePrintFromPreview} 
    />
    <SecurityModal 
      isOpen={showSecurityModal} 
      onClose={() => setShowSecurityModal(false)} 
      currentUser={currentUser} 
      availableUsers={availableUsers} 
      onPinUpdated={fetchInitialData} 
      onOpenUsersManager={() => {
        setShowSecurityModal(false);
        setShowUsersModal(true);
      }}
    />
    <UsersModal 
      isOpen={showUsersModal} 
      onClose={() => setShowUsersModal(false)} 
      currentUser={currentUser} 
      onUsersUpdated={fetchInitialData} 
    />
    </>
  );
}
