import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
      <span className="text-2xl font-bold">BIMatch</span>
    </Link>
  );
};

export default Logo;
