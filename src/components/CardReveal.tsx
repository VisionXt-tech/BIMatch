'use client';

import { useEffect, useRef, useState } from 'react';

interface CardRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export default function CardReveal({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}: CardRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
      }
    );

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calcola il progresso dello scroll (0 = non visibile, 1 = completamente visibile)
      const progress = Math.max(0, Math.min(1,
        (windowHeight - elementTop) / (windowHeight + elementHeight / 2)
      ));

      setScrollProgress(progress);
    };

    if (ref.current) {
      observer.observe(ref.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calcola le trasformazioni in base alla direzione
  const getTransform = () => {
    if (isVisible) {
      // Effetto parallax leggero quando la card è visibile
      const parallax = (scrollProgress - 0.5) * 10;
      return `translateY(${parallax}px) scale(1)`;
    }

    // Posizione iniziale prima dell'animazione
    switch (direction) {
      case 'left':
        return 'translateX(-80px) scale(0.9)';
      case 'right':
        return 'translateX(80px) scale(0.9)';
      case 'down':
        return 'translateY(-80px) scale(0.9)';
      case 'up':
      default:
        return 'translateY(80px) scale(0.9)';
    }
  };

  const getRotation = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return 'rotateY(-15deg)';
        case 'right':
          return 'rotateY(15deg)';
        default:
          return 'rotateX(0deg)';
      }
    }
    return 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `${getTransform()} ${getRotation()}`,
        transition: `
          opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,
          transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms
        `,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </div>
  );
}
