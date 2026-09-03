import React from 'react';

export default function ArMartLogo({ 
  height = 46, 
  showTagline = true, 
  showText = true,
  className = "", 
  variant = "horizontal", 
  style = {} 
}) {
  // Variant: Icon only
  if (variant === 'icon') {
    return (
      <div 
        className={`ar-logo-icon-wrap ${className}`} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...style 
        }}
      >
        <img 
          src="/ar-mart-logo.png" 
          alt="AR Mart Emblem" 
          style={{ 
            height: height || 44, 
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
          }} 
        />
      </div>
    );
  }

  // Variant: Vertical (used in Login or Receipt)
  if (variant === 'vertical') {
    return (
      <div 
        className={`ar-logo-vertical ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center',
          ...style
        }}
      >
        <img 
          src="/ar-mart-logo.png" 
          alt="AR MART Logo" 
          style={{ 
            height: height || 58, 
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))'
          }} 
        />
        {showText && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '1.35rem', 
              fontWeight: 900, 
              color: '#1e3a8a', 
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.1
            }}>
              AR MART
            </span>
            {showTagline && (
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: 800, 
                color: '#16a34a', 
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '3px'
              }}>
                Fast • Fresh • Reliable
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: Horizontal Brand Lockup (Emblem + Crisp High-Contrast Typography)
  return (
    <div 
      className={`ar-logo-lockup ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px',
        ...style 
      }}
    >
      <img 
        src="/ar-mart-logo.png" 
        alt="AR MART Logo Emblem" 
        style={{ 
          height: height || 46, 
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))'
        }} 
      />

      {showText && (
        <div className="ar-brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span 
            className="ar-brand-title" 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 900, 
              color: '#1e3a8a', 
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            AR MART
          </span>
          {showTagline && (
            <span 
              className="ar-brand-sub" 
              style={{ 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                color: '#15803d', 
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '3px'
              }}
            >
              Fast • Fresh • Reliable
            </span>
          )}
        </div>
      )}
    </div>
  );
}
