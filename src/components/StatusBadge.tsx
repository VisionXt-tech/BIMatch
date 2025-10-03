import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, FileText, Calendar, AlertCircle, RotateCcw, MessageSquare } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

/**
 * Application Status Types
 * Maps to Firestore applicationStatus field
 */
export type ApplicationStatus =
  | 'inviata'
  | 'in_revisione'
  | 'preselezionata'
  | 'colloquio_proposto'
  | 'colloquio_accettato_prof'
  | 'colloquio_rifiutato_prof'
  | 'colloquio_ripianificato_prof'
  | 'rifiutata'
  | 'ritirata'
  | 'accettata';

/**
 * Project Status Types
 * Maps to Firestore project status field
 */
export type ProjectStatus = 'attivo' | 'in_revisione' | 'completato' | 'chiuso' | 'bozza';

/**
 * Status Configuration
 * Defines visual appearance and text for each status
 */
interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  icon: LucideIcon;
  className?: string;
}

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  inviata: {
    label: 'Inviata',
    variant: 'info',
    icon: FileText,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
  },
  in_revisione: {
    label: 'In Revisione',
    variant: 'warning',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
  },
  preselezionata: {
    label: 'Preselezionata',
    variant: 'info',
    icon: CheckCircle2,
    className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-300',
  },
  colloquio_proposto: {
    label: 'Colloquio Proposto',
    variant: 'info',
    icon: Calendar,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300',
  },
  colloquio_accettato_prof: {
    label: 'Colloquio Confermato',
    variant: 'success',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300',
  },
  colloquio_rifiutato_prof: {
    label: 'Colloquio Rifiutato',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300',
  },
  colloquio_ripianificato_prof: {
    label: 'Ripianificazione Richiesta',
    variant: 'warning',
    icon: RotateCcw,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300',
  },
  rifiutata: {
    label: 'Rifiutata',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300',
  },
  ritirata: {
    label: 'Ritirata',
    variant: 'secondary',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300',
  },
  accettata: {
    label: 'Accettata',
    variant: 'success',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
  },
};

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  attivo: {
    label: 'Attivo',
    variant: 'success',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
  },
  in_revisione: {
    label: 'In Revisione',
    variant: 'warning',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
  },
  completato: {
    label: 'Completato',
    variant: 'secondary',
    icon: CheckCircle2,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
  },
  chiuso: {
    label: 'Chiuso',
    variant: 'secondary',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300',
  },
  bozza: {
    label: 'Bozza',
    variant: 'outline',
    icon: FileText,
    className: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-300',
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus | ProjectStatus;
  type: 'application' | 'project';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * StatusBadge Component
 * Displays semantic status badges with icons and colors
 *
 * @example
 * // Application status
 * <StatusBadge status="in_revisione" type="application" showIcon />
 *
 * // Project status
 * <StatusBadge status="attivo" type="project" showIcon size="lg" />
 */
export function StatusBadge({
  status,
  type,
  showIcon = true,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const config =
    type === 'application'
      ? APPLICATION_STATUS_CONFIG[status as ApplicationStatus]
      : PROJECT_STATUS_CONFIG[status as ProjectStatus];

  if (!config) {
    console.warn(`Unknown status: ${status} for type: ${type}`);
    return null;
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} font-medium inline-flex items-center gap-1.5 ${className}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </Badge>
  );
}

/**
 * StatusBadgeGroup Component
 * Displays multiple status badges in a horizontal layout
 *
 * @example
 * <StatusBadgeGroup>
 *   <StatusBadge status="attivo" type="project" showIcon />
 *   <StatusBadge status="in_revisione" type="application" showIcon />
 * </StatusBadgeGroup>
 */
interface StatusBadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadgeGroup({ children, className = '' }: StatusBadgeGroupProps) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
}

/**
 * Utility function to get human-readable status text
 */
export function getStatusLabel(status: ApplicationStatus | ProjectStatus, type: 'application' | 'project'): string {
  const config =
    type === 'application'
      ? APPLICATION_STATUS_CONFIG[status as ApplicationStatus]
      : PROJECT_STATUS_CONFIG[status as ProjectStatus];

  return config?.label || status;
}

/**
 * Utility function to determine if a status is "positive"
 * Used for conditional rendering of UI elements
 */
export function isPositiveStatus(status: ApplicationStatus | ProjectStatus): boolean {
  const positiveStatuses = ['accettata', 'colloquio_accettato_prof', 'preselezionata', 'attivo', 'completato'];
  return positiveStatuses.includes(status);
}

/**
 * Utility function to determine if a status is "negative"
 */
export function isNegativeStatus(status: ApplicationStatus | ProjectStatus): boolean {
  const negativeStatuses = ['rifiutata', 'ritirata', 'colloquio_rifiutato_prof', 'chiuso'];
  return negativeStatuses.includes(status);
}

/**
 * Utility function to determine if a status is "pending/waiting"
 */
export function isPendingStatus(status: ApplicationStatus | ProjectStatus): boolean {
  const pendingStatuses = ['inviata', 'in_revisione', 'colloquio_proposto', 'colloquio_ripianificato_prof', 'bozza'];
  return pendingStatuses.includes(status);
}
