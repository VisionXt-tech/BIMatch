
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
import { LogOut, User, LayoutDashboard, Briefcase, Building, Search } from 'lucide-react';
import Logo from './Logo';
import { ROUTES, ROLES } from '@/constants';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_PADDING = '1rem'; // Corresponds to px-4
// A common max-width for containers, adjust if your theme uses something different (e.g., theme('screens.xl'))
const DEFAULT_CONTAINER_MAX_WIDTH = '1280px';

const Navbar = () => {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Initial style for SSR and first client render (mimics container behavior)
  const initialNavStyle: React.CSSProperties = {
    maxWidth: DEFAULT_CONTAINER_MAX_WIDTH,
    marginInline: 'auto',
    paddingLeft: DEFAULT_PAGE_PADDING,
    paddingRight: DEFAULT_PAGE_PADDING,
  };

  const [currentNavStyle, setCurrentNavStyle] = useState<React.CSSProperties>(initialNavStyle);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const onDashboard = pathname.startsWith(ROUTES.DASHBOARD);
      if (onDashboard) {
        setCurrentNavStyle({
          maxWidth: 'none', // Full width for dashboard nav content area
          marginInline: '0',
          paddingLeft: `var(--navbar-content-padding-left, ${DEFAULT_PAGE_PADDING})`,
          paddingRight: DEFAULT_PAGE_PADDING,
        });
      } else {
        setCurrentNavStyle(initialNavStyle); // Revert to container style for non-dashboard
      }
    }
  }, [mounted, pathname, initialNavStyle]); // Added initialNavStyle to dependency array as it's used in the effect

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
    router.push(ROUTES.HOME);
  };

  const dashboardLink = userProfile?.role === ROLES.PROFESSIONAL ? ROUTES.DASHBOARD_PROFESSIONAL : ROUTES.DASHBOARD_COMPANY;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="w-full"> {/* Outer div is always w-full */}
        <nav
          className="py-3 flex justify-between items-center" // Base structural classes
          style={currentNavStyle} // Style is now state-driven, defaulting to non-dashboard
        >
          <Logo />
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Conditional rendering for "Cerca Professionisti" - only if mounted */}
            {mounted && (!pathname.startsWith(ROUTES.DASHBOARD) || (userProfile && userProfile.role === ROLES.COMPANY)) && (
              <Button variant="ghost" asChild>
                <Link href={ROUTES.PROFESSIONALS_MARKETPLACE}>
                  <Search className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Cerca Professionisti</span>
                </Link>
              </Button>
            )}

            {/* Auth section: Skeleton if not mounted or auth is loading. */}
            {!mounted || (mounted && loading) ? (
              <div className="h-10 w-28 md:w-40 bg-muted rounded-md animate-pulse"></div>
            ) : mounted && user && userProfile ? (
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
                  <DropdownMenuItem onClick={() => router.push(dashboardLink)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  {userProfile.role === ROLES.PROFESSIONAL && (
                    <DropdownMenuItem onClick={() => router.push(ROUTES.DASHBOARD_PROFESSIONAL_PROFILE)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Il Mio Profilo</span>
                    </DropdownMenuItem>
                  )}
                   {userProfile.role === ROLES.COMPANY && (
                    <DropdownMenuItem onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROFILE)}>
                      <Building className="mr-2 h-4 w-4" />
                      <span>Profilo Azienda</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted ? ( 
              <>
                <Button variant="ghost" asChild>
                  <Link href={ROUTES.LOGIN}>Accedi</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>Registrati</Button>
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
            ) : null } {/* Fallback for auth section if !mounted */}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
