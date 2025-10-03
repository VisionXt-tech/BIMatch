import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Project Card Skeleton
 * Loading placeholder per card progetti con shimmer effect
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="shadow-md animate-pulse">
      <CardHeader className="p-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        {/* Company info */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Skills */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Software */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-18 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t flex justify-between items-center">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </CardFooter>
    </Card>
  );
}

/**
 * Dashboard Card Skeleton
 * Loading placeholder per dashboard action cards
 */
export function DashboardCardSkeleton() {
  return (
    <Card className="shadow-md animate-pulse">
      <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

/**
 * List Item Skeleton
 * Loading placeholder per liste generiche
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

/**
 * Profile Card Skeleton
 * Loading placeholder per profile cards
 */
export function ProfileCardSkeleton() {
  return (
    <Card className="shadow-md animate-pulse">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />

        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
