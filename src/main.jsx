import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ─── DISABLE DEVELOPER OPTIONS & INSPECT ELEMENT ───
// 1. Disable Right-Click Context Menu (Inspect, View Page Source)
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
}, { capture: true });

// 2. Block DevTools Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
document.addEventListener('keydown', (e) => {
  // Block F12
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect / Console)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Block Ctrl+U or Cmd+Option+U (View Page Source)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Block Ctrl+S (Save page)
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, { capture: true });

// 3. Disable Drag & Drop Inspection
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
