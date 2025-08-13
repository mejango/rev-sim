// Main application module for Revnet Calculator
const App = {
  init() {
  
    
    // Initialize UI
    UI.initTooltips();
    
    // Initialize event listeners
    EventManager.initEventListeners();
    
    // Set up default stages and events
    this.setupDefaults();
    
    // Set up button event listeners
    this.setupButtonListeners();
    
    // Mark initialization as complete
    State.isInitializing = false;
    
    // Run initial calculation after events are set up
    setTimeout(() => {
      // Ensure all events are properly configured before calculation
      this.finalizeEventSetup();
      
      Calculator.run();
      ChartManager.createAll();
      ResultsDisplay.updateAll();
      ResultsDisplay.hideLoading();
    }, 100);
    

  },

  setupDefaults() {
    // Add initial stage
    StageManager.addStage();
    
    // Add default events
    this.addSampleEvents();
  },

  addSampleEvents() {
    // Add Event 1: Initial investment
    EventManager.addEvent();
    const event1Id = State.events[0];
    
    // Set the event type first, then update fields
    const event1TypeSelect = document.getElementById(`event-type-${event1Id}`);
    if (event1TypeSelect) event1TypeSelect.value = 'investment';
    
    // Update fields to generate the proper HTML structure
    EventManager.updateEventFields(event1Id);
    
    // Now set the values after the HTML is generated
    const event1DayInput = document.getElementById(`event-day-${event1Id}`);
    const event1AmountInput = document.getElementById(`event-amount-${event1Id}`);
    const event1LabelInput = document.getElementById(`event-label-${event1Id}`);
    
    if (event1DayInput) event1DayInput.value = '0';
    if (event1AmountInput) event1AmountInput.value = '10';
    if (event1LabelInput) event1LabelInput.value = 'Angel investor';
    
    // Add Event 2: Loan
    EventManager.addEvent();
    const event2Id = State.events[1];
    
    const event2TypeSelect = document.getElementById(`event-type-${event2Id}`);
    if (event2TypeSelect) event2TypeSelect.value = 'loan';
    
    // Update fields to generate the proper HTML structure
    EventManager.updateEventFields(event2Id);
    
    // Now set the values after the HTML is generated
    const event2DayInput = document.getElementById(`event-day-${event2Id}`);
    const event2AmountInput = document.getElementById(`event-amount-${event2Id}`);
    const event2TokenHolderSelect = document.getElementById(`token-holder-${event2Id}`);
    
    if (event2DayInput) event2DayInput.value = '1';
    if (event2AmountInput) event2AmountInput.value = '1';
    if (event2TokenHolderSelect) event2TokenHolderSelect.value = 'Angel investor';
    
    // Add Event 3: Pay Back Loan (partial - 0.5M tokens) - Day 280
    EventManager.addEvent();
    const event3Id = State.events[2];
    
    const event3TypeSelect = document.getElementById(`event-type-${event3Id}`);
    if (event3TypeSelect) event3TypeSelect.value = 'payback-loan';
    
    // Update fields to generate the proper HTML structure
    EventManager.updateEventFields(event3Id);
    
    // Now set the values after the HTML is generated
    const event3DayInput = document.getElementById(`event-day-${event3Id}`);
    const event3AmountInput = document.getElementById(`event-amount-${event3Id}`);
    const event3TokenHolderSelect = document.getElementById(`token-holder-${event3Id}`);
    
    if (event3DayInput) event3DayInput.value = '280';
    if (event3AmountInput) event3AmountInput.value = '0.5';
    if (event3TokenHolderSelect) event3TokenHolderSelect.value = 'Angel investor';
    
    // Add Event 4: Cash Out remaining tokens - Day 281
    EventManager.addEvent();
    const event4Id = State.events[3];
    
    const event4TypeSelect = document.getElementById(`event-type-${event4Id}`);
    if (event4TypeSelect) event4TypeSelect.value = 'cashout';
    
    // Update fields to generate the proper HTML structure
    EventManager.updateEventFields(event4Id);
    
    // Now set the values after the HTML is generated
    const event4DayInput = document.getElementById(`event-day-${event4Id}`);
    const event4AmountInput = document.getElementById(`event-amount-${event4Id}`);
    const event4TokenHolderSelect = document.getElementById(`token-holder-${event4Id}`);
    
    if (event4DayInput) event4DayInput.value = '281';
    if (event4AmountInput) event4AmountInput.value = '0.5';
    if (event4TokenHolderSelect) event4TokenHolderSelect.value = 'Angel investor';
    
    // Sort events by day after all events are added
    EventManager.sortEvents();
  },

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
    // Add Event button
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        EventManager.addEvent();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        EventManager.exportSequence();
      });
    }
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        EventManager.showImportDialog();
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