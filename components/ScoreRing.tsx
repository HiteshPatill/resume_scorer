'use client';

import { useEffect, useRef, useState } from 'react';
import { getScoreColor } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
}

export function ScoreRing({
  score,
  size = 220,
  strokeWidth = 8,
  animationDuration = 1500,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const svgRef = useRef<SVGCircleElement>(null);
  const animationRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const color = getScoreColor(score);

  useEffect(() => {
    const startTime = Date.now();
    const startScore = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing function for smooth animation (easeOut cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (score - startScore) * easeOut);

      setDisplayScore(currentScore);

      // Animate SVG stroke-dashoffset
      if (svgRef.current) {
        const currentOffset =
          circumference - (currentScore / 100) * circumference;
        svgRef.current.style.strokeDashoffset = `${currentOffset}`;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, animationDuration, circumference]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.2))' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E1E2E"
            strokeWidth={strokeWidth}
          />
          {/* Animated score circle */}
          <circle
            ref={svgRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            style={{
              transition: 'stroke 0.3s ease',
            }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-white">
            {displayScore}
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400">ATS Score</p>
      </div>
    </div>
  );
}
