/**
 * BIMatch Design System
 * Sistema unificato di spacing, sizing e layout
 * Creato: Sprint 1 - UI Improvement Plan
 */

export const DESIGN_SYSTEM = {
  // Container max widths
  container: {
    sm: 'max-w-screen-sm',      // 640px - Mobile
    md: 'max-w-screen-md',      // 768px - Tablet
    lg: 'max-w-screen-lg',      // 1024px - Desktop
    xl: 'max-w-screen-xl',      // 1280px - Large Desktop
    '2xl': 'max-w-screen-2xl',  // 1536px - Extra Large
    '3xl': 'max-w-[1920px]',    // 1920px - Full HD

    // Dashboard specific
    dashboard: 'max-w-7xl',     // 1280px - Dashboard ottimizzato
    dashboardFull: 'max-w-full', // 100% - Admin dashboard
  },

  // Page padding
  page: {
    mobile: 'px-3 py-4',      // 12px, 16px
    tablet: 'px-4 py-5',      // 16px, 20px
    desktop: 'px-6 py-6',     // 24px, 24px
    responsive: 'px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6',
  },

  // Card spacing
  card: {
    padding: {
      compact: 'p-3',       // 12px - Liste compatte
      standard: 'p-4',      // 16px - Standard (NEW DEFAULT)
      comfortable: 'p-6',   // 24px - Feature cards
    },
    gap: {
      tight: 'gap-2',       // 8px - Liste densità alta
      normal: 'gap-3',      // 12px - Standard (NEW DEFAULT)
      loose: 'gap-4',       // 16px - Sezioni separate
    }
  },

  // Stack spacing (vertical)
  stack: {
    tight: 'space-y-2',     // 8px - Elementi correlati
    normal: 'space-y-3',    // 12px - Standard (NEW DEFAULT)
    loose: 'space-y-4',     // 16px - Gruppi separati
    section: 'space-y-6',   // 24px - Solo tra sezioni principali
  },

  // Grid configurations
  grid: {
    // Projects/Items listing
    projects: {
      mobile: 'grid-cols-1',
      tablet: 'sm:grid-cols-2 md:grid-cols-3',
      desktop: 'lg:grid-cols-4 xl:grid-cols-5',
      wide: '2xl:grid-cols-6',
      full: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
    },
    // Dashboard cards
    dashboard: {
      mobile: 'grid-cols-2',
      tablet: 'md:grid-cols-3',
      desktop: 'lg:grid-cols-4',
      full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    },
    // Filters/Tags
    filters: {
      mobile: 'grid-cols-1',
      tablet: 'sm:grid-cols-2',
      desktop: 'md:grid-cols-3 lg:grid-cols-4',
      full: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    }
  },

  // Typography scale
  text: {
    hero: 'text-4xl sm:text-5xl md:text-6xl',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    heading: 'text-xl sm:text-2xl',
    subheading: 'text-lg sm:text-xl',
    body: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs',
  },

  // Component sizing
  component: {
    // Button heights
    button: {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    },
    // Card heights
    cardHeight: {
      compact: 'min-h-[240px]',  // Projects cards compatte
      standard: 'min-h-[280px]',  // Standard card
      comfortable: 'min-h-[320px]', // Feature card
    },
    // Dashboard action cards
    dashboardCard: {
      mobile: 'h-20',          // Mobile compatto
      desktop: 'sm:h-24',      // Desktop standard
    }
  }
} as const;

// Helper functions
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Preset combinations comuni
export const PRESETS = {
  dashboardPage: cn(
    DESIGN_SYSTEM.container.dashboard,
    'mx-auto',
    DESIGN_SYSTEM.page.responsive
  ),

  dashboardStack: DESIGN_SYSTEM.stack.normal,

  projectsGrid: cn(
    'grid',
    DESIGN_SYSTEM.grid.projects.full,
    DESIGN_SYSTEM.card.gap.normal
  ),

  standardCard: DESIGN_SYSTEM.card.padding.standard,

  compactCard: DESIGN_SYSTEM.card.padding.compact,
} as const;
