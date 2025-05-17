
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES, ROLES } from '@/constants';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarSeparator, SidebarGroup } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Briefcase, LayoutDashboard, FolderPlus, Building, Search, Users } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

const ProfessionalNavItems = [
  { href: ROUTES.DASHBOARD_PROFESSIONAL, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_PROFESSIONAL_PROFILE, label: 'Il Mio Profilo', icon: User },
  { href: ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS, label: 'Progetti Disponibili', icon: Search },
];

const CompanyNavItems = [
  { href: ROUTES.DASHBOARD_COMPANY, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_COMPANY_PROFILE, label: 'Profilo Azienda', icon: Building },
  { href: ROUTES.DASHBOARD_COMPANY_POST_PROJECT, label: 'Pubblica Progetto', icon: FolderPlus },
  { href: ROUTES.DASHBOARD_COMPANY_PROJECTS, label: 'I Miei Progetti', icon: Briefcase },
  { href: ROUTES.PROFESSIONALS_MARKETPLACE, label: 'Cerca Professionisti', icon: Users },
];

// These CSS variables are set by SidebarProvider and consumed by Navbar and SidebarInset
const NAVBAR_HEIGHT_CSS_VAR_VALUE = "4rem"; // Assumes Navbar is h-16 (64px)

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = userProfile.role === ROLES.PROFESSIONAL ? ProfessionalNavItems : CompanyNavItems;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length -1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  return (
    <SidebarProvider defaultOpen> {/* defaultOpen is true by default in SidebarProvider */}
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader
          className="px-4"
          style={{ paddingTop: `var(--sidebar-header-padding-top, ${NAVBAR_HEIGHT_CSS_VAR_VALUE})` }}
        >
          {/* Logo and SidebarTrigger were removed */}
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={router.pathname === item.href}
                    tooltip={{children: item.label, side: 'right', align: 'center'}}
                  >
                    <item.icon className="h-5 w-5" />
                    {/* Corrected class: hide label only when the parent 'group' (Sidebar) has data-state="collapsed" */}
                    <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-2">
           <div className="flex items-center p-2 space-x-3 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:space-x-0">
              <Avatar className="h-9 w-9 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                <AvatarImage src={userProfile.photoURL || user.photoURL || undefined} alt={userProfile.displayName || 'User'} />
                <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
              </Avatar>
              <div className="group-data-[state=collapsed]:hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userProfile.displayName}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{userProfile.email}</p>
              </div>
            </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Logout", side: 'right', align: 'center'}}>
                <LogOut className="h-5 w-5" />
                <span className="group-data-[state=collapsed]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset
        style={{ marginTop: `var(--main-content-area-margin-top, ${NAVBAR_HEIGHT_CSS_VAR_VALUE})` }}
      >
        <div className="px-4 md:px-6 lg:px-8 pt-0 pb-8">
         {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
