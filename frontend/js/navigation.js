// Navigation module for handling page switching and mobile navigation

export function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  // Handle navigation link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the target page
      const targetPage = link.getAttribute('data-page');
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show the target page and hide others
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        if (page.id === targetPage) {
          page.classList.add('active');
        } else {
          page.classList.remove('active');
        }
      });
      
      // Close mobile menu if open
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
      
      // Update URL without scrolling (using history API instead of hash)
      history.pushState(null, null, `#${targetPage}`);
    });
  });
  
  // Handle mobile menu toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
  
  // Handle initial page load based on URL hash
  window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const targetLink = document.querySelector(`.nav-link[data-page="${hash}"]`);
      if (targetLink) {
        // Trigger click without scrolling
        targetLink.click();
      }
    }
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('active') && 
      !navMenu.contains(e.target) && 
      e.target !== navToggle
    ) {
      navMenu.classList.remove('active');
    }
  });
} 