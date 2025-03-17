// Main application entry point
import { initNavigation } from './navigation.js';
import { initDashboard } from './dashboard.js';
import { initGameForm } from './gameForm.js';
import { initPlayerComparison } from './playerComparison.js';
import { initPlayerForm } from './playerForm.js';
import { API_BASE_URL } from './config.js';

// Initialize all modules when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  initNavigation();
  
  // Initialize all page modules
  initDashboard();
  initGameForm();
  initPlayerComparison();
  initPlayerForm();
  
  // Check if API is available
  fetch(`${API_BASE_URL}/factions`)
    .then(response => {
      if (!response.ok) {
        throw new Error('API not available');
      }
      return response.json();
    })
    .catch(error => {
      console.error('API Error:', error);
      showApiError();
    });
});

// Show API error message if the API is not available
function showApiError() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'api-error';
  errorDiv.innerHTML = `
    <div class="error-message">
      <h2>Connection Error</h2>
      <p>Unable to connect to the server. Please check your connection and try again.</p>
    </div>
  `;
  document.body.prepend(errorDiv);
} 