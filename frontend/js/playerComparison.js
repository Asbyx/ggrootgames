// Player Comparison module for comparing statistics between two players
import { getUsers, getPlayerComparison } from './apiService.js';
import { formatPercent } from './config.js';

export function initPlayerComparison() {
  const player1Select = document.getElementById('player1-select');
  const player2Select = document.getElementById('player2-select');
  const compareBtn = document.getElementById('compare-btn');
  const comparisonResults = document.getElementById('comparison-results');
  
  // Load users for select dropdowns initially
  loadUsers(player1Select, player2Select);
  
  // Add event listener to reload data when the page becomes visible
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('data-page') === 'player-comparison') {
        // Reload users when navigating to the comparison page
        loadUsers(player1Select, player2Select);
        
        // Hide comparison results when switching to the page
        comparisonResults.classList.add('hidden');
      }
    });
  });
  
  // Handle compare button click
  compareBtn.addEventListener('click', async () => {
    const player1Id = player1Select.value;
    const player2Id = player2Select.value;
    
    // Validate selection
    if (!player1Id || !player2Id) {
      showComparisonError('Please select two players to compare');
      return;
    }
    
    if (player1Id === player2Id) {
      showComparisonError('Please select two different players');
      return;
    }
    
    try {
      // Show loading state
      comparisonResults.classList.remove('hidden');
      const loadingSpinner = comparisonResults.querySelector('.loading-spinner');
      loadingSpinner.style.display = 'flex';
      
      // Get comparison data
      const comparisonData = await getPlayerComparison(player1Id, player2Id);
      
      // Hide loading spinner
      loadingSpinner.style.display = 'none';
      
      // Render comparison data
      renderComparisonData(comparisonData);
      
    } catch (error) {
      console.error('Error comparing players:', error);
      showComparisonError(`Error: ${error.message}`);
    }
  });
}

async function loadUsers(player1Select, player2Select) {
  try {
    // Store currently selected values
    const player1Value = player1Select.value;
    const player2Value = player2Select.value;
    
    const users = await getUsers();
    
    // Populate both selects
    populateUserSelect(player1Select, users);
    populateUserSelect(player2Select, users);
    
    // Restore selected values if they still exist
    if (player1Value) {
      const exists = Array.from(player1Select.options).some(option => option.value === player1Value);
      if (exists) {
        player1Select.value = player1Value;
      }
    }
    
    if (player2Value) {
      const exists = Array.from(player2Select.options).some(option => option.value === player2Value);
      if (exists) {
        player2Select.value = player2Value;
      }
    }
    
  } catch (error) {
    console.error('Error loading users:', error);
    showComparisonError('Failed to load users. Please try again.');
  }
}

function populateUserSelect(select, users) {
  // Clear existing options except the first one
  select.innerHTML = '<option value="">Select Player</option>';
  
  // Add each user
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  });
}

function renderComparisonData(data) {
  // Get player data
  const [player1, player2] = data.players;
  
  // Set player names in the UI
  document.getElementById('player1-name').textContent = player1.user_name;
  document.getElementById('player2-name').textContent = player2.user_name;
  document.getElementById('player1-factions-title').textContent = `${player1.user_name}'s Factions`;
  document.getElementById('player2-factions-title').textContent = `${player2.user_name}'s Factions`;
  
  // Render overall comparison table
  renderOverallComparison(player1, player2);
  
  // Render head-to-head stats
  renderHeadToHead(data.headToHead, player1.user_name, player2.user_name);
  
  // Render faction stats
  renderFactionStats(data.factions, player1.user_id, player2.user_id);
}

function renderOverallComparison(player1, player2) {
  const tableBody = document.querySelector('#overall-comparison tbody');
  tableBody.innerHTML = '';
  
  // Define stats to display
  const stats = [
    { label: 'Games Played', value1: player1.games_played, value2: player2.games_played },
    { label: 'Wins', value1: player1.wins, value2: player2.wins },
    { label: 'Winrate', value1: formatPercent(player1.winrate), value2: formatPercent(player2.winrate) },
    { label: 'Avg. Points', value1: player1.avg_points?.toFixed(1) || 'N/A', value2: player2.avg_points?.toFixed(1) || 'N/A' },
    { label: 'Avg. Ranking', value1: player1.avg_ranking?.toFixed(2) || 'N/A', value2: player2.avg_ranking?.toFixed(2) || 'N/A' }
  ];
  
  // Add each stat row
  stats.forEach(stat => {
    const row = document.createElement('tr');
    
    // Determine which value is better (lower is better for avg_ranking, higher is better for others)
    let player1Better = false;
    let player2Better = false;
    
    if (stat.label === 'Avg. Ranking') {
      player1Better = parseFloat(stat.value1) < parseFloat(stat.value2);
      player2Better = parseFloat(stat.value2) < parseFloat(stat.value1);
    } else {
      player1Better = parseFloat(stat.value1) > parseFloat(stat.value2);
      player2Better = parseFloat(stat.value2) > parseFloat(stat.value1);
    }
    
    // Create cells with appropriate classes
    row.innerHTML = `
      <td>${stat.label}</td>
      <td class="${player1Better ? 'better-stat' : ''}">${stat.value1}</td>
      <td class="${player2Better ? 'better-stat' : ''}">${stat.value2}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function renderHeadToHead(headToHead, player1Name, player2Name) {
  const headToHeadContainer = document.getElementById('head-to-head');
  
  if (headToHead.total_games === 0) {
    headToHeadContainer.innerHTML = `
      <p>These players have not played against each other yet.</p>
    `;
    return;
  }
  
  const player1WinPercent = (headToHead.player1_wins / headToHead.total_games) * 100;
  const player2WinPercent = (headToHead.player2_wins / headToHead.total_games) * 100;
  
  headToHeadContainer.innerHTML = `
    <div class="head-to-head-stats">
      <h4>Head-to-Head Record</h4>
      <p>Total Games: ${headToHead.total_games}</p>
      <div class="win-comparison">
        <div class="player-win" style="width: ${player1WinPercent}%">
          <span>${player1Name}: ${headToHead.player1_wins}</span>
        </div>
        <div class="player-win player2" style="width: ${player2WinPercent}%">
          <span>${player2Name}: ${headToHead.player2_wins}</span>
        </div>
      </div>
    </div>
  `;
}

function renderFactionStats(factions, player1Id, player2Id) {
  const player1Factions = document.getElementById('player1-factions');
  const player2Factions = document.getElementById('player2-factions');
  
  // Clear existing content
  player1Factions.innerHTML = '';
  player2Factions.innerHTML = '';
  
  // Get template
  const factionStatTemplate = document.getElementById('faction-stat-template');
  
  // Filter factions by player
  const player1FactionStats = factions.filter(f => f.user_id === player1Id);
  const player2FactionStats = factions.filter(f => f.user_id === player2Id);
  
  // Render player 1 factions
  if (player1FactionStats.length === 0) {
    player1Factions.innerHTML = '<div class="empty-state">No faction data available</div>';
  } else {
    renderPlayerFactions(player1Factions, player1FactionStats, factionStatTemplate);
  }
  
  // Render player 2 factions
  if (player2FactionStats.length === 0) {
    player2Factions.innerHTML = '<div class="empty-state">No faction data available</div>';
  } else {
    renderPlayerFactions(player2Factions, player2FactionStats, factionStatTemplate);
  }
}

function renderPlayerFactions(container, factions, template) {
  factions.forEach(faction => {
    const factionStat = template.content.cloneNode(true);
    const logoPath = `/img/factions/faction-${faction.faction_name.toLowerCase().replace(/ /g, '-')}.png`;
    
    const factionNameElement = factionStat.querySelector('.faction-name');
    factionNameElement.innerHTML = `
      <img src="${logoPath}" alt="${faction.faction_name}" class="faction-logo">
      ${faction.faction_name}
    `;
    
    factionStat.querySelector('.times-played').textContent = faction.times_played;
    factionStat.querySelector('.pick-rate').textContent = formatPercent(faction.pick_rate);
    factionStat.querySelector('.wins').textContent = faction.wins;
    factionStat.querySelector('.winrate').textContent = formatPercent(faction.winrate);
    
    container.appendChild(factionStat);
  });
}

function showComparisonError(message) {
  const comparisonResults = document.getElementById('comparison-results');
  const loadingSpinner = comparisonResults.querySelector('.loading-spinner');
  
  // Hide loading spinner
  loadingSpinner.style.display = 'none';
  
  // Show error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Clear existing content and add error
  const comparisonGrid = comparisonResults.querySelector('.comparison-grid');
  comparisonGrid.innerHTML = '';
  comparisonGrid.appendChild(errorDiv);
  
  // Show results container
  comparisonResults.classList.remove('hidden');
} 