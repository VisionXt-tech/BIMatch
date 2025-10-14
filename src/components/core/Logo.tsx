import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const logoClasses = isHomePage
    ? "text-2xl font-bold text-white hover:text-white/90 transition-all duration-300 hover:scale-105"
    : "text-2xl font-bold text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105";

  return (
    <Link href="/" className={logoClasses}>
      BIMatch
    </Link>
  );
};

export default Logo;
