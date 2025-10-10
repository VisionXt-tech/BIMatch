import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface DashboardStatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: number;
  loading?: boolean;
  className?: string;
  href?: string;
}

export function DashboardStat({
  icon: Icon,
  label,
  value,
  trend,
  loading,
  className,
  href
}: DashboardStatProps) {
  const cardContent = (
    <Card className={cn(
      "border border-gray-200 bg-white h-full transition-all hover:border-gray-400 hover:shadow-md",
      className
    )}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            {/* Label with proper sizing and weight */}
            <p className="text-sm font-normal text-gray-600">
              {label}
            </p>
            {/* Value with consistent sizing and tabular numbers */}
            <p className="text-lg font-semibold text-gray-900 tabular-nums">
              {loading ? '-' : value}
            </p>
          </div>
          {/* Icon with consistent styling */}
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        {/* Optional trend indicator */}
        {trend !== undefined && (
          <div className={cn(
            "mt-4 text-sm font-medium",
            trend > 0 ? "text-gray-900" : "text-gray-600"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="h-full">{cardContent}</Link>;
  }

  return cardContent;
}