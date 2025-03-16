// Dashboard module for handling the main statistics page
import { 
  getLeaderboard, 
  getMostPlayedLeaderboard, 
  getFactionWinsLeaderboard, 
  getFactionPopularityLeaderboard,
  getGames,
  getFactionLogo
} from './apiService.js';
import { formatDate, formatPercent } from './config.js';

export function initDashboard() {
  // Initialize tab switching
  initTabs();
  
  // Initialize sorting
  initSorting();
  
  // Load all dashboard data
  loadDashboardData();
  
  // Add event listener to reload data when the page becomes visible
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('data-page') === 'dashboard') {
        // Reload data when navigating to the dashboard page
        loadDashboardData();
      }
    });
  });
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabGroup = button.closest('.leaderboard-tabs');
      const tabButtons = tabGroup.querySelectorAll('.tab-btn');
      const tabContents = tabGroup.parentElement.querySelectorAll('.tab-content');
      const targetTab = button.getAttribute('data-tab');
      
      // Update active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show target tab content
      tabContents.forEach(content => {
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

async function loadDashboardData() {
  // Remove any loading spinners that might exist
  document.querySelectorAll('.loading-spinner').forEach(spinner => {
    spinner.remove();
  });
  
  // Clear any existing error messages
  document.querySelectorAll('.error-message').forEach(error => {
    error.remove();
  });
  
  // Load each section independently to prevent one failure from affecting others
  loadPlayersLeaderboard();
  loadFactionsLeaderboard();
  loadRecentGames();
}

async function loadPlayersLeaderboard() {
  const tableBody = document.getElementById('winrate-leaderboard');
  
  try {
    console.log('Fetching winrate leaderboard...');
    const players = await getLeaderboard();
    console.log('Winrate leaderboard data:', players);
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Check if players is valid and has data
    if (!players || !Array.isArray(players) || players.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="8" class="empty-state">No player data available</td>';
      tableBody.appendChild(emptyRow);
      return;
    }
    
    // Render each player row
    players.forEach((player, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.user_name || 'Unknown'}</td>
        <td>${formatPercent(player.winrate || 0)}</td>
        <td>${player.avg_place || 0}</td>
        <td>${player.avg_points || 0}</td>
        <td>${player.wins || 0}</td>
        <td>${player.games_played || 0}</td>
        <td>${getFactionLogo(player.best_faction_name)} (${formatPercent(player.best_faction_winrate || 0)})</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading winrate leaderboard:', error);
    showSectionError(tableBody.parentElement.parentElement, 'Failed to load data. Please try again later.');
  }
}

async function loadFactionsLeaderboard() {
  const tableBody = document.getElementById('faction-wins-leaderboard');
  
  try {
    console.log('Fetching faction wins leaderboard...');
    const factions = await getFactionWinsLeaderboard();
    console.log('Faction wins leaderboard data:', factions);
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Check if factions is valid and has data
    if (!factions || !Array.isArray(factions) || factions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="5" class="empty-state">No faction data available</td>';
      tableBody.appendChild(emptyRow);
      return;
    }
    
    // Render each faction row
    factions.forEach((faction, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${getFactionLogo(faction.faction_name)}</td>
        <td>${faction.wins || 0}</td>
        <td>${faction.times_played || 0}</td>
        <td>${formatPercent(faction.winrate || 0)}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading faction wins leaderboard:', error);
    showSectionError(tableBody.parentElement.parentElement, 'Failed to load data. Please try again later.');
  }
}

async function loadRecentGames() {
  const gamesList = document.getElementById('recent-games-list');
  if (!gamesList) return;
  
  try {
    console.log('Fetching recent games...');
    const games = await getGames();
    console.log('Recent games data:', games);
    
    // Clear existing content
    gamesList.innerHTML = '';
    
    // Check if games is valid and has data
    if (!games || !Array.isArray(games) || games.length === 0) {
      gamesList.innerHTML = '<div class="empty-state">No games have been reported yet</div>';
      return;
    }
    
    // Get templates
    const gameCardTemplate = document.getElementById('game-card-template');
    const playerResultTemplate = document.getElementById('player-result-template');
    
    if (!gameCardTemplate || !playerResultTemplate) {
      console.error('Game card or player result template not found');
      gamesList.innerHTML = '<div class="error-message">Error loading templates</div>';
      return;
    }
    
    // Limit to only 3 games
    const limitedGames = games.slice(0, 3);
    
    // Render each game
    limitedGames.forEach(game => {
      // Clone the game card template
      const gameCard = gameCardTemplate.content.cloneNode(true);
      
      // Set game date
      gameCard.querySelector('.game-date').textContent = formatDate(game.report_date);
      
      // Check if participants is valid
      if (!game.participants || !Array.isArray(game.participants) || game.participants.length === 0) {
        const noParticipants = document.createElement('div');
        noParticipants.className = 'empty-state';
        noParticipants.textContent = 'No participants data available';
        gameCard.querySelector('.game-players').appendChild(noParticipants);
      } else {
        // Sort participants by ranking
        const sortedParticipants = [...game.participants].sort((a, b) => a.ranking - b.ranking);
        
        // Add each player result
        const playersContainer = gameCard.querySelector('.game-players');
        sortedParticipants.forEach(participant => {
          const playerResult = playerResultTemplate.content.cloneNode(true);
          
          // Set player and faction names
          playerResult.querySelector('.player-name').textContent = participant.user_name || 'Unknown';
          playerResult.querySelector('.faction-name').textContent = participant.faction_name || 'Unknown';
          
          // Set ranking and points
          const rankingElement = playerResult.querySelector('.player-ranking');
          rankingElement.textContent = `Rank ${participant.ranking || '?'}`;
          rankingElement.setAttribute('data-rank', participant.ranking || '0');
          
          playerResult.querySelector('.player-points').textContent = `${participant.points || 0} pts`;
          
          // Add to players container
          playersContainer.appendChild(playerResult);
        });
      }
      
      // Set game notes if any
      const notesElement = gameCard.querySelector('.game-notes');
      if (game.notes) {
        notesElement.textContent = game.notes;
      } else {
        notesElement.style.display = 'none';
      }
      
      // Add to games list
      gamesList.appendChild(gameCard);
    });
  } catch (error) {
    console.error('Error loading recent games:', error);
    showSectionError(gamesList.parentElement, 'Failed to load data. Please try again later.');
  }
}

function showSectionError(container, message) {
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Insert error message after the card title
  const cardTitle = container.querySelector('h2');
  if (cardTitle) {
    // Remove any existing error messages
    const existingError = cardTitle.nextElementSibling;
    if (existingError && existingError.classList.contains('error-message')) {
      existingError.remove();
    }
    
    cardTitle.insertAdjacentElement('afterend', errorDiv);
  } else {
    container.appendChild(errorDiv);
  }
}

// Add these new functions for sorting
function initSorting() {
  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const table = header.closest('table');
      const tbody = table.querySelector('tbody');
      const type = header.getAttribute('data-sort');
      const currentDirection = header.getAttribute('data-direction') || 'none';
      
      // Reset all sort indicators in this table
      table.querySelectorAll('.sortable').forEach(th => {
        th.querySelector('i').className = 'fas fa-sort';
        th.removeAttribute('data-direction');
      });
      
      // Set new sort direction
      let direction = 'asc';
      if (currentDirection === 'asc') {
        direction = 'desc';
      }
      
      // Update sort indicator
      header.setAttribute('data-direction', direction);
      header.querySelector('i').className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'}`;
      
      // Get all rows and convert to array for sorting
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      // Sort rows
      rows.sort((a, b) => {
        const aValue = getCellValue(a, type);
        const bValue = getCellValue(b, type);
        
        if (direction === 'asc') {
          return compareValues(aValue, bValue);
        } else {
          return compareValues(bValue, aValue);
        }
      });
      
      // Clear and re-append rows
      tbody.innerHTML = '';
      rows.forEach(row => tbody.appendChild(row));
      
      // Update ranks if necessary
      if (type !== 'rank') {
        updateRanks(tbody);
      }
    });
  });
}

function getCellValue(row, type) {
  const cells = row.querySelectorAll('td');
  let value;
  
  switch (type) {
    case 'rank':
      value = parseFloat(cells[0].textContent) || 0;
      break;
    case 'player':
      value = cells[1].textContent.toLowerCase();
      break;
    case 'winrate':
      value = parseFloat(cells[2].textContent.replace('%', '')) || 0;
      break;
    case 'avgPlace':
      value = parseFloat(cells[3].textContent) || 0;
      break;
    case 'avgPoints':
      value = parseFloat(cells[4].textContent) || 0;
      break;
    case 'wins':
      value = parseInt(cells[5].textContent, 10) || 0;
      break;
    case 'games':
      value = parseInt(cells[6].textContent, 10) || 0;
      break;
    case 'bestFaction':
      value = cells[7].textContent.toLowerCase();
      break;
    case 'timesPlayed':
      value = parseInt(cells[2].textContent, 10) || 0;
      break;
    case 'pickRate':
      value = parseFloat(cells[3].textContent.replace('%', '')) || 0;
      break;
    case 'faction':
      value = cells[1].textContent.toLowerCase();
      break;
    default:
      value = '';
  }
  
  return value;
}

function compareValues(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  return a - b;
}

function updateRanks(tbody) {
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((row, index) => {
    const rankCell = row.querySelector('td:first-child');
    if (rankCell) {
      rankCell.textContent = index + 1;
    }
  });
} 