import { useEffect, useState } from 'react';

/**
 * Custom hook for animating number changes
 * Smoothly transitions from old value to new value
 *
 * @param targetValue - The target number to animate to
 * @param duration - Animation duration in milliseconds (default: 300ms)
 * @returns The current animated value
 *
 * @example
 * const animatedCount = useCountAnimation(projectCount);
 * return <span>{animatedCount}</span>;
 */
export function useCountAnimation(targetValue: number, duration: number = 300): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [prevValue, setPrevValue] = useState(targetValue);

  useEffect(() => {
    // If value hasn't changed, don't animate
    if (targetValue === prevValue) return;

    const startValue = displayValue;
    const difference = targetValue - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutCubic for smooth deceleration)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(startValue + difference * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setPrevValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, displayValue, prevValue]);

  return displayValue;
}
