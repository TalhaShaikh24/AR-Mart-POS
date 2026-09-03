# AR Mart POS — Advanced Point of Sale & Billing Terminal

AR Mart POS is a modern, responsive, high-performance retail supermarket Point of Sale (POS) system built with React, Vite, Express, and MongoDB.

![AR Mart POS](public/ar-mart-logo.png)

## Key Features

- **⚡ Rapid Retail Billing**: Barcode scanning, instant autocomplete search with arrow-key keyboard navigation (`↓`, `↑`, `Enter`).
- **🖨️ Direct Silent Thermal Printing**: Supports 80mm and 58mm thermal receipt printers with zero browser popup dialogs via Kiosk Printing mode (`--kiosk-printing`).
- **📱 QR Code Invoice Verification & UPI Payments**: Built-in dynamic QR generation on every receipt for mobile camera authenticity verification and UPI payments.
- **⏸️ Hold & Resume Bills**: Suspend current customer orders (`F7`) and resume anytime (`F8`) without losing billing flow.
- **⌨️ Complete Keyboard Shortcuts System**: Full POS functional shortcuts (`F1` to `F11`, `Alt` combos).
- **📱 Fully Responsive**: Custom layouts optimized for Desktops, Touchscreen POS terminals, Tablets, and Mobile screens.
- **🔒 Multi-User Cashier PIN Authentication**: Cashier accounts (Zahid, Aamir, Admin) with numpad & physical keyboard PIN support.
- **📊 Sales & Inventory Management**: Invoices history, product catalog manager, and store/bank receipt customization.

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas cloud URI)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/TalhaShaikh24/ar-mart-pos.git
cd ar-mart-pos

# Install dependencies
npm install
```

### 3. Configuration
Copy the environment sample:
```bash
cp .env.example .env
```
Configure your MongoDB URI and port in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/armart_pos
```

### 4. Build & Run
```bash
# Build frontend bundle
npm run build

# Start the production server
node server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

## Direct Silent Thermal Printing (Zero Popup)
To print receipts instantly directly to your default thermal printer without browser preview popups:
```cmd
Start_AR_Mart_Silent_POS.bat
```
*(Runs Google Chrome / Microsoft Edge in `--kiosk-printing --app=http://localhost:5000` mode).*

## Default Cashiers & PINs
- **Zahid** (Senior Cashier)
- **Aamir** (Biller)
- **Admin** (Administrator)

## License
MIT License. Copyright © 2026 AR Mart. All Rights Reserved.
