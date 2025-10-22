// Official Universitas Bhayangkara Jakarta Raya Logo
import logoUbhara from 'figma:asset/aeb758722dc8571d011c2a4933526f38c0cdb0b9.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24'
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <img 
      src={logoUbhara} 
      alt="Logo Universitas Bhayangkara Jakarta Raya" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}

// Also export the raw image URL for public folder usage
export const logoUrl = logoUbhara;
