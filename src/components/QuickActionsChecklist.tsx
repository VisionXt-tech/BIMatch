'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProfileStrengthResult } from '@/hooks/useProfileStrength';

interface QuickAction {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  link: string;
  icon: string;
}

interface QuickActionsChecklistProps {
  strengthData: ProfileStrengthResult;
  profileLink: string;
  className?: string;
}

export function QuickActionsChecklist({
  strengthData,
  profileLink,
  className,
}: QuickActionsChecklistProps) {
  // Generate quick actions based on next milestone suggestions
  const actions: QuickAction[] = [];

  if (strengthData.nextMilestone && strengthData.nextMilestone.suggestions.length > 0) {
    strengthData.nextMilestone.suggestions.forEach((suggestion, index) => {
      let points = 5;
      let icon = '⚡';
      let link = profileLink;

      // Assign appropriate points and icons based on suggestion content
      if (suggestion.includes('CV')) {
        points = 8;
        icon = '📄';
      } else if (suggestion.includes('certificazione') || suggestion.includes('Albo')) {
        points = 10;
        icon = '🏅';
      } else if (suggestion.includes('competenze BIM')) {
        points = 15;
        icon = '💡';
      } else if (suggestion.includes('software')) {
        points = 8;
        icon = '💻';
      } else if (suggestion.includes('portfolio') || suggestion.includes('LinkedIn')) {
        points = 5;
        icon = '🔗';
      }

      actions.push({
        id: `action-${index}`,
        label: suggestion,
        points,
        completed: false,
        link,
        icon,
      });
    });
  }

  // If profile is complete, show congratulations
  if (strengthData.totalStrength === 100) {
    return (
      <Card className={cn('border-2 border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20', className)}>
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-6xl">🏆</div>
          <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">
            Profilo Completo!
          </h3>
          <p className="text-sm text-muted-foreground">
            Hai raggiunto il massimo livello. Il tuo profilo è ora al top della visibilità!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-500">
            <span>💎 {strengthData.powerPoints} Power Points</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border-2 hover:border-primary/50 transition-colors', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full"></div>
          💪 Rafforza il Tuo Profilo
        </CardTitle>
        {strengthData.nextMilestone && (
          <p className="text-xs text-muted-foreground mt-1">
            Mancano <span className="font-semibold text-foreground">{strengthData.nextMilestone.missing} punti</span> per raggiungere{' '}
            <span className="font-semibold text-primary">{strengthData.nextMilestone.label}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.id} href={action.link} className="block">
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all hover:border-primary hover:shadow-md cursor-pointer group',
                action.completed
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'bg-muted/30 hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    action.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-muted-foreground/30 group-hover:border-primary'
                  )}
                >
                  {action.completed && <Check className="h-4 w-4 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.label}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {action.icon} +{action.points}pts
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Total potential points */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Punti totali disponibili:</span>
            <span className="font-bold text-primary">
              +{actions.reduce((sum, action) => sum + (action.completed ? 0 : action.points), 0)} pts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
