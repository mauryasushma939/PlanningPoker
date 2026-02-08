import React from 'react';

// Simple circle spinner (CSS-based)
const spinnerStyle = {
  display: 'inline-block',
  width: 20,
  height: 20,
  border: '3px solid rgba(255,255,255,0.3)',
  borderTop: '3px solid #00d9ff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite'
};

const wrapperStyle = { display: 'inline-flex', alignItems: 'center', gap: 8 };

export default function Spinner({ label }) {
  return (
    <span style={wrapperStyle}>
      <span style={spinnerStyle} />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

// Inject keyframes once
const styleId = 'spinner-keyframes-style';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}