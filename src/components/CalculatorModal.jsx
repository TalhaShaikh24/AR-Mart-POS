import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleBtn = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '=') {
      try {
        const clean = (equation + display).replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${clean})`)();
        setDisplay(String(Math.round(res * 100) / 100));
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    } else if (['+', '-', '×', '÷'].includes(val)) {
      setEquation(`${display} ${val} `);
      setDisplay('0');
    } else if (val === '.') {
      if (!display.includes('.')) setDisplay(display + '.');
    } else {
      if (display === '0') setDisplay(val);
      else setDisplay(display + val);
    }
  };

  return (
    <div className="react-modal-overlay">
      <div className="react-modal-dialog calc-modal-dialog">
        <div className="react-modal-header">
          <div className="modal-title-box">
            <Calculator size={18} className="modal-title-icon" />
            <h3>Quick POS Calculator</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="calc-body">
          <div className="calc-screen">
            <div className="calc-equation">{equation}</div>
            <div className="calc-display">{display}</div>
          </div>

          <div className="calc-keypad">
            {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '%'].map(k => (
              <button 
                key={k} 
                className={`calc-btn ${['+', '-', '×', '÷', '='].includes(k) ? 'calc-op' : ''} ${k === 'C' ? 'calc-clear' : ''}`}
                onClick={() => {
                  if (k === '⌫') {
                    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                  } else {
                    handleBtn(k);
                  }
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
