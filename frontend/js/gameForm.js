// Game Form module for handling game reporting functionality
import { getUsers, getFactions, reportGame, getFactionLogo } from './apiService.js';
import { MIN_PLAYERS, MAX_PLAYERS } from './config.js';

// Store cached data
let users = [];
let factions = [];

export function initGameForm() {
  const gameForm = document.getElementById('game-form');
  const addPlayerBtn = document.getElementById('add-player');
  const playerEntries = document.getElementById('player-entries');
  
  // Load users and factions data initially
  loadFormData();
  
  // Add event listener to reload data when the page becomes visible
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('data-page') === 'report-game') {
        // Reload data when navigating to the report game page
        loadFormData();
        
        // Clear and reinitialize player entries
        playerEntries.innerHTML = '';
        // Initialize with 4 player slots
        for (let i = 0; i < 4; i++) {
          addPlayer();
        }
      }
    });
  });
  
  // Handle add player button - remove this since we always want 4 slots
  addPlayerBtn.style.display = 'none';
  
  // Handle form submission
  gameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      // Calculate rankings based on points before collecting form data
      calculateRankings();
      
      // Collect form data
      const gameData = collectFormData();
      
      // Disable form during submission
      setFormDisabled(true);
      showFormMessage('Submitting game...', 'info');
      
      // Submit game data
      await reportGame(gameData);
      
      // Show success message
      showFormMessage('Game reported successfully!', 'success');
      
      // Reset form
      resetForm();
      
      // Re-enable form
      setFormDisabled(false);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        document.querySelector('.nav-link[data-page="dashboard"]').click();
      }, 1500);
      
    } catch (error) {
      console.error('Error reporting game:', error);
      showFormMessage(`Error: ${error.message}`, 'error');
      setFormDisabled(false);
    }
  });
  
  // Add initial players - always 4 slots
  for (let i = 0; i < 4; i++) {
    addPlayer();
  }
}

async function loadFormData() {
  try {
    // Show loading message
    const playerEntries = document.getElementById('player-entries');
    if (playerEntries.children.length === 0) {
      showFormMessage('Loading users and factions...', 'info');
    }
    
    // Load users and factions in parallel
    [users, factions] = await Promise.all([getUsers(), getFactions()]);
    
    // Update any existing player entries with the new data
    updateExistingPlayerEntries();
    
    // Clear loading message if it exists
    const loadingMessage = document.querySelector('.form-message.info');
    if (loadingMessage && loadingMessage.textContent.includes('Loading')) {
      loadingMessage.remove();
    }
  } catch (error) {
    console.error('Error loading form data:', error);
    showFormMessage('Failed to load users and factions. Please try again.', 'error');
  }
}

function updateExistingPlayerEntries() {
  const playerSelects = document.querySelectorAll('.player-select');
  const factionSelects = document.querySelectorAll('.faction-select');
  
  // Update player selects
  playerSelects.forEach(select => {
    const selectedValue = select.value;
    populateUserSelect(select);
    select.value = selectedValue;
  });
  
  // Update faction selects
  factionSelects.forEach(select => {
    const selectedValue = select.value;
    populateFactionSelect(select);
    select.value = selectedValue;
  });
}

function addPlayer() {
  const playerEntries = document.getElementById('player-entries');
  const playerCount = playerEntries.children.length + 1;
  
  // Clone the player entry template
  const template = document.getElementById('player-entry-template');
  const playerEntry = template.content.cloneNode(true);
  
  // Set player number
  playerEntry.querySelector('.player-number').textContent = playerCount;
  
  // Populate user select
  const playerSelect = playerEntry.querySelector('.player-select');
  populateUserSelect(playerSelect);
  
  // Create and populate custom faction select
  const factionSelectContainer = playerEntry.querySelector('.faction-select-container');
  createCustomFactionSelect(factionSelectContainer, playerCount);
  
  // Handle the ranking select - since it will be calculated automatically
  const rankingSelect = playerEntry.querySelector('.ranking-select');
  const rankingGroup = rankingSelect.closest('.form-group');
  rankingGroup.style.display = 'none';
  rankingSelect.removeAttribute('required');
  rankingSelect.value = '1';
  
  // Make player and faction fields not required for slots 3 and 4
  if (playerCount > 2) {
    playerSelect.removeAttribute('required');
    const hiddenFactionInput = factionSelectContainer.querySelector('input[type="hidden"]');
    hiddenFactionInput.removeAttribute('required');
    
    // Also make points not required for these slots
    const pointsInput = playerEntry.querySelector('.points-input');
    pointsInput.removeAttribute('required');
  }
  
  // Add points input event listener to recalculate rankings
  const pointsInput = playerEntry.querySelector('.points-input');
  pointsInput.addEventListener('input', () => {
    calculateRankings();
  });
  
  // Remove the remove player button since we always want 4 slots
  const removeBtn = playerEntry.querySelector('.remove-player');
  removeBtn.style.display = 'none';
  
  // Add to player entries
  playerEntries.appendChild(playerEntry);
}

function populateUserSelect(select) {
  // Store the currently selected value
  const currentValue = select.value;
  
  // Add empty option
  select.innerHTML = '<option value="">Select player</option>';
  
  // Add each user
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  });
  
  // Restore the selected value if it exists in the new options
  if (currentValue) {
    const exists = Array.from(select.options).some(option => option.value === currentValue);
    if (exists) {
      select.value = currentValue;
    }
  }
}

function populateFactionSelect(select) {
  // Store the currently selected value
  const currentValue = select.value;
  
  // Add empty option
  select.innerHTML = '<option value="">Select faction</option>';
  
  // Add each faction
  factions.forEach(faction => {
    const option = document.createElement('option');
    option.value = faction.id;
    option.innerHTML = getFactionLogo(faction.name);
    select.appendChild(option);
  });
  
  // Restore the selected value if it exists in the new options
  if (currentValue) {
    const exists = Array.from(select.options).some(option => option.value === currentValue);
    if (exists) {
      select.value = currentValue;
    }
  }
}

function createCustomFactionSelect(container, playerNumber) {
  // Create the structure
  container.innerHTML = `
    <div class="custom-select-container" style="color: black;">
      <input type="hidden" name="faction-${playerNumber}" ${playerNumber <= 2 ? 'required' : ''}>
      <div class="custom-select-trigger">
        <span>Select faction</span>
      </div>
      <div class="custom-select-options"></div>
    </div>
  `;

  const trigger = container.querySelector('.custom-select-trigger');
  const options = container.querySelector('.custom-select-options');
  const hiddenInput = container.querySelector('input[type="hidden"]');

  // Add factions as options
  factions.forEach(faction => {
    const option = document.createElement('div');
    option.className = 'custom-select-option';
    option.dataset.value = faction.id;
    option.innerHTML = getFactionLogo(faction.name);
    
    option.addEventListener('click', () => {
      // Update hidden input
      hiddenInput.value = faction.id;
      
      // Update trigger content
      trigger.innerHTML = getFactionLogo(faction.name);
      
      // Close dropdown
      container.querySelector('.custom-select-container').classList.remove('open');
      
      // Update selected state
      options.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.classList.toggle('selected', opt === option);
      });
    });
    
    options.appendChild(option);
  });

  // Toggle dropdown on trigger click
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const selectContainer = container.querySelector('.custom-select-container');
    selectContainer.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    container.querySelector('.custom-select-container').classList.remove('open');
  });
}

function updatePlayerNumbers() {
  const playerEntries = document.getElementById('player-entries').children;
  
  // Update player numbers
  Array.from(playerEntries).forEach((entry, index) => {
    entry.querySelector('.player-number').textContent = index + 1;
  });
}

// New function to calculate rankings based on points
function calculateRankings() {
  const playerEntries = document.getElementById('player-entries').children;
  
  // Collect players with points
  const playersWithPoints = [];
  
  Array.from(playerEntries).forEach((entry, index) => {
    const playerSelect = entry.querySelector('.player-select');
    const pointsInput = entry.querySelector('.points-input');
    const rankingSelect = entry.querySelector('.ranking-select');
    
    // Only include players that have been selected and have points
    if (playerSelect.value && pointsInput.value) {
      playersWithPoints.push({
        index,
        entry,
        points: parseInt(pointsInput.value),
        rankingSelect
      });
    } else if (playerSelect.value) {
      // For players that are selected but don't have points yet,
      // ensure they have a valid ranking value to avoid validation issues
      rankingSelect.value = '1';
    }
  });
  
  // Sort players by points in descending order
  playersWithPoints.sort((a, b) => b.points - a.points);
  
  // Assign rankings
  playersWithPoints.forEach((player, index) => {
    const ranking = index + 1;
    player.rankingSelect.value = ranking;
  });
}

function validateForm() {
  const playerEntries = document.getElementById('player-entries').children;
  
  // Count active players (those with a selected player)
  const activePlayers = Array.from(playerEntries).filter(entry => 
    entry.querySelector('.player-select').value !== ''
  );
  
  // Check if we have enough players
  if (activePlayers.length < MIN_PLAYERS) {
    showFormMessage(`Minimum ${MIN_PLAYERS} players required`, 'error');
    return false;
  }
  
  // Check for duplicate players
  const selectedPlayers = new Set();
  
  for (const entry of activePlayers) {
    const playerId = entry.querySelector('.player-select').value;
    
    if (selectedPlayers.has(playerId)) {
      showFormMessage('Each player can only participate once in a game', 'error');
      entry.querySelector('.player-select').focus();
      return false;
    }
    
    selectedPlayers.add(playerId);
  }
  
  // Check that all required fields are filled for active players
  for (const entry of activePlayers) {
    const requiredInputs = entry.querySelectorAll('input[required], select[required]');
    
    for (const input of requiredInputs) {
      if (!input.value) {
        showFormMessage('Please fill in all required fields for active players', 'error');
        input.focus();
        return false;
      }
    }
    
    // Ensure points are entered for active players
    const pointsInput = entry.querySelector('.points-input');
    if (!pointsInput.value) {
      showFormMessage('Please enter points for all active players', 'error');
      pointsInput.focus();
      return false;
    }
  }
  
  // Calculate rankings one final time before submission
  calculateRankings();
  
  return true;
}

function collectFormData() {
  const playerEntries = document.getElementById('player-entries').children;
  const notes = document.getElementById('game-notes').value;
  
  // Collect participant data only for active players (those with a selected player)
  const participants = Array.from(playerEntries)
    .filter(entry => entry.querySelector('.player-select').value !== '')
    .map(entry => {
      return {
        user_id: parseInt(entry.querySelector('.player-select').value),
        faction_id: parseInt(entry.querySelector('.faction-select-container input[type="hidden"]').value),
        points: parseInt(entry.querySelector('.points-input').value),
        ranking: parseInt(entry.querySelector('.ranking-select').value)
      };
    });
  
  return {
    participants,
    notes
  };
}

function resetForm() {
  const playerEntries = document.getElementById('player-entries');
  const notesInput = document.getElementById('game-notes');
  
  // Clear player entries
  playerEntries.innerHTML = '';
  
  // Clear notes
  notesInput.value = '';
  
  // Add 4 player slots
  for (let i = 0; i < 4; i++) {
    addPlayer();
  }
}

function setFormDisabled(disabled) {
  const form = document.getElementById('game-form');
  const inputs = form.querySelectorAll('input, select, textarea, button');
  
  inputs.forEach(input => {
    input.disabled = disabled;
  });
}

function showFormMessage(message, type = 'info') {
  // Remove any existing message
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;
  
  // Add to form
  const formActions = document.querySelector('.form-actions');
  formActions.prepend(messageElement);
  
  // Auto-remove success and info messages after a delay
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
} 