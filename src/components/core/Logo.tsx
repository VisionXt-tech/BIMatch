import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const Logo = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const logoClasses = isHomePage 
    ? "flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
    : "flex items-center space-x-2 text-primary hover:text-accent transition-colors";
  
  const logoSrc = isHomePage ? "/BIM (1).png" : "/BIM.png";
  
  return (
    <Link href="/" className={logoClasses}>
      <Image 
        src={logoSrc}
        alt="BIM Logo"
        width={32}
        height={32}
        className="w-8 h-8"
      />
      <span className="text-2xl font-bold">BIMatch</span>
    </Link>
  );
};

export default Logo;
