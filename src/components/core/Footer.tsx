
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const getFooterClasses = () => {
    const isDashboard = pathname.startsWith('/dashboard');
    const needsScroll = pathname.includes('/profile') ||
                       pathname.includes('/notifications') ||
                       pathname.includes('/candidates') ||
                       pathname.includes('/edit');
    if (isHomePage) {
      return "backdrop-blur-md text-white/80 py-4 sm:py-6 md:py-8 homepage-transparent";
    }
    if (isDashboard && !needsScroll) {
      return "bg-gray-50 text-gray-600 py-3 sm:py-4";
    }
    if (isDashboard && needsScroll) {
      return "bg-gray-50 text-gray-600 py-3 sm:py-4 mt-3 sm:mt-4";
    }
    return "bg-gray-50 text-gray-600 py-4 sm:py-6 md:py-8";
  };

  const getLinkClasses = () => {
    if (isHomePage) {
      return "text-xs sm:text-sm text-white/80 hover:text-white transition-colors";
    }
    return "text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors";
  };

  const customFooterStyle = isHomePage ? {
    backgroundColor: 'transparent',
    background: 'none',
    backgroundImage: 'none',
    '--tw-bg-opacity': '0'
  } as React.CSSProperties : undefined;

  return (
    <footer
      className={getFooterClasses()}
      style={customFooterStyle}
    >
      <div className="container mx-auto px-3 sm:px-4 text-center">
        <p className="text-xs sm:text-sm">
          &copy; 2025 VisionXt. Tutti i diritti riservati.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1">
          <Link href={ROUTES.PRIVACY_POLICY} className={getLinkClasses()}>
            Privacy Policy
          </Link>
          <Link href={ROUTES.TERMS_OF_SERVICE} className={getLinkClasses()}>
            Termini di Servizio
          </Link>
          <Link href={ROUTES.FAQ} className={getLinkClasses()}>
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
