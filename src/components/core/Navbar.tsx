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
import { LogOut, User, LayoutDashboard, Briefcase, Building } from 'lucide-react';
import Logo from './Logo';
import { ROUTES, ROLES } from '@/constants';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const dashboardLink = userProfile?.role === ROLES.PROFESSIONAL ? ROUTES.DASHBOARD_PROFESSIONAL : ROUTES.DASHBOARD_COMPANY;

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-10 w-20 animate-pulse bg-muted rounded-md"></div>
          ) : user && userProfile ? (
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
          ) : (
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
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
