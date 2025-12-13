import './Logo.css';

export function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-icon">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradiente para el globo terráqueo */}
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#4A9FD8', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1E5A8E', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Gradiente para la flecha */}
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#E91E63', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#D81B60', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#AD1457', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Gradiente para el elemento naranja */}
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFA726', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FB8C00', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Globo terráqueo */}
          <circle cx="160" cy="200" r="120" fill="url(#globeGradient)" />
          
          {/* Continentes simplificados */}
          <g fill="rgba(255,255,255,0.3)">
            <ellipse cx="140" cy="170" rx="45" ry="35" transform="rotate(-20 140 170)" />
            <ellipse cx="180" cy="190" rx="35" ry="25" transform="rotate(10 180 190)" />
            <ellipse cx="160" cy="220" rx="30" ry="20" />
          </g>
          
          {/* Flecha diagonal dinámica */}
          <path 
            d="M 120 280 Q 180 240 240 180 L 260 200 L 280 170 L 250 150 L 230 170 L 250 190 Q 190 250 130 290 Z" 
            fill="url(#arrowGradient)" 
          />
          
          {/* Elemento curvo naranja */}
          <path 
            d="M 280 240 Q 320 220 340 250 Q 350 280 320 300 Q 300 310 280 300" 
            fill="url(#orangeGradient)" 
            strokeWidth="0"
          />
          
          {/* Punto azul oscuro (acento) */}
          <circle cx="340" cy="160" r="18" fill="#003B6F" />
        </svg>
      </div>
      <div className="logo-text">
        <h1>IncidentAlert</h1>
        <span style={{ 
          fontSize: '0.7rem', 
          color: '#FFA726', 
          fontWeight: 'bold',
          marginLeft: '0.5rem',
          padding: '0.2rem 0.5rem',
          background: 'rgba(255, 167, 38, 0.1)',
          borderRadius: '4px'
        }}>QA2 🚧</span>
      </div>
    </div>
  );
}
