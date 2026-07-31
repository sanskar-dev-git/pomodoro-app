export const SESSION_TYPES = {
  WORK: 'WORK',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
};

export const DEFAULT_CONFIG = {
  [SESSION_TYPES.WORK]: 25 * 60,       // 25 minutes in seconds
  [SESSION_TYPES.SHORT_BREAK]: 5 * 60,  // 5 minutes in seconds
  [SESSION_TYPES.LONG_BREAK]: 15 * 60,  // 15 minutes in seconds
};

export const THEME_COLORS = {
  [SESSION_TYPES.WORK]: '#FF6B6B',       // Energetic Red
  [SESSION_TYPES.SHORT_BREAK]: '#4ECDC4',// Refreshing Teal
  [SESSION_TYPES.LONG_BREAK]: '#45B7D1', // Calming Blue
};