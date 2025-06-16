
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, LayoutDashboard, Briefcase, Building, Search, Menu, HelpCircle } from 'lucide-react'; // Aggiunta HelpCircle
import Logo from './Logo';
import { ROUTES, ROLES, ProfessionalNavItems, CompanyNavItems } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const DEFAULT_NAVBAR_PAGE_CONTENT_PADDING = '1rem';
const DEFAULT_CONTAINER_MAX_WIDTH = 'none';

const initialNavStyle: React.CSSProperties = {
  maxWidth: '1280px',
  marginInline: 'auto',
  paddingLeft: DEFAULT_NAVBAR_PAGE_CONTENT_PADDING,
  paddingRight: DEFAULT_NAVBAR_PAGE_CONTENT_PADDING,
};

const dashboardNavStyle: React.CSSProperties = {
  maxWidth: DEFAULT_CONTAINER_MAX_WIDTH,
  marginInline: 'auto',
  paddingLeft: DEFAULT_NAVBAR_PAGE_CONTENT_PADDING,
  paddingRight: DEFAULT_NAVBAR_PAGE_CONTENT_PADDING,
};


const Navbar = () => {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [navStyleToApply, setNavStyleToApply] = useState<React.CSSProperties>(initialNavStyle);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted) {
      const isDashboard = pathname.startsWith(ROUTES.DASHBOARD);
      setNavStyleToApply(isDashboard ? dashboardNavStyle : initialNavStyle);
    }
  }, [mounted, pathname]);


  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  const dashboardLink = userProfile?.role === ROLES.PROFESSIONAL ? ROUTES.DASHBOARD_PROFESSIONAL : ROUTES.DASHBOARD_COMPANY;

  const activeRoleNavItems = userProfile?.role === ROLES.PROFESSIONAL
    ? ProfessionalNavItems
    : userProfile?.role === ROLES.COMPANY
    ? CompanyNavItems
    : [];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {activeRoleNavItems.map((item) => {
        if (userProfile?.role === ROLES.COMPANY && item.href === ROUTES.PROFESSIONALS_MARKETPLACE) {
          return null;
        }
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "justify-start text-sm",
              pathname === item.href ? "font-semibold text-primary bg-accent/50" : "text-muted-foreground hover:text-foreground",
              mobile ? "w-full" : "px-2 lg:px-3 h-9"
            )}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
          >
            <Link href={item.href}>
              <item.icon className={cn("h-4 w-4", mobile ? "mr-2" : "md:mr-1 lg:mr-2")} />
              <span className={cn(mobile ? "" : "hidden md:inline")}>{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </>
  );

  const isDashboardPageForContent = mounted && pathname.startsWith(ROUTES.DASHBOARD);


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="w-full">
        <nav
          className="py-3 flex items-center"
          style={navStyleToApply} 
        >
          <Logo />
          
          {mounted && (
            <div className="ml-auto flex items-center space-x-1 md:space-x-2">
              {userProfile?.role === ROLES.COMPANY && (
                   <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                      <Link href={ROUTES.PROFESSIONALS_MARKETPLACE}>
                          <Search className="mr-2 h-4 w-4" />Cerca Professionisti
                      </Link>
                  </Button>
              )}

              {user && userProfile && isDashboardPageForContent && (
                <div className="hidden md:flex items-center space-x-1">
                  <NavLinks />
                </div>
              )}

              {loading ? (
                <div className="h-10 w-28 md:w-32 bg-muted rounded-md animate-pulse"></div>
              ) : user && userProfile ? (
                <>
                  {!isDashboardPageForContent && (
                    <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                      <Link href={dashboardLink}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Vai alla Dashboard
                      </Link>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userProfile.photoURL || user.photoURL || undefined} alt={userProfile.displayName || user.displayName || 'User'} />
                          <AvatarFallback>{getInitials(userProfile.displayName || user.displayName)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userProfile.displayName || user.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!isDashboardPageForContent && (
                         <DropdownMenuItem onClick={() => router.push(dashboardLink)}>
                           <LayoutDashboard className="mr-2 h-4 w-4" />
                           <span>Vai alla Dashboard</span>
                         </DropdownMenuItem>
                      )}
                      {isDashboardPageForContent && activeRoleNavItems.filter(item => item.href !== dashboardLink).map(item => (
                         <DropdownMenuItem key={`dropdown-${item.href}`} onClick={() => router.push(item.href)} className="md:hidden">
                           <item.icon className="mr-2 h-4 w-4" />
                           <span>{item.label}</span>
                         </DropdownMenuItem>
                      ))}
                       {isDashboardPageForContent && userProfile.role === ROLES.COMPANY && (
                         <DropdownMenuItem onClick={() => router.push(ROUTES.PROFESSIONALS_MARKETPLACE)} className="md:hidden">
                           <Search className="mr-2 h-4 w-4" />
                           <span>Cerca Professionisti</span>
                         </DropdownMenuItem>
                       )}
                      {isDashboardPageForContent && <DropdownMenuSeparator className="md:hidden"/>}
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => alert('Contenuto "Come Funziona?" da implementare')} // Placeholder
                    className="hidden md:inline-flex"
                  >
                    <HelpCircle className="mr-1 h-4 w-4"/> Come Funziona?
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.LOGIN}>Accedi</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">Registrati</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.REGISTER_PROFESSIONAL)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Come Professionista</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.REGISTER_COMPANY)}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Come Azienda</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) }

              {user && userProfile && isDashboardPageForContent && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Apri menu navigazione</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[260px] p-4">
                    <div className="mb-4">
                      <Logo />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <NavLinks mobile={true} />
                       {userProfile.role === ROLES.COMPANY && (
                          <Button
                              variant="ghost"
                              asChild
                              className={cn(
                              "justify-start text-sm",
                              pathname === ROUTES.PROFESSIONALS_MARKETPLACE ? "font-semibold text-primary bg-accent/50" : "text-muted-foreground hover:text-foreground",
                              "w-full"
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                          >
                              <Link href={ROUTES.PROFESSIONALS_MARKETPLACE}>
                                  <Search className="mr-2 h-4 w-4" />
                                  <span>Cerca Professionisti</span>
                              </Link>
                          </Button>
                       )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
