// UI utilities for Revnet Calculator
const UI = {
  currentView: 'controls',

  toggleView() {
    const controls = document.querySelector('.controls');
    const results = document.querySelector('.results');
    const toggleText = document.getElementById('toggle-text');
    
    if (this.currentView === 'controls') {
      controls.classList.remove('active');
      results.classList.add('active');
      toggleText.textContent = 'Show Controls';
      this.currentView = 'results';
    } else {
      controls.classList.add('active');
      results.classList.remove('active');
      toggleText.textContent = 'Show Results';
      this.currentView = 'controls';
    }
  },

  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
  },

  $(id) {
    return document.getElementById(id);
  },

  initTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.id = 'custom-tooltip';
    document.body.appendChild(tooltip);

    // Add event listeners to table cells with title attributes
    document.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'TD' && e.target.title) {
        const tooltipEl = document.getElementById('custom-tooltip');
        tooltipEl.innerHTML = e.target.title.replace(/\n/g, '<br>');
        tooltipEl.style.display = 'block';
        
        const rect = e.target.getBoundingClientRect();
        tooltipEl.style.left = rect.left + (rect.width / 2) + 'px';
        tooltipEl.style.top = rect.bottom + 5 + 'px';
        tooltipEl.style.transform = 'translateX(-50%)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.tagName === 'TD' && e.target.title) {
        const tooltipEl = document.getElementById('custom-tooltip');
        tooltipEl.style.display = 'none';
      }
    });
  }
};

// Make available globally
window.UI = UI; 