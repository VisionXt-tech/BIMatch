
import Link from 'next/link';
import { ROUTES } from '@/constants'; // Import ROUTES

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted/50 text-muted-foreground py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {currentYear === 2025 ? 2024 : currentYear} VisionXt. Tutti i diritti riservati.
        </p>
        <div className="mt-2 space-x-4">
          <Link href={ROUTES.PRIVACY_POLICY} className="hover:text-primary transition-colors text-xs">
            Privacy Policy
          </Link>
          <Link href={ROUTES.TERMS_OF_SERVICE} className="hover:text-primary transition-colors text-xs">
            Termini di Servizio
          </Link>
          <Link href={ROUTES.FAQ} className="hover:text-primary transition-colors text-xs">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
