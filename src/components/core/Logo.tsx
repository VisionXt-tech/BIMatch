import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const logoClasses = isHomePage 
    ? "flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
    : "flex items-center space-x-2 text-primary hover:text-accent transition-colors";
  
  return (
    <Link href="/" className={logoClasses}>
      <span className="text-2xl font-bold">BIMatch</span>
    </Link>
  );
};

export default Logo;
