// API Service module for handling all API calls to the backend
import { API_BASE_URL } from './config.js';

// Default fetch options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// User API calls
export async function getUsers() {
  return fetchAPI('/users');
}

export async function createUser(userData) {
  return fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function searchUsers(query) {
  return fetchAPI(`/users/search?q=${encodeURIComponent(query)}`);
}

// Faction API calls
export async function getFactions() {
  return fetchAPI('/factions');
}

// Game API calls
export async function getGames() {
  return fetchAPI('/games');
}

export async function reportGame(gameData) {
  return fetchAPI('/games', {
    method: 'POST',
    body: JSON.stringify(gameData)
  });
}

// Statistics API calls
export async function getLeaderboard() {
  return fetchAPI('/stats/leaderboard');
}

export async function getMostPlayedLeaderboard() {
  return fetchAPI('/stats/most-played');
}

export async function getFactionWinsLeaderboard() {
  return fetchAPI('/stats/factions/wins');
}

export async function getFactionPopularityLeaderboard() {
  return fetchAPI('/stats/factions/popularity');
}

export async function getPlayerComparison(player1Id, player2Id) {
  return fetchAPI(`/stats/player-comparison?player1=${player1Id}&player2=${player2Id}`);
}

export async function getPlayerStats(userId) {
  return fetchAPI(`/stats/player?id=${userId}`);
} 

export function getFactionLogo(factionName) {
  if (!factionName) return "Unknown";
  const logoPath = `../img/factions/faction-${factionName.toLowerCase().replace(/ /g, '-')}.png`;
  return `<img src="${logoPath}" alt="${factionName}" class="faction-logo"> ${factionName || "Unknown"}`;
}