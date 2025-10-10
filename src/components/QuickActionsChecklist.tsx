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
      <Card className={cn('border border-gray-200 bg-white', className)}>
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Profilo Completo
          </h3>
          <p className="text-sm text-gray-600">
            Il tuo profilo è ora al top della visibilità
          </p>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border border-gray-200 bg-white', className)}>
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Rafforza il Tuo Profilo
        </CardTitle>
        {strengthData.nextMilestone && (
          <p className="text-sm text-gray-600 mt-4">
            Mancano {strengthData.nextMilestone.missing} punti per {strengthData.nextMilestone.label}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-4">
        {actions.map((action) => (
          <Link key={action.id} href={action.link} className="block">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded bg-white">
              <div className="flex-1">
                <p className="text-sm text-gray-900">{action.label}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600">
                  +{action.points}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </Link>
        ))}

        {/* Total potential points */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Punti disponibili</span>
            <span className="font-semibold text-gray-900">
              +{actions.reduce((sum, action) => sum + (action.completed ? 0 : action.points), 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
