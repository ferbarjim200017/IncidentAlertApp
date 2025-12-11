import './Logo.css';

export function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-icon">
        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          {/* Fondo circular degradado - colores Repsol */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ff6b35', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ff8c00', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Círculo principal */}
          <circle cx="30" cy="30" r="28" fill="url(#logoGradient)" opacity="0.95" />
          <circle cx="30" cy="30" r="28" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
          
          {/* Símbolo de alerta/incidencia - una "I" estilizada */}
          <g transform="translate(30, 30)">
            {/* Base horizontal */}
            <rect x="-10" y="10" width="20" height="3" rx="1.5" fill="#ffffff" />
            
            {/* Línea vertical central */}
            <rect x="-2" y="-14" width="4" height="20" rx="2" fill="#ffffff" />
            
            {/* Círculo de alerta superior */}
            <circle cx="0" cy="-18" r="4" fill="#ffd700" />
            
            {/* Triángulo de advertencia interior */}
            <path d="M 0,-16 L 2,-12 L -2,-12 Z" fill="#ff6b35" />
          </g>
        </svg>
      </div>
      <div className="logo-text">
        <h1>IncidentAlert</h1>
      </div>
    </div>
  );
}
