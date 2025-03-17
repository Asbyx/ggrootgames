// Player Form module for handling user player creation
import { getFactions, createUser, getFactionLogo } from './apiService.js';

export function initPlayerForm() {
  const playerForm = document.getElementById('player-form');
  const usernameInput = document.getElementById('username');
  const factionContainer = document.getElementById('preferred-faction-container');
  
  // Load factions for the dropdown
  loadFactions(factionContainer);
  
  // Handle form submission
  playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const preferredFactionId = factionContainer.querySelector('input[type="hidden"]').value;
    
    // Validate form
    if (!username) {
      showPlayerFormMessage('Please enter a username', 'error');
      usernameInput.focus();
      return;
    }

    if (!preferredFactionId) {
      showPlayerFormMessage('Please select your preferred faction', 'error');
      return;
    }
    
    try {
      // Disable form during submission
      setFormDisabled(true);
      showPlayerFormMessage('Creating player...', 'info');
      
      // Create user
      const userData = {
        name: username,
        preferred_faction_id: preferredFactionId
      };
      
      const newUser = await createUser(userData);
      
      // Show success message
      showPlayerFormMessage(`Player created successfully! Welcome, ${newUser.name}!`, 'success');
      
      // Reset form
      playerForm.reset();
      resetFactionSelect(factionContainer);
      
      // Re-enable form
      setFormDisabled(false);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        document.querySelector('.nav-link[data-page="dashboard"]').click();
      }, 500);
      
    } catch (error) {
      console.error('Error creating player:', error);
      
      // Show specific error for duplicate username
      if (error.message.includes('already exists')) {
        showPlayerFormMessage('This username is already taken. Please choose another one.', 'error');
      } else {
        showPlayerFormMessage(`Error: ${error.message}`, 'error');
      }
      
      setFormDisabled(false);
    }
  });
}

async function loadFactions(container) {
  try {
    const factions = await getFactions();
    createCustomFactionSelect(container, factions);
  } catch (error) {
    console.error('Error loading factions:', error);
    showPlayerFormMessage('Failed to load factions. Please try again.', 'error');
  }
}

function createCustomFactionSelect(container, factions) {
  // Create the structure
  container.innerHTML = `
    <div class="custom-select-container" style="color: black;">
      <input type="hidden" name="preferred-faction" required>
      <div class="custom-select-trigger">
        <span>Select your favorite faction</span>
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

function resetFactionSelect(container) {
  const trigger = container.querySelector('.custom-select-trigger');
  const hiddenInput = container.querySelector('input[type="hidden"]');
  
  // Reset the trigger text
  trigger.innerHTML = '<span>Select your favorite faction</span>';
  
  // Clear the hidden input
  hiddenInput.value = '';
  
  // Remove selected state from all options
  container.querySelectorAll('.custom-select-option').forEach(opt => {
    opt.classList.remove('selected');
  });
}

function setFormDisabled(disabled) {
  const form = document.getElementById('player-form');
  const inputs = form.querySelectorAll('input, button');
  const customSelect = form.querySelector('.custom-select-container');
  
  inputs.forEach(input => {
    input.disabled = disabled;
  });
  
  if (disabled) {
    customSelect.style.pointerEvents = 'none';
    customSelect.style.opacity = '0.7';
  } else {
    customSelect.style.pointerEvents = '';
    customSelect.style.opacity = '';
  }
}

function showPlayerFormMessage(message, type = 'info') {
  // Remove any existing message
  const existingMessage = document.querySelector('.player-form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `player-form-message ${type}`;
  messageElement.textContent = message;
  
  // Add to form
  const form = document.getElementById('player-form');
  form.insertAdjacentElement('beforebegin', messageElement);
  
  // Auto-remove success and info messages after a delay
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
} 