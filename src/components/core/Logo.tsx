import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const logoClasses = isHomePage
    ? "text-lg font-semibold text-white"
    : "text-lg font-semibold text-gray-900";

  return (
    <Link href="/" className={logoClasses}>
      BIMatch
    </Link>
  );
};

export default Logo;
