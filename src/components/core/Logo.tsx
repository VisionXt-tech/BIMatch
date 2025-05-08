import Link from 'next/link';
import { Building2 } from 'lucide-react'; // Using Building2 as a generic construction icon

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
      <Building2 className="h-8 w-8" />
      <span className="text-2xl font-bold">BIMatch</span>
    </Link>
  );
};

export default Logo;
