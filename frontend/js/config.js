// Configuration settings for the application

// API base URL - this will be the same domain in production
export const API_BASE_URL = '/api';

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

// Utility functions
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${value}%`;
}

// Ranking display formats
export const RANKING_DISPLAY = {
  1: '1st (Winner)',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th'
};

// Maximum number of players in a game
export const MAX_PLAYERS = 4;

// Minimum number of players in a game
export const MIN_PLAYERS = 2; 