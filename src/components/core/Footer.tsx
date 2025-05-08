import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {currentYear} BIMatch. Tutti i diritti riservati.
        </p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors text-xs">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-primary transition-colors text-xs">
            Termini di Servizio
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
