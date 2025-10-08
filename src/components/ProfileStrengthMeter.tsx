'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProfileStrengthResult } from '@/hooks/useProfileStrength';

interface ProfileStrengthMeterProps {
  strengthData: ProfileStrengthResult;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { radius: 40, stroke: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { radius: 60, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-sm' },
  lg: { radius: 80, stroke: 10, fontSize: 'text-3xl', labelSize: 'text-base' },
};

const LEVEL_GRADIENTS = {
  beginner: 'from-gray-400 to-gray-500',
  growing: 'from-blue-400 to-blue-600',
  solid: 'from-purple-500 to-purple-700',
  expert: 'from-amber-500 via-orange-500 to-red-500',
};

export function ProfileStrengthMeter({
  strengthData,
  size = 'md',
  showDetails = true,
  className,
}: ProfileStrengthMeterProps) {
  const [animatedStrength, setAnimatedStrength] = useState(0);
  const config = SIZE_CONFIG[size];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStrength(strengthData.totalStrength);
    }, 100);
    return () => clearTimeout(timer);
  }, [strengthData.totalStrength]);

  const radius = config.radius;
  const strokeWidth = config.stroke;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedStrength / 100) * circumference;

  const gradientId = `gradient-${strengthData.level}`;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Circular Progress Ring */}
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Define gradient */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {strengthData.level === 'expert' && (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </>
              )}
              {strengthData.level === 'solid' && (
                <>
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </>
              )}
              {strengthData.level === 'growing' && (
                <>
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </>
              )}
              {strengthData.level === 'beginner' && (
                <>
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#6b7280" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress circle */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: strengthData.level === 'expert' ? 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.5))' : undefined
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('font-bold bg-gradient-to-r bg-clip-text text-transparent',
            LEVEL_GRADIENTS[strengthData.level],
            config.fontSize
          )}>
            {Math.round(animatedStrength)}%
          </div>
          <div className={cn('text-muted-foreground font-medium', config.labelSize)}>
            {strengthData.levelEmoji}
          </div>
        </div>
      </div>

      {/* Label */}
      {showDetails && (
        <div className="mt-3 text-center space-y-1">
          <p className={cn('font-semibold', config.labelSize)}>
            {strengthData.levelLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            💎 {strengthData.powerPoints} Power Points
          </p>
        </div>
      )}
    </div>
  );
}

interface ProfileStrengthBarProps {
  strengthData: ProfileStrengthResult;
  showBreakdown?: boolean;
  className?: string;
}

export function ProfileStrengthBar({
  strengthData,
  showBreakdown = false,
  className,
}: ProfileStrengthBarProps) {
  const [animatedStrength, setAnimatedStrength] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStrength(strengthData.totalStrength);
    }, 100);
    return () => clearTimeout(timer);
  }, [strengthData.totalStrength]);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Completamento Profilo</span>
          <span className="text-lg">{strengthData.levelEmoji}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{Math.round(animatedStrength)}%</span>
          <span className="text-xs text-muted-foreground">💎 {strengthData.powerPoints} pts</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r',
            LEVEL_GRADIENTS[strengthData.level]
          )}
          style={{ width: `${animatedStrength}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {strengthData.levelLabel}
      </p>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Info Base:</span>
            <span className="font-medium">{strengthData.breakdown.baseInfo}/{20}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Competenze:</span>
            <span className="font-medium">{strengthData.breakdown.skills}/{25}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Esperienza:</span>
            <span className="font-medium">{strengthData.breakdown.experience}/{15}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Certificazioni:</span>
            <span className="font-medium">{strengthData.breakdown.certifications}/{20}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Portfolio:</span>
            <span className="font-medium">{strengthData.breakdown.portfolio}/{10}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Professional:</span>
            <span className="font-medium">{strengthData.breakdown.professional}/{10}</span>
          </div>
        </div>
      )}
    </div>
  );
}
