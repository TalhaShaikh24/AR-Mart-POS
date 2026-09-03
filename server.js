const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/armart_pos';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MEMORY / LOCAL FALLBACK STORE (Active if MongoDB is not running locally) ---
let isMongoConnected = false;
let memoryStore = {
  products: [
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
    { id: 'ARM020', name: 'Detergent Powder', category: 'Personal Care', unit: '1 KG', mrp: 125, rate: 125, tax: 0, barcode: '8901020' }
  ],
  invoices: [],
  settings: {
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
  }
};

// --- MONGOOSE SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Cashier' }, // 'Admin' | 'Cashier'
  pin: { type: String, required: true },
  avatar: { type: String, default: '' },
  active: { type: Boolean, default: true }
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  unit: { type: String, default: '1 KG' },
  mrp: { type: Number, required: true },
  rate: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  stock: { type: Number, default: 250 },
  barcode: { type: String, default: '' },
  sku: { type: String, default: '' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  items: [{
    id: String,
    name: String,
    category: String,
    unit: String,
    qty: Number,
    mrp: Number,
    rate: Number,
    tax: Number,
    amount: Number
  }],
  totalItems: Number,
  totalQty: Number,
  subTotal: Number,
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grandTotal: Number,
  paymentMethod: { type: String, default: 'CASH' },
  store: {
    name: String,
    address: String,
    phone: String,
    whatsapp: String,
    fssai: String
  }
});

const SettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'AR Mart' },
  address: { type: String, default: 'Braripora Handwara J&K-193221' },
  phone: { type: String, default: '01955317530' },
  whatsapp: { type: String, default: '9682329952' },
  fssai: { type: String, default: '21026252000118' },
  bankAcct: { type: String, default: '43749700977' },
  bankIfsc: { type: String, default: 'SBIN0003996' },
  bankName: { type: String, default: 'AR DELIVERO' },
  bankBranch: { type: String, default: 'SBI Handwara' },
  paperSize: { type: String, default: '80mm' },
  qrMode: { type: String, default: 'verify' },
  verifyBaseUrl: { type: String, default: '' }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Setting = mongoose.model('Setting', SettingSchema);

// Initial Seed Users
const DEFAULT_USERS = [
  { username: 'zahid', name: 'Zahid Ahmed', role: 'Head Cashier', pin: '1234', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { username: 'aamir', name: 'Aamir Khan', role: 'Cashier', pin: '0000', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { username: 'admin', name: 'Store Manager', role: 'Admin', pin: '9999', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' }
];

memoryStore.users = [...DEFAULT_USERS];
memoryStore.heldBills = [];

// --- CONNECT TO MONGODB ---
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2500
}).then(async () => {
  isMongoConnected = true;
  console.log(' MongoDB Connected Successfully at:', MONGODB_URI);
  await seedMongoDatabase();
}).catch(err => {
  console.warn(' MongoDB is not running locally. Operating in Auto-Fallback Store Mode.', err.message);
  isMongoConnected = false;
});

async function seedMongoDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding initial AR Mart products into MongoDB...');
      await Product.insertMany(memoryStore.products);
    }
    
    // Explicitly create / update all 3 Cashier users in MongoDB
    console.log('Ensuring 3 Cashier/Admin Users exist in MongoDB database...');
    for (const u of DEFAULT_USERS) {
      await User.findOneAndUpdate(
        { username: u.username },
        { $set: u },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log(' Successfully seeded 3 Users in MongoDB: zahid, aamir, admin');

    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create(memoryStore.settings);
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

// --- API ENDPOINTS ---

// Health & Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'In-Memory Auto Fallback',
    timestamp: new Date().toISOString()
  });
});

// User Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, pin } = req.body;
    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ 
        $or: [{ username: username }, { name: username }],
        pin: pin 
      });
    } else {
      user = memoryStore.users.find(u => (u.username === username || u.name === username) && u.pin === pin);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Cashier Username or PIN' });
    }

    res.json({ success: true, user: { username: user.username, name: user.name, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find({ active: true }, '-pin');
      return res.json(users);
    }
    res.json(memoryStore.users.map(u => ({ username: u.username, name: u.name, role: u.role, avatar: u.avatar })));
  } catch (err) {
    res.json(memoryStore.users);
  }
});

// Held Bills (Hold / Resume order)
app.get('/api/bills/hold', (req, res) => {
  res.json(memoryStore.heldBills || []);
});

app.post('/api/bills/hold', (req, res) => {
  const bill = { id: `HOLD_${Date.now()}`, ...req.body, heldAt: new Date().toLocaleTimeString() };
  memoryStore.heldBills = memoryStore.heldBills || [];
  memoryStore.heldBills.unshift(bill);
  res.json({ success: true, heldBill: bill });
});

app.delete('/api/bills/hold/:id', (req, res) => {
  const { id } = req.params;
  memoryStore.heldBills = (memoryStore.heldBills || []).filter(b => b.id !== id);
  res.json({ success: true });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await Product.find().sort({ name: 1 });
      return res.json(products);
    }
    res.json(memoryStore.products);
  } catch (err) {
    res.json(memoryStore.products);
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const item = {
      id: req.body.id || `ARM${Date.now()}`,
      name: req.body.name,
      category: req.body.category || 'General',
      unit: req.body.unit || '1 PCS',
      mrp: Number(req.body.mrp) || Number(req.body.rate),
      rate: Number(req.body.rate),
      tax: Number(req.body.tax) || 0,
      barcode: req.body.barcode || ''
    };

    if (isMongoConnected) {
      const created = await Product.create(item);
      return res.status(201).json(created);
    }
    memoryStore.products.unshift(item);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Product.deleteOne({ id });
    }
    memoryStore.products = memoryStore.products.filter(p => p.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoices / Bills
app.get('/api/invoices', async (req, res) => {
  try {
    if (isMongoConnected) {
      const invoices = await Invoice.find().sort({ timestamp: -1 }).limit(100);
      return res.json(invoices);
    }
    res.json(memoryStore.invoices);
  } catch (err) {
    res.json(memoryStore.invoices);
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    if (!invoiceData.invoiceNo) {
      return res.status(400).json({ error: 'Invoice number required' });
    }

    if (isMongoConnected) {
      const created = await Invoice.create(invoiceData);
      return res.status(201).json(created);
    }

    memoryStore.invoices.unshift(invoiceData);
    res.status(201).json(invoiceData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Official Receipt Verification API Endpoint (Used by customer scanning QR code)
app.get('/api/verify/:invoiceNo', async (req, res) => {
  try {
    const invNo = decodeURIComponent(req.params.invoiceNo);
    let invoice = null;

    if (isMongoConnected) {
      invoice = await Invoice.findOne({ invoiceNo: { $regex: new RegExp(`^${invNo}$`, 'i') } });
    } else {
      invoice = memoryStore.invoices.find(inv => inv.invoiceNo.toLowerCase() === invNo.toLowerCase());
    }

    if (!invoice) {
      return res.status(404).json({ verified: false, message: 'Receipt not found in AR Mart records' });
    }

    res.json({
      verified: true,
      officialStamp: 'AR_MART_AUTHENTIC_ORIGINAL',
      invoice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store Settings
app.get('/api/settings', async (req, res) => {
  try {
    if (isMongoConnected) {
      let settings = await Setting.findOne();
      if (!settings) settings = await Setting.create(memoryStore.settings);
      return res.json(settings);
    }
    res.json(memoryStore.settings);
  } catch (err) {
    res.json(memoryStore.settings);
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    if (isMongoConnected) {
      let settings = await Setting.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      return res.json(settings);
    }
    memoryStore.settings = { ...memoryStore.settings, ...req.body };
    res.json(memoryStore.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(` AR Mart POS Server listening on http://localhost:${PORT}`);
});
