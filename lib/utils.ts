import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color constants for consistent theming
export const COLORS = {
  // Status indicators
  success: '#22C55E',
  successAlt: '#10B981',
  warning: '#EAB308',
  warningAlt: '#F59E0B',
  error: '#EF4444',
  
  // Neutral
  gray: '#9CA3AF',
  indigo: '#6366F1',
}

// Score thresholds with corresponding colors
export function getScoreColor(score: number): string {
  if (score >= 75) return COLORS.success;
  if (score >= 50) return COLORS.warning;
  return COLORS.error;
}

// Score thresholds for improvements (critical, warning, suggestion)
export function getImprovementColor(type: 'critical' | 'warning' | 'suggestion'): string {
  switch (type) {
    case 'critical':
      return COLORS.error;
    case 'warning':
      return COLORS.warningAlt;
    case 'suggestion':
    default:
      return COLORS.indigo;
  }
}
