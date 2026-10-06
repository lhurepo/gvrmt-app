import { SessionLevel } from '../types';

export const LEVEL_COLORS: Record<SessionLevel, { bg: string; text: string; border: string; label: string }> = {
  beginner: {
    bg: '#d1fae5',
    text: '#065f46',
    border: '#6ee7b7',
    label: 'Beginner'
  },
  intermediate: {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fcd34d',
    label: 'Intermediate'
  },
  advanced: {
    bg: '#fee2e2',
    text: '#991b1b',
    border: '#fca5a5',
    label: 'Advanced'
  }
};

export function getLevelColor(level?: SessionLevel) {
  if (!level) return LEVEL_COLORS.beginner;
  return LEVEL_COLORS[level];
}
