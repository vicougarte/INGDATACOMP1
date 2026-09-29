import React from 'react';
import { IngDataCompLogo } from './IngDataCompLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  customLogoUrl?: string | null;
}

/**
 * Re-exporta el logotipo oficial de INSTITUTO TECNOLÓGICO ING DATA COMP
 */
export const BolivianoArgentinoLogo: React.FC<LogoProps> = (props) => {
  return <IngDataCompLogo {...props} />;
};

export default BolivianoArgentinoLogo;
