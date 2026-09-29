import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  customLogoUrl?: string | null;
}

/**
 * Logotipo Oficial Institucional
 * INSTITUTO TECNOLÓGICO ING DATA COMP
 * Con soporte para logotipo personalizado cargado por el usuario
 */
export const IngDataCompLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  customLogoUrl
}) => {
  // Dimensiones del contenedor
  const sizeMap = {
    sm: { box: 'w-10 h-10', svg: 40, text: 'text-xs' },
    md: { box: 'w-14 h-14', svg: 56, text: 'text-sm' },
    lg: { box: 'w-20 h-20', svg: 80, text: 'text-base' },
    xl: { box: 'w-28 h-28', svg: 112, text: 'text-lg' }
  };

  const { box, text } = sizeMap[size];

  // Si hay logotipo personalizado cargado por el usuario, lo mostramos
  const effectiveCustomLogo = customLogoUrl || (typeof window !== 'undefined' ? localStorage.getItem('IDC_LOGO_CUSTOM') : null);

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      <div className={`relative ${box} flex-shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-500/30 p-1`}>
        {effectiveCustomLogo ? (
          <img 
            src={effectiveCustomLogo} 
            alt="Instituto Tecnológico ING DATA COMP" 
            className="w-full h-full object-contain drop-shadow"
          />
        ) : (
          <svg 
            viewBox="0 0 120 120" 
            className="w-full h-full"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="idcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Borde exterior tecnológico */}
            <circle cx="60" cy="60" r="56" stroke="url(#idcGrad)" strokeWidth="2.5" />
            <circle cx="60" cy="60" r="52" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

            {/* Circuitos integrados de fondo */}
            <path d="M 20 60 H 35 L 45 45 H 55" stroke="url(#circuitGrad)" strokeWidth="1.5" />
            <path d="M 100 60 H 85 L 75 75 H 65" stroke="url(#circuitGrad)" strokeWidth="1.5" />
            <path d="M 60 20 V 35 L 48 47" stroke="url(#circuitGrad)" strokeWidth="1.5" />
            <path d="M 60 100 V 85 L 72 73" stroke="url(#circuitGrad)" strokeWidth="1.5" />
            
            <circle cx="20" cy="60" r="2.5" fill="#38BDF8" />
            <circle cx="100" cy="60" r="2.5" fill="#38BDF8" />
            <circle cx="60" cy="20" r="2.5" fill="#38BDF8" />
            <circle cx="60" cy="100" r="2.5" fill="#38BDF8" />

            {/* Microchip central */}
            <rect x="36" y="36" width="48" height="48" rx="8" fill="#0B132B" stroke="url(#idcGrad)" strokeWidth="2" />
            
            {/* Pines del microchip */}
            <line x1="44" y1="32" x2="44" y2="36" stroke="#38BDF8" strokeWidth="2" />
            <line x1="52" y1="32" x2="52" y2="36" stroke="#38BDF8" strokeWidth="2" />
            <line x1="60" y1="32" x2="60" y2="36" stroke="#38BDF8" strokeWidth="2" />
            <line x1="68" y1="32" x2="68" y2="36" stroke="#38BDF8" strokeWidth="2" />
            <line x1="76" y1="32" x2="76" y2="36" stroke="#38BDF8" strokeWidth="2" />

            <line x1="44" y1="84" x2="44" y2="88" stroke="#38BDF8" strokeWidth="2" />
            <line x1="52" y1="84" x2="52" y2="88" stroke="#38BDF8" strokeWidth="2" />
            <line x1="60" y1="84" x2="60" y2="88" stroke="#38BDF8" strokeWidth="2" />
            <line x1="68" y1="84" x2="68" y2="88" stroke="#38BDF8" strokeWidth="2" />
            <line x1="76" y1="84" x2="76" y2="88" stroke="#38BDF8" strokeWidth="2" />

            {/* Símbolo académico central: Birrete & Letras IDC */}
            <polygon points="60,42 78,50 60,57 42,50" fill="url(#goldGrad)" />
            <path d="M 47 53 V 62 C 47 67 73 67 73 62 V 53" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
            <line x1="75" y1="51" x2="77" y2="60" stroke="#FDE047" strokeWidth="1.5" />
            <circle cx="77" cy="61" r="1.5" fill="#FDE047" />

            {/* Texto IDC */}
            <text 
              x="60" 
              y="77" 
              fontSize="14" 
              fontWeight="900" 
              fill="#FFFFFF" 
              textAnchor="middle" 
              letterSpacing="1.5"
              fontFamily="system-ui, sans-serif"
            >
              IDC
            </text>
          </svg>
        )}
      </div>

      {showSubtitle && (
        <div className="flex flex-col">
          <span className={`font-black text-slate-900 tracking-tight leading-none ${text}`}>
            INSTITUTO TECNOLÓGICO
          </span>
          <span className="font-extrabold text-blue-700 tracking-wide text-xs mt-0.5 flex items-center gap-1.5">
            ING DATA COMP
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
            R.M. No. 0397/2024
          </span>
        </div>
      )}
    </div>
  );
};
