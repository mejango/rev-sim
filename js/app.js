// Main application module for Revnet Calculator
const App = {
  init() {
    // Initialize UI
    UI.initTooltips();
    
    // Initialize event listeners
    EventManager.initEventListeners();
    
    // Initialize scenario management
    ScenarioManager.init();
    
    // Set up default stages and events
    this.setupDefaults();
    
    // Set up button event listeners
    this.setupButtonListeners();
    
    // Mark initialization as complete
    State.isInitializing = false;
    
    // Run initial calculation after events are set up
    // Ensure all events are properly configured before calculation
    this.finalizeEventSetup();
    
    // Initialize add event buttons
    EventManager.updateAddEventButtons();
    
    // Validate event ordering
    EventManager.validateAllEventOrdering();
    
    const calculationSuccess = Calculator.run();

    if (calculationSuccess && State.calculationResults && State.calculationResults.length > 0) {
      ChartManager.createAll();
      ResultsDisplay.updateAll();
    } else {
      console.error('Calculation failed or no results');
    }
  
    ResultsDisplay.hideLoading();
    

  },

  setupDefaults() {
    // Add initial stage
    StageManager.addStage();
    
    // Load Conservative Growth scenario by default
    ScenarioManager.loadScenario('conservative-growth');
    
    // Initialize Capital Access scenarios
    ScenarioManager.updateCapitalAccessScenarios('conservative-growth');
  },

  // Removed addSampleEvents() - now using scenarios instead

  finalizeEventSetup() {
    // Ensure all events have proper token holders selected
    State.events.forEach(eventId => {
      const eventType = UI.$(`event-type-${eventId}`)?.value;
      const tokenHolderSelect = UI.$(`token-holder-${eventId}`);
      
      if (eventType && (eventType === 'loan' || eventType === 'payback-loan' || eventType === 'cashout')) {
        // Only populate dropdown if no token holder is selected
        if (!tokenHolderSelect || !tokenHolderSelect.value) {
          EventManager.populateTokenHolderDropdown(eventId, eventType);
          
          // Don't auto-select Angel investor - let user choose
          // Only trigger change event if a value is already selected
          if (tokenHolderSelect && tokenHolderSelect.value) {
            const changeEvent = new Event('change', { bubbles: true });
            tokenHolderSelect.dispatchEvent(changeEvent);
          }
        }
      }
    });
  },

  setupButtonListeners() {
    // Save Scenario button
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    if (saveScenarioBtn) {
      saveScenarioBtn.addEventListener('click', () => {
        ScenarioManager.showSaveDialog();
      });
    }
    
    // Export Scenario button
    const exportScenarioBtn = document.getElementById('export-scenario-btn');
    if (exportScenarioBtn) {
      exportScenarioBtn.addEventListener('click', () => {
        ScenarioManager.exportCurrentScenario();
      });
    }
    
    // Import Scenario button
    const importScenarioBtn = document.getElementById('import-scenario-btn');
    if (importScenarioBtn) {
      importScenarioBtn.addEventListener('click', () => {
        ScenarioManager.showImportDialog();
      });
    }
  }
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Make App available globally
window.App = App; 