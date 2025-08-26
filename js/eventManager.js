// Event management for Revnet Calculator
const EventManager = {
  // Helper function to convert generic event types to specific types
  getSpecificEventType(eventType, eventId) {
    if (eventType === 'loan' || eventType === 'payback-loan' || eventType === 'cashout') {
      const tokenHolderElement = UI.$(`token-holder-${eventId}`);
      if (tokenHolderElement && tokenHolderElement.value) {
        const tokenHolder = tokenHolderElement.value;
        const normalizedLabel = Utils.normalizeLabel(tokenHolder);
        
        if (eventType === 'loan') {
          return `${normalizedLabel}-loan`;
        } else if (eventType === 'payback-loan') {
          return `${normalizedLabel}-repay`;
        } else if (eventType === 'cashout') {
          return `${normalizedLabel}-cashout`;
        }
      }
      return null; // No token holder selected
    }
    return eventType;
  },

  getDisplayNameForLabel(normalizedLabel) {
    // Get the proper display name for a normalized label
    
    

    
    // Check if it's a stage split (like "team")
    for (const stageId of State.stages) {
      const splitsContainer = document.getElementById(`stage-splits-${stageId}`);
      if (splitsContainer) {
        const splitItems = splitsContainer.querySelectorAll('.split-item');
        for (const item of splitItems) {
          const labelInput = item.querySelector('input[type="text"]');
          if (labelInput) {
            const originalLabel = labelInput.value.trim();
            if (Utils.normalizeLabel(originalLabel) === normalizedLabel) {
        
              return originalLabel;
            }
          }
        }
      }
    }
    
    // Check if it's an event label (like "angelinvestor")
    if (State.calculationResults) {
      for (const result of State.calculationResults) {
        if (result.events) {
          for (const event of result.events) {
            if (event.label && Utils.normalizeLabel(event.label) === normalizedLabel) {
              return event.label;
            }
          }
        }
      }
    }
    
    // Check if it's a label from the current events in the UI
    for (const eventId of State.events) {
      const labelElement = UI.$(`event-label-${eventId}`);
      if (labelElement && labelElement.value) {
        const originalLabel = labelElement.value.trim();
        if (Utils.normalizeLabel(originalLabel) === normalizedLabel) {
          return originalLabel;
        }
      }
    }
    
    // Default fallback - try to reconstruct from normalized label
    // Split by common patterns and capitalize each word
    const words = normalizedLabel.replace(/([A-Z])/g, ' $1').trim().split(/\s+/);
    const reconstructed = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return reconstructed;
  },

  // Add global event listener for input changes
  initEventListeners() {
    // Listen for amount changes - only on blur (when field loses focus)
    document.addEventListener('blur', (e) => {
      if (e.target.id && e.target.id.startsWith('event-amount-')) {
        // Only update if the value actually changed
        const currentValue = e.target.value;
        const originalValue = e.target.getAttribute('data-original-value') || '';
        
        if (currentValue !== originalValue) {
          e.target.setAttribute('data-original-value', currentValue);
          // Update resulting states when amount changes
          setTimeout(() => this.updateAllResultingStates(), 0);
          // Auto-calculate after a short delay
          setTimeout(() => this.autoCalculate(), 100);
        }
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (e.target.id && e.target.id.startsWith('event-type-')) {
        // Update resulting states when event type changes
        setTimeout(() => this.updateAllResultingStates(), 0);
        // Auto-calculate after a short delay
        setTimeout(() => this.autoCalculate(), 100);
      }
    });

    // Listen for day changes
    document.addEventListener('change', (e) => {
      if (e.target.id && e.target.id.startsWith('event-day-')) {
        // Auto-calculate when day changes
        setTimeout(() => this.autoCalculate(), 100);
      }
    });

    // Listen for visibility changes
    document.addEventListener('change', (e) => {
      if (e.target.id && e.target.id.startsWith('event-visible-')) {
        // Auto-calculate when visibility changes
        setTimeout(() => this.autoCalculate(), 100);
      }
    });

    // Listen for event label changes
    document.addEventListener('blur', (e) => {
      if (e.target.id && e.target.id.startsWith('event-label-')) {
        // Auto-calculate when event label changes
        setTimeout(() => this.autoCalculate(), 100);
      }
    }, true);

    // Listen for splits label changes
    document.addEventListener('blur', (e) => {
      if (e.target.id && e.target.id.includes('split-label-')) {
        // Auto-calculate when splits label changes
        setTimeout(() => this.autoCalculate(), 100);
      }
    }, true);

    // Listen for splits percentage changes
    document.addEventListener('blur', (e) => {
      if (e.target.id && e.target.id.includes('split-percent-')) {
        // Auto-calculate when splits percentage changes
        setTimeout(() => this.autoCalculate(), 100);
      }
    }, true);

    // Also listen for change events on splits fields
    document.addEventListener('change', (e) => {
      if (e.target.id && (e.target.id.includes('split-label-') || e.target.id.includes('split-percent-'))) {
        // Auto-calculate when splits change
        setTimeout(() => this.autoCalculate(), 100);
      }
    });
  },



  autoCalculate() {
    // Don't calculate during initialization
    if (State.isInitializing) {
      return;
    }
    
    // Debounce calculations to prevent flickering
    if (this.calculationTimeout) {
      clearTimeout(this.calculationTimeout);
    }
    
    this.calculationTimeout = setTimeout(() => {
      // Run validation first
      this.validateAllEvents();
      this.performCalculation();
    }, 500); // 500ms debounce for smoother experience
  },

  performCalculation() {
    // Run calculation without showing alerts
    try {
      if (typeof Chart === 'undefined') {
        return; // Chart.js not loaded yet
      }
      if (State.stages.length === 0) {
        return; // No stages
      }
      if (!StageManager.validateSplits()) {
        return; // Invalid splits
      }
      if (State.isInitializing) {
        return; // Still in initial setup phase
      }
      
      // Check if events are properly initialized
      if (State.events && State.events.length > 0) {
        const firstEventId = State.events[0];
        const dayElement = UI.$(`event-day-${firstEventId}`);
        const typeElement = UI.$(`event-type-${firstEventId}`);
        if (!dayElement || !typeElement) {
          return; // Events not fully initialized yet
        }
      }
      

      
      // Always reset results for a full calculation to prevent data accumulation
      Calculator.calculate(true);

      
      // Batch all DOM updates in a single animation frame
      requestAnimationFrame(() => {
        // Only update charts if they exist and data has changed significantly
        if (State.charts && Object.keys(State.charts).length > 0) {
          // Check if we need to update charts (only if data changed significantly)
          if (this.shouldUpdateCharts()) {
            ChartManager.updateAll();
          }
        } else {
          ChartManager.createAll();
        }
        
        // Batch all event field updates
        this.batchUpdateEventFields();
        
        // Update resulting states in the same frame
        this.batchUpdateResultingStates();
      });
    } catch (error) {
      // Auto-calculation error handled silently
    }
  },

  shouldUpdateCharts() {
    // Only update charts if we have new calculation results
    return State.calculationResults && State.calculationResults.length > 0;
  },

  forceRecalculation() {
    // Force a complete recalculation and chart refresh
    try {
      Calculator.calculate(true);
      
      // Only recreate charts if they don't exist or if calculation results changed
      if (!State.charts || Object.keys(State.charts).length === 0) {
        ChartManager.createAll();
      } else {
        // Update existing charts with new data
        ChartManager.createAll();
      }
      
      // Update all event fields and resulting states
      this.batchUpdateEventFields();
      this.batchUpdateResultingStates();
      
      // Update the results display
      ResultsDisplay.updateAll();
    } catch (error) {
      // Force recalculation error handled silently
    }
  },

  addInputEventListeners(id) {
    // Add input event listeners to all input fields for this event
    const inputs = UI.$(`event-${id}`).querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        // Debounced auto-calculation
        if (this.inputTimeout) {
          clearTimeout(this.inputTimeout);
        }
        this.inputTimeout = setTimeout(() => {
          this.checkScenarioChange();
          this.autoCalculate();
        }, 500); // 500ms delay after stopping typing
      });
    });
    
    // Add event listener for token holder dropdown
    const tokenHolderSelect = UI.$(`token-holder-${id}`);
    if (tokenHolderSelect) {
      tokenHolderSelect.addEventListener('change', () => {
        const eventType = UI.$(`event-type-${id}`)?.value;
        if (eventType === 'loan' && tokenHolderSelect.value) {
          // Update Initial State when token holder changes
          this.updateLoanInitialState(id, tokenHolderSelect.value);
          this.updateLoanPotential(id, tokenHolderSelect.value);
        } else if (eventType === 'payback-loan' && tokenHolderSelect.value) {
          // Update Initial State for repayment events too
          this.updatePaybackInitialState(id, tokenHolderSelect.value);
        }
        
        // Trigger auto-calculation to update state and charts
        this.checkScenarioChange();
        this.autoCalculate();
        
        // After auto-calculation, update all dropdowns to reflect the new state
        setTimeout(() => {
          this.updateAllDropdowns();
          this.updateTokenHolderSelections(id);
        }, 100);
      });
    }
  },

  updateEventFields(eventId) {
    const eventType = UI.$(`event-type-${eventId}`)?.value;
    if (!eventType) return;
    
    // Store the current amount before any changes
    let currentAmount = UI.$(`event-amount-${eventId}`)?.value;
    if (!currentAmount && State.eventData && State.eventData[eventId]) {
      // If amount input doesn't exist yet, use the stored event data
      currentAmount = State.eventData[eventId].amount;
    }
    
    const fieldsContainer = UI.$(`event-fields-${eventId}`);
    if (!fieldsContainer) return;
    
    // Clear existing fields
    fieldsContainer.innerHTML = '';
    
    if (eventType === 'investment' || eventType === 'revenue') {
      // Hide token holder dropdown for investment and revenue events
      const tokenHolderContainer = UI.$(`token-holder-container-${eventId}`);
      if (tokenHolderContainer) {
        tokenHolderContainer.style.display = 'none';
      }
      
      // Use StateMachine as single source of truth
      const day = parseInt(UI.$(`event-day-${eventId}`)?.value) || 0;
      const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
      const existingLabel = UI.$(`event-label-${eventId}`)?.value || (eventType === 'investment' ? 'Generic investor' : 'Generic Revenue');
      let existingAmount = UI.$(`event-amount-${eventId}`)?.value;
      if (!existingAmount && State.eventData && State.eventData[eventId]) {
        existingAmount = State.eventData[eventId].amount;
      } else if (!existingAmount) {
        existingAmount = '1';
      }
      

      
      // Store the current amount before recreating HTML
      const currentAmount = existingAmount;
      
      const fieldsHTML = `
        <details style="border: 1px solid #ccc; margin: 8px 0 16px 0; background-color: #f0f8ff;">
          <summary style="padding: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 12px;">Initial State</summary>
          <div style="padding: 8px; font-family: monospace; font-size: 12px;">
            <table style="width: 100%;">
                    <tr><td>Revnet's balance</td><td><strong>${Utils.formatCurrency(stateBeforeEvent.revnetBacking)}</strong></td></tr>
      <tr><td>${existingLabel || 'Entity'} tokens</td><td><span id="current-entity-tokens-${eventId}"><strong>${((stateBeforeEvent.tokensByLabel[Utils.normalizeLabel(existingLabel || 'Entity')] || 0) / 1000000).toFixed(3)}M</strong></span></td></tr>
            </table>
          </div>
        </details>
        <label>Label (e.g., "Angel investor", "Series A")</label>
        <input type="text" id="event-label-${eventId}" value="${existingLabel}" placeholder="${eventType === 'investment' ? 'Generic investor' : 'Generic Revenue'}">
        <label>Amount ($M)</label>
        <input type="number" id="event-amount-${eventId}" value="${currentAmount}" min="0" step="0.1" placeholder="Enter amount in millions..." onchange="EventManager.validateEventAmount(${eventId})">
        <div id="error-${eventId}" class="error-message" style="display: none;"></div>
        <details style="border: 1px solid #ccc; margin: 8px 0 8px 0; background-color: #f5f5f5;">
          <summary style="padding: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 12px;">Resulting State</summary>
          <div style="padding: 8px; font-family: monospace; font-size: 12px;">
            <div id="${eventType}-resulting-state-${eventId}">Enter ${eventType} amount above</div>
          </div>
        </details>
      `;
      fieldsContainer.innerHTML = fieldsHTML;
      
      // Verify the amount was preserved after HTML recreation
      const newAmountInput = UI.$(`event-amount-${eventId}`);
      if (newAmountInput && newAmountInput.value !== currentAmount) {
        newAmountInput.value = currentAmount;
      }
      
      // Update resulting state
      if (eventType === 'investment') {
        this.updateInvestmentResultingState(eventId);
      } else {
        this.updateRevenueResultingState(eventId);
      }
    } else if (eventType === 'loan' || eventType === 'payback-loan' || eventType === 'cashout') {
      // Show token holder dropdown and amount field for loan/repay/cashout events
      const tokenHolderContainer = UI.$(`token-holder-container-${eventId}`);
      if (tokenHolderContainer) {
        tokenHolderContainer.style.display = 'block';
      }
      
      // Populate token holder dropdown
      this.populateTokenHolderDropdown(eventId, eventType);
      
      const fieldsHTML = `
        <details style="border: 1px solid #ccc; margin: 8px 0 16px 0; background-color: #f0f8ff;">
          <summary style="padding: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 12px;">Initial State</summary>
          <div style="padding: 8px; font-family: monospace; font-size: 12px;">
            <table style="width: 100%;">
                    <tr><td>Revnet's balance</td><td><span id="revnet-balance-${eventId}"></span></td></tr>
      <tr><td>${eventType === 'payback-loan' ? 'Outstanding principal' : 'Tokens available'}</td><td><span id="tokens-available-${eventId}"></span></td></tr>
      <tr><td>${eventType === 'payback-loan' ? 'Outstanding interest' : 'Loan potential'}</td><td><span id="loan-potential-${eventId}"></span></td></tr>
      <tr><td>${eventType === 'payback-loan' ? 'Tokens collateralized' : ''}</td><td><span id="collateralized-tokens-${eventId}"></span></td></tr>
            </table>
          </div>
        </details>
        <label>Amount (M tokens)</label>
        <input type="number" id="event-amount-${eventId}" value="1" min="0" step="0.1" placeholder="Enter amount in millions of tokens...">
        <div id="error-${eventId}" class="error-message" style="display: none;"></div>
        <details style="border: 1px solid #ccc; margin: 8px 0 8px 0; background-color: #f5f5f5;">
          <summary style="padding: 8px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 12px;">Resulting State</summary>
          <div style="padding: 8px; font-family: monospace; font-size: 12px;">
            <div id="${eventType === 'loan' ? 'loan' : eventType === 'payback-loan' ? 'repay' : 'cashout'}-resulting-state-${eventId}">Enter ${eventType} amount above</div>
          </div>
        </details>

      `;
      fieldsContainer.innerHTML = fieldsHTML;
    }
  },

  batchUpdateEventFields() {
    // Only update event fields that actually need updating (e.g., loan potential cards)
    // Don't recreate the entire event card structure
    State.events.forEach(eventId => {
      const eventType = UI.$(`event-type-${eventId}`)?.value;
      if (!eventType) return;
      
      // Handle simplified event types by converting to specific format
      const specificType = this.getSpecificEventType(eventType, eventId);
      if (specificType === null) return; // Skip events without token holder selected
      
      // Only update initial states, not resulting states (handled by batchUpdateResultingStates)
      if (specificType.endsWith('-loan')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updateLoanInitialState(eventId, tokenHolder);
      } else if (specificType.endsWith('-repay')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updatePaybackInitialState(eventId, tokenHolder);
      } else if (specificType.endsWith('-cashout')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updateCashOutInitialState(eventId, tokenHolder);
      }
    });
  },

  batchUpdateResultingStates() {
    // Only update resulting states for events that have changed
    // This prevents unnecessary updates that cause flickering
    State.events.forEach(eventId => {
      const eventType = UI.$(`event-type-${eventId}`)?.value;
      if (!eventType) return;
      
      // Only update if the event has an amount value
      const amountElement = UI.$(`event-amount-${eventId}`);
      if (!amountElement || !amountElement.value) return;
      
      // Handle simplified event types by converting to specific format
      const specificType = this.getSpecificEventType(eventType, eventId);
      if (specificType === null) return; // Skip events without token holder selected
      
      if (specificType.endsWith('-repay')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updateRepayResultingState(eventId, tokenHolder);
      } else if (specificType.endsWith('-cashout')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updateCashOutResultingState(eventId, tokenHolder);
      } else if (eventType === 'revenue') {
        this.updateRevenueResultingState(eventId);
      } else if (eventType === 'investment') {
        this.updateInvestmentResultingState(eventId);
      } else if (specificType.endsWith('-loan')) {
        const tokenHolder = UI.$(`token-holder-${eventId}`).value; // Use original label, not normalized
        this.updateLoanResultingState(eventId, tokenHolder);
      }
    });
  },

  addEvent(position = null) {
    const id = State.counters.event++;
    
    // Check if this changes the current scenario
    this.checkScenarioChange();
    
    // Calculate the day based on position and surrounding events
    let nextDay = 0;
    if (State.events.length > 0) {
      const allEvents = this.getAllEvents().allEvents;
      if (allEvents.length > 0) {
                 if (position !== null && position <= allEvents.length) {
           // Insert at specific position - calculate day based on surrounding events
           if (position === 0) {
             // Insert at beginning - use day 0 or day of first event - 1
             nextDay = allEvents.length > 0 ? Math.max(0, allEvents[0].day - 1) : 0;
           } else if (position === allEvents.length) {
             // Insert at end - use day of last event + 1
             nextDay = allEvents[allEvents.length - 1].day + 1;
           } else {
             // Insert between events - use day of previous event + 1, or same day if next event is also at that day
             const prevEvent = allEvents[position - 1];
             const nextEvent = allEvents[position];
             if (prevEvent && nextEvent && nextEvent.day === prevEvent.day) {
               nextDay = prevEvent.day; // Same day if next event is also at that day
             } else if (prevEvent) {
               nextDay = prevEvent.day + 1; // Previous day + 1
             } else {
               nextDay = 0; // Fallback
             }
           }
         } else {
           // Append to end (default behavior)
           const maxDay = Math.max(...allEvents.map(e => e.day));
           nextDay = maxDay + 1;
         }
      }
    }
    
    const eventHTML = `
      <div class="event-card" id="event-${id}">
        <h4><span class="event-number"></span> <button class="small remove" onclick="EventManager.removeEvent(${id})">Remove</button></h4>
        <label>Event Type</label>
        <select id="event-type-${id}" onchange="EventManager.updateEventFields(${id})">
          <option value="">Select event type...</option>
          <option value="investment">Investment</option>
          <option value="revenue">Revenue</option>
          <option value="loan">Loan</option>
          <option value="payback-loan">Pay Back Loan</option>
          <option value="cashout">Cash Out</option>
        </select>
        <div id="token-holder-container-${id}" style="display: none;">
          <label>Token Holder</label>
          <select id="token-holder-${id}" onchange="EventManager.updateEventFields(${id})">
            <option value="">Select token holder...</option>
          </select>
        </div>
        <label>Day (after launch)</label>
        <input type="number" id="event-day-${id}" value="${nextDay}" min="0" onchange="EventManager.sortEvents()">
        <div id="event-fields-${id}">
          <p style="color: #666; font-style: italic;">Select an event type above to configure this event</p>
        </div>
        <div style="display: none;">
          <label>Label (e.g., "Angel investor", "Series A")</label>
          <input type="text" id="event-label-${id}" value="" placeholder="Enter label">
        </div>
        <div class="event-visibility">
          <input type="checkbox" id="event-visible-${id}" checked onchange="EventManager.toggleEventVisibility(${id})">
          <label for="event-visible-${id}">Include in calculation</label>
        </div>
      </div>
    `;
    
    const eventElement = UI.createElement(eventHTML);
    
    if (position !== null) {
      // Insert at specific position
      const eventsContainer = UI.$('events');
      const eventElements = eventsContainer.querySelectorAll('.event-card');
      
      if (position === 0) {
        // Insert at the beginning
        eventsContainer.insertBefore(eventElement, eventsContainer.firstChild);
      } else if (position <= eventElements.length) {
        // Insert after the specified event (position is 1-based index)
        const targetElement = eventElements[position - 1];
        eventsContainer.insertBefore(eventElement, targetElement.nextSibling);
      } else {
        // Append to the end
        eventsContainer.appendChild(eventElement);
      }
    } else {
      // Append to the end (default behavior)
      UI.$('events').appendChild(eventElement);
    }
    
    State.events.push(id);

    
    // Don't auto-calculate when adding a new event since it has no type selected yet
    
    // Add event listener for day changes to update liability info
    const dayInput = UI.$(`event-day-${id}`);
    if (dayInput) {
      dayInput.addEventListener('change', () => {
        this.sortEvents();
        this.updateEventFields(id);
        // Auto-calculate when day changes
        setTimeout(() => this.autoCalculate(), 100);
      });
    }
    
    this.sortEvents();
    
    // Add input event listeners for auto-calculation
    this.addInputEventListeners(id);
    
    // Update add event buttons after adding new event
    this.updateAddEventButtons();
  },

  removeEvent(id) {
    UI.$(`event-${id}`).remove();
    State.events = State.events.filter(e => e !== id);
    this.sortEvents();
    
    // Check if this changes the current scenario
    this.checkScenarioChange();
    
    // Auto-calculate after removing event
    setTimeout(() => this.autoCalculate(), 100);
    
    // Update add event buttons after removing event
    this.updateAddEventButtons();
  },

  updateEvent(id) {
    // Recalculate the model
    Calculator.run();
    
    // Update all event fields to reflect new calculation results
    State.events.forEach(eventId => {
      this.updateEventFields(eventId);
    });
  },

  populateTokenHolderDropdown(id, eventType) {
    const tokenHolderSelect = UI.$(`token-holder-${id}`);
    if (!tokenHolderSelect) return;
    
    

    
    // Store the current user selection before repopulating
    const currentUserSelection = tokenHolderSelect.value;
    
    // Clear existing options completely
    tokenHolderSelect.innerHTML = '';
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select token holder...';
    tokenHolderSelect.appendChild(placeholderOption);
    
    const day = parseInt(UI.$(`event-day-${id}`).value) || 0;
    
    // Force a fresh state calculation by clearing any cached state
    if (typeof StateMachine !== 'undefined' && StateMachine.getStateAtDay) {
      // Force recalculation by calling with a fresh day calculation
      const freshState = StateMachine.getStateAtDay(day - 1);
    }
    
    // Get all available token holders with proper display names
    const availableTokenHolders = new Map(); // Use Map to avoid duplicates
    

    
    // Try to get state from StateMachine if it's available
    try {
      if (eventType === 'loan' || eventType === 'cashout') {
        // For loans and cash outs, show token holders with available tokens
        const state = StateMachine.getStateAtDay(day - 1);
        if (state && state.tokensByLabel) {
          Object.entries(state.tokensByLabel).forEach(([normalizedLabel, tokens]) => {
            const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
            if (availableTokens > 0) {
              // Get the proper display name for this label
              let displayName = this.getDisplayNameForLabel(normalizedLabel);
              availableTokenHolders.set(normalizedLabel, displayName);
            }
          });
        }
      } else if (eventType === 'payback-loan') {
        // For loan repayments, show token holders with outstanding loans
        const state = StateMachine.getStateAtDay(day - 1);
        if (state && state.loanHistory) {
          Object.entries(state.loanHistory).forEach(([normalizedLabel, loans]) => {
            const totalRemainingTokens = loans.reduce((sum, loan) => sum + loan.remainingTokens, 0);
            if (totalRemainingTokens > 0) {
              // Get the proper display name for this label
              let displayName = this.getDisplayNameForLabel(normalizedLabel);
              availableTokenHolders.set(normalizedLabel, displayName);
            }
          });
        }
        

      }
    } catch (error) {
      // StateMachine not ready yet, use default options
    }
    
    // Add options to dropdown
    const finalOptions = Array.from(availableTokenHolders.values());
    
    // Use the final options directly - no hard-coded filtering needed
    let filteredOptions = finalOptions;
    
    // Add the filtered options to the dropdown
    filteredOptions.forEach(displayName => {
      const option = document.createElement('option');
      option.value = displayName;
      option.textContent = displayName;
      tokenHolderSelect.appendChild(option);
    });
    
    // Set the selected value based on priority:
    // 1. Current user selection (preserve what user selected)
    // 2. First available option if no user selection
    if (currentUserSelection && filteredOptions.includes(currentUserSelection)) {
      // Preserve the user's current selection
      tokenHolderSelect.value = currentUserSelection;
    } else if (filteredOptions.length > 0) {
      // If no user selection but we have options, select the first one
      tokenHolderSelect.value = filteredOptions[0];
    } else {
      tokenHolderSelect.value = '';
    }
    
    // Update the Initial State and Resulting State after setting the token holder
    if (tokenHolderSelect.value) {
      setTimeout(() => {
        if (eventType === 'loan') {
          this.updateLoanInitialState(id, tokenHolderSelect.value);
          this.updateLoanPotential(id, tokenHolderSelect.value);
        } else if (eventType === 'payback-loan') {
          this.updatePaybackInitialState(id, tokenHolderSelect.value);
          this.updateRepayResultingState(id, tokenHolderSelect.value);
        }
      }, 0);
    }
  },






  updateLoanInitialState(eventId, entityLabel) {
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Use StateMachine as single source of truth for Revnet balance
    // For Initial State, we want the state BEFORE this event, so use day-1
    const state = StateMachine.getStateAtDay(day - 1);
    
    // Get available tokens and loan potential for the selected token holder
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
    const loanPotential = StateMachine.getLoanPotential(normalizedLabel, day - 1); 

    // Update the Initial State section
    const revnetBalanceElement = UI.$(`revnet-balance-${eventId}`);
    const tokensAvailableElement = UI.$(`tokens-available-${eventId}`);
    const loanPotentialElement = UI.$(`loan-potential-${eventId}`);
    
    if (revnetBalanceElement) {
      revnetBalanceElement.innerHTML = `<strong>${Utils.formatCurrency(state.revnetBacking)}</strong>`;
    }
    if (tokensAvailableElement) {
      tokensAvailableElement.innerHTML = `<strong>${(availableTokens / SCALING.TOKENS_TO_M).toFixed(3)}M tokens</strong>`;
    }
    if (loanPotentialElement) {
      loanPotentialElement.innerHTML = `<strong>${Utils.formatCurrency(loanPotential)}</strong>`;
    }
  },

  updatePaybackInitialState(eventId, entityLabel) {
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Get state before this payback event (which should be the state after the previous event)
    const state = StateMachine.getStateAtDay(day - 1);
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const outstandingLiability = StateMachine.getOutstandingLiability(normalizedLabel, day - 1);
    const collateralizedTokens = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
    

    
    // Update the Initial State section
    const revnetBalanceElement = UI.$(`revnet-balance-${eventId}`);
    const tokensAvailableElement = UI.$(`tokens-available-${eventId}`);
    const loanPotentialElement = UI.$(`loan-potential-${eventId}`);
    const collateralizedTokensElement = UI.$(`collateralized-tokens-${eventId}`);
    
    if (revnetBalanceElement) {
      revnetBalanceElement.innerHTML = `<strong>${Utils.formatCurrency(state.revnetBacking)}</strong>`;
    }
    if (tokensAvailableElement) {
      tokensAvailableElement.innerHTML = `<strong>${Utils.formatCurrency(outstandingLiability.principal)}</strong>`;
    }
    if (loanPotentialElement) {
      // Calculate interest breakdown details
      const daysElapsed = (day - 1) - 1; // Days since loan was taken out (day 1)
      const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365); // 6-month grace period
      const interestRate = Math.exp(0.05 * yearsElapsed); // 5% continuous compounding
      
      const interestBreakdown = `<strong>${Utils.formatCurrency(outstandingLiability.interest)}</strong> <em>(${daysElapsed} days, ${(yearsElapsed * 100).toFixed(1)}% of year after grace, ${((interestRate - 1) * 100).toFixed(1)}% rate)</em>`;
      loanPotentialElement.innerHTML = interestBreakdown;
    }
    if (collateralizedTokensElement) {
      collateralizedTokensElement.innerHTML = `<strong>${collateralizedTokens.toLocaleString()}</strong>`;
    }
  },

  updateLoanPotential(eventId, entityLabel) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`loan-potential-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const tokenAmount = parseInt(inputElement.value.replace(/,/g, '') || 0);
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    const eventType = UI.$(`event-type-${eventId}`)?.value;
    
    if (tokenAmount === 0) {
      stateElement.textContent = 'Enter token amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.textContent = 'Unable to calculate preview';
      return;
    }
    
    // Get state before event for calculations
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    
    // Update the Initial State section first
    if (eventType === 'payback-loan') {
      this.updatePaybackInitialState(eventId, entityLabel);
    } else if (eventType === 'cashout') {
      this.updateCashOutInitialState(eventId, entityLabel);
    } else {
      this.updateLoanInitialState(eventId, entityLabel);
    }
    
    // For Resulting State, use StateMachine as single source of truth
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    if (eventType === 'payback-loan') {
      // For payback events, show collateralized tokens
      const collateralizedTokens = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
      stateElement.textContent = collateralizedTokens.toLocaleString();
    } else if (eventType === 'cashout') {
      // For cash out events, show cash out potential
      const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
      const cashOutPotential = StateMachine.calculateCashOutValueForEvent(availableTokens, stateBeforeEvent.totalSupply, stateBeforeEvent.revnetBacking, stage.cashOutTax);
      stateElement.textContent = Utils.formatCurrency(cashOutPotential);
    } else {
      // For loan events, show loan potential
      const loanPotential = StateMachine.getLoanPotential(normalizedLabel, day);
      stateElement.textContent = Utils.formatCurrency(loanPotential);
    }
  },

  updateLoanResultingState(eventId, entityLabel) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`loan-resulting-state-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const tokenAmount = parseInt(inputElement.value.replace(/,/g, '') || 0) * 1000000; // Convert M tokens to actual tokens
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Check for validation errors
    const error = this.validateEventAmount(eventId);
    if (error) {
      stateElement.innerHTML = '<span style="color: #d32f2f; font-style: italic;">Invalid - Amount exceeds available tokens</span>';
      return;
    }
    
    if (tokenAmount === 0) {
      stateElement.innerHTML = 'Enter token amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.innerHTML = 'Unable to calculate preview';
      return;
    }
    
    // Use StateMachine to get the state after this loan event
    const stateAfterEvent = StateMachine.getStateAtDay(day);
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    
    // Calculate loan amount based on cash out value of tokens being locked as collateral
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const loanPotentialBefore = StateMachine.getLoanPotential(normalizedLabel, day - 1);
    const loanAmount = StateMachine.calculateCashOutValueForEvent(tokenAmount, stateBeforeEvent.totalSupply, stateBeforeEvent.revnetBacking, stage.cashOutTax);
    
            // Calculate fees
        const fees = StateMachine.calculateLoanFees(loanAmount);
    const totalFees = fees.internal + fees.protocol;
    const netLoanAmount = loanAmount - totalFees;
    
    // Calculate token balance changes
    const totalTokensBefore = stateBeforeEvent.tokensByLabel[normalizedLabel] || 0;
    const totalTokensAfter = stateAfterEvent.tokensByLabel[normalizedLabel] || 0;
    const availableTokensBefore = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
    const availableTokensAfter = StateMachine.getAvailableTokens(normalizedLabel, day);
    const collateralizedTokensBefore = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
    const collateralizedTokensAfter = StateMachine.getCollateralizedTokens(normalizedLabel, day);
    
    // Calculate internal fee distribution to splits
    const internalFeeDistribution = [];
    let totalSplitAmount = 0;
    if (stage && stage.splits) {
      Object.entries(stage.splits).forEach(([splitLabel, splitPercent]) => {
        const splitAmount = fees.internal * splitPercent;
        totalSplitAmount += splitAmount;
        
        // Calculate tokens issued for this split's share of the fee
        const issuancePrice = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
        const tokensPerDollar = 1 / issuancePrice;
        const tokensIssued = Math.round(splitAmount * tokensPerDollar);
        
        // Normalize the split label to match how it's stored in StateMachine
      const normalizedSplitLabel = Utils.normalizeLabel(splitLabel);
      const tokensBefore = stateBeforeEvent.tokensByLabel[normalizedSplitLabel] || 0;
        const tokensAfter = tokensBefore + tokensIssued;
        
        internalFeeDistribution.push({
          label: splitLabel,
          amount: splitAmount,
          tokensBefore,
          tokensAfter,
          tokensIssued
        });
      });
    }
    
    // Calculate remaining amount for fee payer
    const feePayerAmount = fees.internal - totalSplitAmount;
    const feePayerTokensBefore = stateBeforeEvent.tokensByLabel[normalizedLabel] || 0;
    
    // Calculate tokens issued to fee payer for their share of the fee
    const issuancePrice = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
    const tokensPerDollar = 1 / issuancePrice;
    const feePayerTokensIssued = Math.round(feePayerAmount * tokensPerDollar);
    const feePayerTokensAfter = feePayerTokensBefore + feePayerTokensIssued;
    
    // Calculate the bonding curve details for inline display
    const cashOutValuePerToken = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
    const bondingCurveMultiplier = ((1 - stage.cashOutTax) + (tokenAmount * stage.cashOutTax / stateBeforeEvent.totalSupply));
    
    let stateHTML = `<table style="width: 100%;">`;
    stateHTML += `<tr><td>Loan Amount</td><td><strong>${Utils.formatCurrency(loanAmount)}</strong> <em>((${Utils.formatCurrency(stateBeforeEvent.revnetBacking)} × ${tokenAmount.toLocaleString()} / ${stateBeforeEvent.totalSupply.toLocaleString()}) × ((1 - ${stage.cashOutTax}) + (${tokenAmount.toLocaleString()} × ${stage.cashOutTax} / ${stateBeforeEvent.totalSupply.toLocaleString()})))</em></td></tr>`;
    stateHTML += `<tr><td>Internal Fee (2.5%)</td><td><strong>${Utils.formatCurrency(fees.internal)}</strong> <em>(${Utils.formatCurrency(loanAmount)} × 2.5%)</em></td></tr>`;
    stateHTML += `<tr><td>Protocol Fee (3.5%)</td><td><strong>${Utils.formatCurrency(fees.protocol)}</strong> <em>(${Utils.formatCurrency(loanAmount)} × 3.5%)</em></td></tr>`;
    stateHTML += `<tr><td>Net Loan Amount</td><td><strong>${Utils.formatCurrency(netLoanAmount)}</strong> <em>(${Utils.formatCurrency(loanAmount)} - ${Utils.formatCurrency(fees.internal)} - ${Utils.formatCurrency(fees.protocol)})</em></td></tr>`;
    stateHTML += `<tr><td>Revnet's balance</td><td><strong>${Utils.formatCurrency(stateAfterEvent.revnetBacking)}</strong> <em>(${Utils.formatCurrency(stateBeforeEvent.revnetBacking)} - ${Utils.formatCurrency(loanAmount)} + ${Utils.formatCurrency(fees.internal)} internal fee)</em></td></tr>`;
    stateHTML += `<tr><td>Token Balance Changes</td><td></td></tr>`;
    
    // Show borrower's token changes
    const netTokenChange = availableTokensAfter - availableTokensBefore;
    const formatTokens = (tokens) => tokens >= 1000000 ? `${(tokens / 1000000).toFixed(0)}M` : tokens.toLocaleString();
    stateHTML += `<tr><td></td><td>• ${entityLabel} (borrower): <strong>${formatTokens(Math.abs(netTokenChange))}</strong> <em>Available ${formatTokens(availableTokensBefore)} → ${formatTokens(availableTokensAfter)}, Collateralized ${formatTokens(collateralizedTokensBefore)} → ${formatTokens(collateralizedTokensAfter)}</em></td></tr>`;
    
    // Show fee distribution token gains
    if (internalFeeDistribution.length > 0) {
      internalFeeDistribution.forEach(split => {
        stateHTML += `<tr><td></td><td>• ${split.label}: <strong>+${formatTokens(split.amount)}</strong> <em>(${formatTokens(split.tokensBefore)} → ${formatTokens(split.tokensAfter)} tokens)</em></td></tr>`;
      });
    }
    
    // Show fee payer's additional token gain
    if (feePayerAmount > 0) {
      // The fee payer's total tokens increased, but their available tokens decreased due to collateralization
      const feePayerAvailableAfter = availableTokensAfter + feePayerTokensIssued;
      stateHTML += `<tr><td></td><td>• ${entityLabel} (fee payer): <strong>+${formatTokens(feePayerAmount)}</strong> <em>(${formatTokens(availableTokensAfter)} → ${formatTokens(feePayerAvailableAfter)} available tokens)</em></td></tr>`;
    }
    
    stateHTML += `</table>`;
    
    stateElement.innerHTML = stateHTML;
  },

  updateRepayResultingState(eventId, entityLabel) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`repay-resulting-state-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const tokenAmount = parseFloat(inputElement.value.replace(/,/g, '') || 0);
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Check for validation errors
    const error = this.validateEventAmount(eventId);
    if (error) {
      stateElement.innerHTML = '<span style="color: #d32f2f; font-style: italic;">Invalid - Amount exceeds collateralized tokens</span>';
      return;
    }
    
    if (tokenAmount === 0) {
      stateElement.innerHTML = 'Enter token amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.innerHTML = 'Unable to calculate preview';
      return;
    }
    
    // Calculate state before this repayment event (state after Event 2)
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const outstandingLiabilityBefore = StateMachine.getOutstandingLiability(normalizedLabel, day - 1);
    const collateralizedTokensBefore = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
    
    // Calculate the repayment effect based on tokens being uncollateralized
    const tokensBeingUncollateralized = tokenAmount * 1000000; // Convert M tokens to actual tokens
    const remainingCollateralized = collateralizedTokensBefore - tokensBeingUncollateralized;
    
    // Calculate new loan amount for remaining collateral using bonding curve
    const newLoanAmount = StateMachine.calculateCashOutValueForEvent(remainingCollateralized, stateBeforeEvent.totalSupply, stateBeforeEvent.revnetBacking, stage.cashOutTax);
    
    // Calculate amount being returned to Revnet (original loan - new loan)
    const originalLoanAmount = outstandingLiabilityBefore.principal;
    const amountReturnedToRevnet = originalLoanAmount - newLoanAmount;
    
    // Calculate internal fees (interest) on the amount being returned (if past grace period)
    const daysElapsed = (day - 1) - 1; // Days since loan was taken out (day 1)
    const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365); // 6-month grace period
    const interestRate = Math.exp(0.05 * yearsElapsed); // 5% continuous compounding
    const internalFeesFromReduction = amountReturnedToRevnet * (interestRate - 1);
    
    // Total amount paid back includes the returned amount plus internal fees
    const totalAmountPaidBack = amountReturnedToRevnet + internalFeesFromReduction;
    
    const newRevnetBalance = stateBeforeEvent.revnetBacking + amountReturnedToRevnet + internalFeesFromReduction;
    const remainingPrincipal = newLoanAmount;
    const remainingInterest = 0; // Reset interest since we're recalculating the loan
    const remainingTotal = remainingPrincipal + remainingInterest;
    
    let stateHTML = `<table style="width: 100%;">`;
    stateHTML += `<tr><td>Amount paid back</td><td><strong>${Utils.formatCurrency(totalAmountPaidBack)}</strong> <em>(${Utils.formatCurrency(amountReturnedToRevnet)} principal + ${Utils.formatCurrency(internalFeesFromReduction)} internal fees)</em></td></tr>`;
    stateHTML += `<tr><td>Principal paid back</td><td><strong>${Utils.formatCurrency(amountReturnedToRevnet)}</strong> <em>(${Utils.formatCurrency(totalAmountPaidBack)} - ${Utils.formatCurrency(internalFeesFromReduction)} fees)</em></td></tr>`;
    stateHTML += `<tr><td>Internal fees</td><td><strong>${Utils.formatCurrency(internalFeesFromReduction)}</strong> <em>(${Utils.formatCurrency(amountReturnedToRevnet)} × ${((interestRate - 1) * 100).toFixed(1)}% interest rate)</em></td></tr>`;
    stateHTML += `<tr><td>Revnet's balance</td><td><strong>${Utils.formatCurrency(newRevnetBalance)}</strong> <em>(${Utils.formatCurrency(stateBeforeEvent.revnetBacking)} + ${Utils.formatCurrency(amountReturnedToRevnet)} returned + ${Utils.formatCurrency(internalFeesFromReduction)} internal fees)</em></td></tr>`;
    stateHTML += `<tr><td>Outstanding loan</td><td><strong>${Utils.formatCurrency(remainingPrincipal)}</strong> <em>(new loan amount for ${(remainingCollateralized / 1000000).toFixed(3)}M remaining collateral)</em></td></tr>`;
    stateHTML += `<tr><td>Tokens collateralized</td><td><strong>${remainingCollateralized.toLocaleString()}</strong> <em>(${collateralizedTokensBefore.toLocaleString()} - ${tokensBeingUncollateralized.toLocaleString()} uncollateralized)</em></td></tr>`;
    stateHTML += `<tr><td>Token Balance Changes</td><td></td></tr>`;
    // Calculate the available tokens before this event
    const totalTokensBefore = stateBeforeEvent.tokensByLabel[normalizedLabel] || 0;
    const availableTokensBefore = totalTokensBefore - collateralizedTokensBefore;
    const availableTokensAfter = availableTokensBefore + tokensBeingUncollateralized;
    
    stateHTML += `<tr><td></td><td>• ${entityLabel}: <strong>+${(tokensBeingUncollateralized / 1000000).toFixed(3)}M tokens</strong> <em>(${(availableTokensBefore / 1000000).toFixed(3)}M → ${(availableTokensAfter / 1000000).toFixed(3)}M available, ${(collateralizedTokensBefore / 1000000).toFixed(3)}M → ${(remainingCollateralized / 1000000).toFixed(3)}M collateralized)</em></td></tr>`;
    
    // Calculate and show token issuance from internal fees
    if (internalFeesFromReduction > 0) {
      const issuancePrice = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
      const tokensPerDollar = 1 / issuancePrice;
      const tokensFromInternalFees = Math.round(internalFeesFromReduction * tokensPerDollar);
      
      // Distribute tokens according to stage splits
      const stage = StageManager.getStageAtDay(day);
      if (stage && stage.splits) {
        Object.entries(stage.splits).forEach(([splitLabel, splitPercent]) => {
          const tokensForSplit = Math.round(tokensFromInternalFees * splitPercent);
          // Normalize the split label to match how it's stored in StateMachine
        const normalizedSplitLabel = Utils.normalizeLabel(splitLabel);
        const currentTokens = stateBeforeEvent.tokensByLabel[normalizedSplitLabel] || 0;
          const newTokens = currentTokens + tokensForSplit;
          
          stateHTML += `<tr><td></td><td>• ${splitLabel}: <strong>+${(tokensForSplit / 1000000).toFixed(3)}M tokens</strong> <em>(${(currentTokens / 1000000).toFixed(3)}M → ${(newTokens / 1000000).toFixed(3)}M)</em></td></tr>`;
        });
      }
      
      // Show remaining tokens going to the fee payer
      const totalSplitPercent = stage && stage.splits ? Object.values(stage.splits).reduce((sum, percent) => sum + percent, 0) : 0;
      const remainingTokens = Math.round(tokensFromInternalFees * (1 - totalSplitPercent));
      if (remainingTokens > 0) {
        // Calculate the available balance after uncollateralization but before fees
        const availableAfterUncollateralization = availableTokensAfter;
        const availableAfterFees = availableAfterUncollateralization + remainingTokens;
        
        stateHTML += `<tr><td></td><td>• ${entityLabel} (fee payer): <strong>+${(remainingTokens / 1000000).toFixed(3)}M tokens</strong> <em>(${(availableAfterUncollateralization / 1000000).toFixed(3)}M → ${(availableAfterFees / 1000000).toFixed(3)}M available)</em></td></tr>`;
      }
    }
    stateHTML += `</table>`;
    
    stateElement.innerHTML = stateHTML;
  },

  updateCashOutInitialState(eventId, entityLabel) {
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Use StateMachine as single source of truth
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
    const collateralizedTokens = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
    
    // Calculate cash out potential
    const stage = StageManager.getStageAtDay(day);
    if (!stage) return;
    
    const cashOutPotential = StateMachine.calculateCashOutValueForEvent(availableTokens, stateBeforeEvent.totalSupply, stateBeforeEvent.revnetBacking, stage.cashOutTax);
    
    // Update the initial state elements
    const revnetBalanceElement = UI.$(`revnet-balance-${eventId}`);
    const tokensAvailableElement = UI.$(`tokens-available-${eventId}`);
    const loanPotentialElement = UI.$(`loan-potential-${eventId}`);
    
    if (revnetBalanceElement) {
      revnetBalanceElement.innerHTML = `<strong>${Utils.formatCurrency(stateBeforeEvent.revnetBacking)}</strong>`;
    }
    if (tokensAvailableElement) {
      tokensAvailableElement.innerHTML = `<strong>${(availableTokens / SCALING.TOKENS_TO_M).toFixed(3)}M tokens</strong>`;
    }
    if (loanPotentialElement) {
      loanPotentialElement.innerHTML = `<strong>${Utils.formatCurrency(cashOutPotential)}</strong>`;
    }
  },

  updateCashOutResultingState(eventId, entityLabel) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`cashout-resulting-state-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const tokenAmount = parseFloat(inputElement.value.replace(/,/g, '') || 0) * 1000000; // Convert M tokens to actual tokens
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    
    // Check for validation errors
    const error = this.validateEventAmount(eventId);
    if (error) {
      stateElement.innerHTML = '<span style="color: #d32f2f; font-style: italic;">Invalid - Amount exceeds available tokens</span>';
      return;
    }
    
    if (tokenAmount === 0) {
      stateElement.innerHTML = 'Enter token amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.innerHTML = 'Unable to calculate preview';
      return;
    }
    
    // Calculate cash out value (state before event)
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    const totalCashOutAmount = StateMachine.calculateCashOutValueForEvent(tokenAmount, stateBeforeEvent.totalSupply, stateBeforeEvent.revnetBacking, stage.cashOutTax);
    const externalFee = totalCashOutAmount * 0.05; // 5% external fee
    const netAmount = totalCashOutAmount - externalFee;
    
    // Calculate remaining tokens
    // Normalize the entity label to match how it's stored in StateMachine
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
    const remainingTokens = availableTokens - tokenAmount;
    const newRevnetBalance = stateBeforeEvent.revnetBacking - totalCashOutAmount;
    
    let stateHTML = `<table style="width: 100%;">`;
    stateHTML += `<tr><td>Cash out value</td><td><strong>${Utils.formatCurrency(totalCashOutAmount)}</strong> <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">((${Utils.formatCurrency(stateBeforeEvent.revnetBacking)} × ${tokenAmount.toLocaleString()} / ${stateBeforeEvent.totalSupply.toLocaleString()}) × ((1 - ${stage.cashOutTax}) + (${tokenAmount.toLocaleString()} × ${stage.cashOutTax} / ${stateBeforeEvent.totalSupply.toLocaleString()})))</code></td></tr>`;
    stateHTML += `<tr><td>External fees</td><td><strong>${Utils.formatCurrency(externalFee)}</strong> <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">(${Utils.formatCurrency(totalCashOutAmount)} × 5%)</code></td></tr>`;
    stateHTML += `<tr><td>Net amount received</td><td><strong>${Utils.formatCurrency(netAmount)}</strong> <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">(${Utils.formatCurrency(totalCashOutAmount)} - ${Utils.formatCurrency(externalFee)} external fees)</code></td></tr>`;
    stateHTML += `<tr><td>Revnet's balance</td><td><strong>${Utils.formatCurrency(newRevnetBalance)}</strong> <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">(${Utils.formatCurrency(stateBeforeEvent.revnetBacking)} - ${Utils.formatCurrency(totalCashOutAmount)} cash out)</code></td></tr>`;
    stateHTML += `<tr><td>Remaining tokens</td><td><strong>${(remainingTokens / 1000000).toFixed(3)}M tokens</strong> <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">(${(availableTokens / 1000000).toFixed(3)}M - ${(tokenAmount / 1000000).toFixed(3)}M)</code></td></tr>`;
    stateHTML += `</table>`;
    
    stateElement.innerHTML = stateHTML;
  },

  updateRevenueResultingState(eventId) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`revenue-resulting-state-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const amount = parseFloat(inputElement.value.replace(/,/g, '') || 0);
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    const label = UI.$(`event-label-${eventId}`)?.value || 'Generic Revenue';
    
    if (amount === 0) {
      stateElement.innerHTML = 'Enter revenue amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.innerHTML = 'Unable to calculate preview';
      return;
    }
    
    // Use StateMachine as single source of truth
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    
    // Calculate the effect of this revenue event
    const amountInDollars = amount * 1000000; // scale to dollars
    const issuancePrice = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
    const tokensPerDollar = 1 / issuancePrice;
    const totalTokensMinted = amountInDollars * tokensPerDollar; // amountInDollars already scaled, don't scale again
    
    // Calculate new state after revenue
    const newRevnetBalance = stateBeforeEvent.revnetBacking + amountInDollars;
    
    let stateHTML = `<table style="width: 100%;">`;
    stateHTML += `<tr><td>Revnet's balance</td><td>${Utils.formatCurrency(newRevnetBalance)}</td></tr>`;
    stateHTML += `<tr><td>Token Balances Changed</td><td></td></tr>`;
    
    // Show ALL split recipients and their token allocations
    let totalAllocatedTokens = 0;
    Object.entries(stage.splits).forEach(([splitLabel, splitPercent]) => {
      const tokensForSplit = Math.round(totalTokensMinted * splitPercent);
      totalAllocatedTokens += tokensForSplit;
      // Normalize the split label to match how it's stored in StateMachine
      const normalizedSplitLabel = Utils.normalizeLabel(splitLabel);
      const currentTokens = (stateBeforeEvent.tokensByLabel[normalizedSplitLabel] || 0);
      const newTokens = currentTokens + tokensForSplit;
      
      stateHTML += `<tr><td>• ${splitLabel}</td><td>+${(tokensForSplit / 1000000).toFixed(3)}M tokens (${(currentTokens / 1000000).toFixed(3)}M → ${(newTokens / 1000000).toFixed(3)}M)</td></tr>`;
    });
    
    // Show the payer getting any remaining tokens
    const remainingTokens = totalTokensMinted - totalAllocatedTokens;
    if (remainingTokens > 0) {
      // Normalize the payer label to match how it's stored in StateMachine
      const normalizedPayerLabel = Utils.normalizeLabel(label);
      const currentPayerTokens = (stateBeforeEvent.tokensByLabel[normalizedPayerLabel] || 0);
      const newPayerTokens = currentPayerTokens + remainingTokens;
      
      stateHTML += `<tr><td>• ${label}</td><td>+${(remainingTokens / 1000000).toFixed(3)}M tokens (${(currentPayerTokens / 1000000).toFixed(3)}M → ${(newPayerTokens / 1000000).toFixed(3)}M)</td></tr>`;
    }
    
    stateHTML += `</table>`;
    
    stateElement.innerHTML = stateHTML;
  },

  updateInvestmentResultingState(eventId) {
    const inputElement = UI.$(`event-amount-${eventId}`);
    const stateElement = UI.$(`investment-resulting-state-${eventId}`);
    
    if (!inputElement || !stateElement) return;
    
    const amount = parseFloat(inputElement.value.replace(/,/g, '') || 0);
    const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
    const label = UI.$(`event-label-${eventId}`)?.value || 'Generic investor';
    
    if (amount === 0) {
      stateElement.innerHTML = 'Enter investment amount above';
      return;
    }
    
    const stage = StageManager.getStageAtDay(day);
    if (!stage) {
      stateElement.innerHTML = 'Unable to calculate preview';
      return;
    }
    
    // Use StateMachine as single source of truth
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    
    // Calculate the effect of this investment event
    const amountInDollars = amount * 1000000; // scale to dollars
    const issuancePrice = stateBeforeEvent.totalSupply > 0 ? stateBeforeEvent.revnetBacking / stateBeforeEvent.totalSupply : 1;
    const tokensPerDollar = 1 / issuancePrice;
    const totalTokensMinted = amountInDollars * tokensPerDollar; // amountInDollars already scaled, don't scale again
    
    // Calculate new state after investment
    const newRevnetBalance = stateBeforeEvent.revnetBacking + amountInDollars;
    
    let stateHTML = `<table style="width: 100%;">`;
    stateHTML += `<tr><td>Revnet's balance</td><td><strong>${Utils.formatCurrency(newRevnetBalance)}</strong></td></tr>`;
    stateHTML += `<tr><td>Token Balances Changed</td><td></td></tr>`;
    
    // Show ALL split recipients and their token allocations
    let totalAllocatedTokens = 0;
    Object.entries(stage.splits).forEach(([splitLabel, splitPercent]) => {
      const tokensForSplit = Math.round(totalTokensMinted * splitPercent);
      totalAllocatedTokens += tokensForSplit;
      // Normalize the split label to match how it's stored in StateMachine
      const normalizedSplitLabel = Utils.normalizeLabel(splitLabel);
      const currentTokens = (stateBeforeEvent.tokensByLabel[normalizedSplitLabel] || 0);
      const newTokens = currentTokens + tokensForSplit;
      
      stateHTML += `<tr><td>• ${splitLabel}</td><td><strong>+${(tokensForSplit / 1000000).toFixed(3)}M tokens</strong> <em>(${(currentTokens / 1000000).toFixed(3)}M → ${(newTokens / 1000000).toFixed(3)}M)</em></td></tr>`;
    });
    
    // Show the payer getting any remaining tokens
    const remainingTokens = totalTokensMinted - totalAllocatedTokens;
    if (remainingTokens > 0) {
      // Normalize the payer label to match how it's stored in StateMachine
      const normalizedPayerLabel = Utils.normalizeLabel(label);
      const currentPayerTokens = (stateBeforeEvent.tokensByLabel[normalizedPayerLabel] || 0);
      const newPayerTokens = currentPayerTokens + remainingTokens;
      
      stateHTML += `<tr><td>• ${label}</td><td><strong>+${(remainingTokens / 1000000).toFixed(3)}M tokens</strong> <em>(${(currentPayerTokens / 1000000).toFixed(3)}M → ${(newPayerTokens / 1000000).toFixed(3)}M)</em></td></tr>`;
    }
    
    stateHTML += `</table>`;
    
    stateElement.innerHTML = stateHTML;
  },





  updateAllResultingStates() {
    // Get all event cards and update their resulting states
    const eventCards = document.querySelectorAll('[id^="event-card-"]');
    eventCards.forEach(card => {
      const eventId = card.id.replace('event-card-', '');
      const eventType = UI.$(`event-type-${eventId}`)?.value;
      
      if (!eventType) return;
      
      if (eventType === 'investment') {
        this.updateInvestmentResultingState(eventId);
      } else if (eventType === 'revenue') {
        this.updateRevenueResultingState(eventId);
      } else if (eventType === 'loan') {
        const tokenHolder = UI.$(`token-holder-${eventId}`)?.value;
        if (tokenHolder) {
          this.updateLoanInitialState(eventId, tokenHolder);
          this.updateLoanPotential(eventId, tokenHolder);
          this.updateLoanResultingState(eventId, tokenHolder);
        }
      } else if (eventType === 'payback-loan') {
        const tokenHolder = UI.$(`token-holder-${eventId}`)?.value;
        if (tokenHolder) {
          this.updatePaybackInitialState(eventId, tokenHolder);
          this.updateRepayResultingState(eventId, tokenHolder);
        }
      } else if (eventType === 'cashout') {
        const tokenHolder = UI.$(`token-holder-${eventId}`)?.value;
        if (tokenHolder) {
          this.updateCashOutResultingState(eventId, tokenHolder);
        }
      }
    });
  },

  // Save/Load functionality
  saveSequence(label) {
    const events = [];
    State.events.forEach(eventId => {
      const eventCard = UI.$(`event-${eventId}`);
      if (!eventCard) return;
      
      const event = {
        id: eventId,
        type: UI.$(`event-type-${eventId}`)?.value,
        day: parseInt(UI.$(`event-day-${eventId}`)?.value) || 0,
        amount: UI.$(`event-amount-${eventId}`)?.value,
        label: UI.$(`event-label-${eventId}`)?.value || 'Generic Entity',
        visible: UI.$(`event-visible-${eventId}`)?.checked || false
      };
      events.push(event);
    });
    
    const sequence = {
      label: label,
      timestamp: new Date().toISOString(),
      events: events,
      stages: State.stages
    };
    
    // Save to localStorage
    const savedSequences = JSON.parse(localStorage.getItem('revnetSequences') || '{}');
    savedSequences[label] = sequence;
    localStorage.setItem('revnetSequences', JSON.stringify(savedSequences));
    
    return sequence;
  },

  loadSequence(label) {
    const savedSequences = JSON.parse(localStorage.getItem('revnetSequences') || '{}');
    const sequence = savedSequences[label];
    
    if (!sequence) {
      alert('Sequence not found!');
      return false;
    }
    
    // Clear current events
    State.events.forEach(eventId => {
      const eventCard = UI.$(`event-${eventId}`);
      if (eventCard) eventCard.remove();
    });
    State.events = [];
    State.counters.event = 0;
    
    // Load stages
    if (sequence.stages) {
      State.stages = sequence.stages;
    }
    
    // Load events
    sequence.events.forEach(eventData => {
      const id = State.counters.event++;
      
      const eventHTML = `
        <div class="event-card" id="event-${id}">
          <h4><span class="event-number">Event ${id + 1}</span> <button class="small remove" onclick="EventManager.removeEvent(${id})">Remove</button></h4>
          <label>Event Type</label>
          <select id="event-type-${id}" onchange="EventManager.updateEventFields(${id})">
            <option value="">Select event type...</option>
            <option value="investment" ${eventData.type === 'investment' ? 'selected' : ''}>Investment</option>
            <option value="revenue" ${eventData.type === 'revenue' ? 'selected' : ''}>Revenue</option>
            <option value="loan" ${eventData.type && eventData.type.endsWith('-loan') ? 'selected' : ''}>Loan</option>
            <option value="payback-loan" ${eventData.type && eventData.type.endsWith('-repay') ? 'selected' : ''}>Pay Back Loan</option>
            <option value="cashout" ${eventData.type && eventData.type.endsWith('-cashout') ? 'selected' : ''}>Cash Out</option>
          </select>
          <div id="token-holder-container-${id}" style="display: none;">
            <label>Token Holder</label>
            <select id="token-holder-${id}" onchange="EventManager.updateEventFields(${id})">
              <option value="">Select token holder...</option>
            </select>
          </div>
          <label>Day (after launch)</label>
          <input type="number" id="event-day-${id}" value="${eventData.day}" min="0" onchange="EventManager.sortEvents()">
          <div id="event-fields-${id}">
            <!-- Fields will be populated by updateEventFields -->
          </div>
          <div class="event-visibility">
            <input type="checkbox" id="event-visible-${id}" ${eventData.visible ? 'checked' : ''} onchange="EventManager.toggleEventVisibility(${id})">
            <label for="event-visible-${id}">Include in calculation</label>
          </div>
        </div>
      `;
      
      UI.$('events').appendChild(UI.createElement(eventHTML));
      State.events.push(id);
      
      // Update event fields and restore values
      this.updateEventFields(id);
      
      // Restore specific values
      if (eventData.amount) UI.$(`event-amount-${id}`).value = eventData.amount;
      if (eventData.label) UI.$(`event-label-${id}`).value = eventData.label;
    });
    
    this.sortEvents();
    this.updateAllEventTypes();
    
    return true;
  },

  exportSequence() {
    const label = prompt('Enter a name for this sequence:');
    if (!label) return;
    
    const sequence = this.saveSequence(label);
    const exportData = {
      label: label,
      timestamp: sequence.timestamp,
      events: sequence.events,
      stages: sequence.stages,
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revnet-sequence-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Sequence "${label}" exported successfully!`);
  },

  importSequence(jsonData) {
    try {
      const sequence = JSON.parse(jsonData);
      
      if (!sequence.events || !Array.isArray(sequence.events)) {
        throw new Error('Invalid sequence format');
      }
      
      // Clear current events
      State.events.forEach(eventId => {
        const eventCard = UI.$(`event-${eventId}`);
        if (eventCard) eventCard.remove();
      });
      State.events = [];
      State.counters.event = 0;
      
      // Load stages if available
      if (sequence.stages) {
        State.stages = sequence.stages;
      }
      
      // Load events
      sequence.events.forEach(eventData => {
        const id = State.counters.event++;
        
        const eventHTML = `
          <div class="event-card" id="event-${id}">
            <h4><span class="event-number">Event ${id + 1}</span> <button class="small remove" onclick="EventManager.removeEvent(${id})">Remove</button></h4>
            <label>Event Type</label>
            <select id="event-type-${id}" onchange="EventManager.updateEventFields(${id})">
              <option value="investment" ${eventData.type === 'investment' ? 'selected' : ''}>Investment</option>
              <option value="revenue" ${eventData.type === 'revenue' ? 'selected' : ''}>Revenue</option>
              <option value="loan" ${eventData.type === 'loan' ? 'selected' : ''}>Loan</option>
              <option value="payback-loan" ${eventData.type === 'payback-loan' ? 'selected' : ''}>Pay Back Loan</option>
              <option value="cashout" ${eventData.type === 'cashout' ? 'selected' : ''}>Cash Out</option>
            </select>
            <label>Day (after launch)</label>
            <input type="number" id="event-day-${id}" value="${eventData.day}" min="0" onchange="EventManager.sortEvents()">
            <div id="event-fields-${id}">
              <!-- Fields will be populated by updateEventFields -->
            </div>
            <div class="event-visibility">
              <input type="checkbox" id="event-visible-${id}" ${eventData.visible ? 'checked' : ''} onchange="EventManager.toggleEventVisibility(${id})">
              <label for="event-visible-${id}">Include in calculation</label>
            </div>
          </div>
        `;
        
        UI.$('events').appendChild(UI.createElement(eventHTML));
        State.events.push(id);
        
        // Update event fields and restore values
        this.updateEventFields(id);
        
        // Restore specific values
        if (eventData.amount) UI.$(`event-amount-${id}`).value = eventData.amount;
        if (eventData.label) UI.$(`event-label-${id}`).value = eventData.label;
      });
      
      this.sortEvents();
      this.updateAllEventTypes();
      
      alert(`Sequence "${sequence.label}" imported successfully!`);
      return true;
      
    } catch (error) {
      alert('Error importing sequence: ' + error.message);
      return false;
    }
  },

  showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.importSequence(e.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  },

  sortEvents() {
    const eventElements = State.events.map(id => {
      const element = UI.$(`event-${id}`);
      const day = parseInt(UI.$(`event-day-${id}`).value) || 0;
      return { id, element, day };
    });
    
    eventElements.sort((a, b) => a.day - b.day);
    
    const eventsContainer = UI.$('events');
    eventElements.forEach((item, index) => {
      eventsContainer.appendChild(item.element);
      const numberSpan = item.element.querySelector('.event-number');
      numberSpan.textContent = `Event ${index + 1}`;
    });
    
    // Validate event ordering after sorting
    this.validateAllEventOrdering();
    
    // Update add event buttons after sorting
    this.updateAddEventButtons();
  },

  toggleEventVisibility(id) {
    const checkbox = UI.$(`event-visible-${id}`);
    const eventCard = UI.$(`event-${id}`);
    
    if (checkbox.checked) {
      eventCard.classList.remove('hidden');
    } else {
      eventCard.classList.add('hidden');
    }
    
    // Recalculate when visibility changes
    Calculator.run();
  },

  getAllEvents() {
    const allEvents = [];
    const labeledInvestments = {};
    
    // Check if we have any events to process
    if (!State.events || State.events.length === 0) {
      return { allEvents, labeledInvestments };
    }
    
    State.events.forEach(id => {
      // Check if event is visible (included in calculation)
      const visibleElement = UI.$(`event-visible-${id}`);
      const isVisible = visibleElement ? visibleElement.checked : true;
      if (!isVisible) return; // Skip hidden events
      
      const dayElement = UI.$(`event-day-${id}`);
      const typeElement = UI.$(`event-type-${id}`);
      const amountElement = UI.$(`event-amount-${id}`);
      
      // Add null checks to prevent errors
      if (!dayElement || !typeElement || !amountElement) {
        return;
      }
      
      const day = parseInt(dayElement.value);
      let type = typeElement.value;
      const rawAmount = amountElement.value || 0;
      let amount = parseFloat(rawAmount.replace(/,/g, ''));
      
      // Handle simplified event types by converting to specific format
      const specificType = this.getSpecificEventType(type, id);
      if (specificType === null) {
        // Skip events without token holder selected - don't auto-select
        if (type === 'loan' || type === 'payback-loan' || type === 'cashout') {
          const tokenHolderElement = UI.$(`token-holder-${id}`);
          if (!tokenHolderElement || !tokenHolderElement.value) {
            return; // No token holder selected, skip event
          }
        } else {
          return; // Skip events without token holder selected
        }
      } else {
        type = specificType;
      }
      
      // Only multiply by 1M for investments and revenue (not loans or cashouts)
      if (type === 'investment' || type === 'revenue') {
        amount *= 1000000;
      } else if (type.endsWith('-loan')) {
        // For loan events, amount is in tokens (M tokens * 1M = tokens)
        amount *= 1000000;
      } else if (type.endsWith('-repay')) {
        // For repayment events, amount is in tokens (M tokens * 1M = tokens)
        amount *= 1000000;
      } else if (type.endsWith('-cashout')) {
        // For cashout events, amount is in M tokens (M tokens * 1M = tokens)
        amount *= 1000000;
      }
      
      if (amount > 0) {
        let label = '';
        if (type === 'investment' || type === 'revenue') {
          const labelElement = UI.$(`event-label-${id}`);
          label = labelElement ? labelElement.value.trim() : '';
          if (!label) {
            label = type === 'investment' ? 'Generic investor' : 'Generic Revenue';
          }
        } else if (type.endsWith('-loan') || type.endsWith('-repay') || type.endsWith('-cashout')) {
          // For loan/repay/cashout events, get label from token holder dropdown
          const tokenHolderElement = UI.$(`token-holder-${id}`);
          label = tokenHolderElement ? tokenHolderElement.value : '';
          if (!label || label.trim() === '') {
            // Extract label from the event type if token holder is not set
            label = type.replace(/-loan|-repay|-cashout/g, '');
          }
        }
        
        const event = {
          day,
          type,
          amount,
          label: label
        };
        allEvents.push(event);
        
        if (type === 'investment' && event.label) {
          if (!labeledInvestments[event.label]) {
            labeledInvestments[event.label] = {
              totalInvested: 0,
              events: []
            };
          }
          labeledInvestments[event.label].totalInvested += amount;
          labeledInvestments[event.label].events.push({
            day,
            amount: amount
          });
        }
      }
    });
    
    allEvents.sort((a, b) => a.day - b.day);
    
    return { allEvents, labeledInvestments };
  },

  // Validation functions
  validateEventAmount(eventId) {
    const eventType = UI.$(`event-type-${eventId}`)?.value;
    const amount = parseFloat(UI.$(`event-amount-${eventId}`)?.value) || 0;
    const day = parseInt(UI.$(`event-day-${eventId}`)?.value) || 0;
    const tokenHolder = UI.$(`token-holder-${eventId}`)?.value;
    
    if (!eventType || amount <= 0) return null;
    
    // Validate event ordering by day
    const orderingError = this.validateEventOrdering(eventId, day);
    if (orderingError) return orderingError;
    
    // Get state before this event
    const stateBeforeEvent = StateMachine.getStateAtDay(day - 1);
    
    if (eventType === 'loan') {
      if (!tokenHolder) return 'Please select a token holder';
      
      const normalizedLabel = Utils.normalizeLabel(tokenHolder);
      const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
      const requestedTokens = amount * 1000000; // Convert M tokens to actual tokens
      
      if (requestedTokens > availableTokens) {
        return `Cannot collateralize ${(requestedTokens / 1000000).toFixed(3)}M tokens. Only ${(availableTokens / 1000000).toFixed(3)}M tokens available.`;
      }
    } else if (eventType === 'payback-loan') {
      if (!tokenHolder) return 'Please select a token holder';
      
      const normalizedLabel = Utils.normalizeLabel(tokenHolder);
      const collateralizedTokens = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
      const requestedTokens = amount * 1000000; // Convert M tokens to actual tokens
      
      if (collateralizedTokens === 0) {
        return `${tokenHolder} has no outstanding loans to repay.`;
      }
      
      if (requestedTokens > collateralizedTokens) {
        return `Cannot uncollateralize ${(requestedTokens / 1000000).toFixed(3)}M tokens. Only ${(collateralizedTokens / 1000000).toFixed(3)}M tokens collateralized.`;
      }
    } else if (eventType === 'cashout') {
      if (!tokenHolder) return 'Please select a token holder';
      
      const normalizedLabel = Utils.normalizeLabel(tokenHolder);
      const availableTokens = StateMachine.getAvailableTokens(normalizedLabel, day - 1);
      const requestedTokens = amount * 1000000; // Convert M tokens to actual tokens
      
      if (requestedTokens > availableTokens) {
        return `Cannot cash out ${(requestedTokens / 1000000).toFixed(3)}M tokens. Only ${(availableTokens / 1000000).toFixed(3)}M tokens available.`;
      }
    }
    
    return null; // No error
  },

  showEventError(eventId, errorMessage) {
    const errorDiv = UI.$(`error-${eventId}`);
    if (errorDiv) {
      if (errorMessage) {
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#d32f2f';
        errorDiv.style.backgroundColor = '#ffebee';
        errorDiv.style.padding = '8px';
        errorDiv.style.margin = '8px 0';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.border = '1px solid #f44336';
        errorDiv.style.fontSize = '12px';
      } else {
        errorDiv.style.display = 'none';
      }
    }
  },

  updateAllDropdowns() {
    // Update all token holder dropdowns to reflect current state
    State.events.forEach(eventId => {
      const eventTypeElement = UI.$(`event-type-${eventId}`);
      const eventType = eventTypeElement?.value;
      if (eventType === 'loan' || eventType === 'payback-loan' || eventType === 'cashout') {
        // Force a fresh state calculation for this specific event
        this.populateTokenHolderDropdown(eventId, eventType);
      }
    });
  },

  updateTokenHolderSelections(changedEventId) {
    // When an event's token holder changes, update other events that might be affected
    State.events.forEach(eventId => {
      if (eventId === changedEventId) return; // Skip the event that just changed
      
      const eventType = UI.$(`event-type-${eventId}`)?.value;
      if (eventType === 'payback-loan') {
        const tokenHolderSelect = UI.$(`token-holder-${eventId}`);
        if (!tokenHolderSelect || !tokenHolderSelect.value) return;
        
        // Check if the currently selected token holder still has outstanding loans
        const day = parseInt(UI.$(`event-day-${eventId}`).value) || 0;
        const state = StateMachine.getStateAtDay(day - 1);
        const normalizedLabel = Utils.normalizeLabel(tokenHolderSelect.value);
        const collateralizedTokens = StateMachine.getCollateralizedTokens(normalizedLabel, day - 1);
        
        if (collateralizedTokens === 0) {
          // The selected token holder no longer has outstanding loans
          // Find a new valid token holder to select
          const availableTokenHolders = [];
          if (state && state.loanHistory) {
            Object.entries(state.loanHistory).forEach(([label, loans]) => {
              const totalRemainingTokens = loans.reduce((sum, loan) => sum + loan.remainingTokens, 0);
              if (totalRemainingTokens > 0) {
                const displayName = this.getDisplayNameForLabel(label);
                availableTokenHolders.push(displayName);
              }
            });
          }
          
          if (availableTokenHolders.length > 0) {
            // Select the first available token holder
            tokenHolderSelect.value = availableTokenHolders[0];
          } else {
            // No valid token holders available, clear the selection
            tokenHolderSelect.value = '';
          }
        }
      }
    });
  },

  validateAllEvents() {
    let hasErrors = false;
    
    State.events.forEach(eventId => {
      const error = this.validateEventAmount(eventId);
      this.showEventError(eventId, error);
      
      if (error) {
        hasErrors = true;
      }
    });
    
    return !hasErrors;
  },

  validateAllEventOrdering() {
    // Get all events with their days
    const allEvents = [];
    State.events.forEach(id => {
      const eventDay = parseInt(UI.$(`event-day-${id}`)?.value) || 0;
      const eventType = UI.$(`event-type-${id}`)?.value;
      if (eventType) { // Only include events that have a type selected
        allEvents.push({ id, day: eventDay });
      }
    });
    
    // Check for out-of-order events
    let hasOrderingErrors = false;
    for (let i = 0; i < allEvents.length - 1; i++) {
      if (allEvents[i].day > allEvents[i + 1].day) {
        const error = `Events must be ordered by day. Event ${allEvents[i + 1].id} (day ${allEvents[i + 1].day}) comes before Event ${allEvents[i].id} (day ${allEvents[i].day}).`;
        this.showEventError(allEvents[i + 1].id, error);
        hasOrderingErrors = true;
      }
    }
    
    // Clear errors for events that are now in order
    if (!hasOrderingErrors) {
      State.events.forEach(eventId => {
        const errorDiv = UI.$(`error-${eventId}`);
        if (errorDiv && errorDiv.textContent.includes('ordered by day')) {
          errorDiv.style.display = 'none';
        }
      });
    }
    
    return !hasOrderingErrors;
  },

  updateAddEventButtons() {
    const eventsContainer = UI.$('events');
    if (!eventsContainer) return;
    
    // Remove existing add event buttons
    const existingButtons = eventsContainer.querySelectorAll('.add-event-here');
    existingButtons.forEach(button => button.remove());
    
    // Get all event cards
    const eventCards = eventsContainer.querySelectorAll('.event-card');
    
    // Add buttons between events
    eventCards.forEach((eventCard, index) => {
      const addButton = document.createElement('button');
      addButton.className = 'add-event-here';
      addButton.textContent = 'Add event';
      addButton.onclick = () => this.addEvent(index + 1);
      
      // Insert button after this event card
      eventCard.parentNode.insertBefore(addButton, eventCard.nextSibling);
    });
    
    // Add button at the beginning if there are events
    if (eventCards.length > 0) {
      const addButtonFirst = document.createElement('button');
      addButtonFirst.className = 'add-event-here';
      addButtonFirst.textContent = 'Add event';
      addButtonFirst.onclick = () => this.addEvent(0);
      
      // Insert button before the first event card
      eventsContainer.insertBefore(addButtonFirst, eventCards[0]);
    }
  },

  checkScenarioChange() {
    // Check if current events match any predefined scenario
    const currentEvents = this.getAllEvents().allEvents;
    const currentScenario = window.ScenarioManager ? window.ScenarioManager.currentScenario : null;
    
    if (!currentScenario) return;
    
    const scenarioEvents = window.ScenarioManager.scenarios[currentScenario].events;
    
    // Compare events
    if (currentEvents.length !== scenarioEvents.length) {
      this.markScenarioChanged();
      return;
    }
    
    for (let i = 0; i < currentEvents.length; i++) {
      const current = currentEvents[i];
      const scenario = scenarioEvents[i];
      
      if (current.day !== scenario.day || 
          current.type !== scenario.type || 
          Math.abs(current.amount - scenario.amount * 1000000) > 1 || 
          current.label !== scenario.label) {
        this.markScenarioChanged();
        return;
      }
    }
  },

  markScenarioChanged() {
    if (window.ScenarioManager) {
      window.ScenarioManager.currentScenario = null;
      window.ScenarioManager.updateSelectedIndicator();
      window.ScenarioManager.showSaveButton();
    }
  },

  validateEventOrdering(eventId, day) {
    // Get all events and their days
    const allEvents = [];
    State.events.forEach(id => {
      if (id !== eventId) { // Exclude the current event being validated
        const eventDay = parseInt(UI.$(`event-day-${id}`)?.value) || 0;
        const eventType = UI.$(`event-type-${id}`)?.value;
        if (eventType) { // Only include events that have a type selected
          allEvents.push({ id, day: eventDay });
        }
      }
    });
    
    // Add the current event
    allEvents.push({ id: eventId, day: day });
    
    // Sort by day
    allEvents.sort((a, b) => a.day - b.day);
    
    // Check if the current event is in the correct position
    const currentEventIndex = allEvents.findIndex(e => e.id === eventId);
    const expectedIndex = allEvents.filter(e => e.day <= day).length - 1;
    
    if (currentEventIndex !== expectedIndex) {
      // Find the events that are out of order
      const outOfOrderEvents = [];
      for (let i = 0; i < allEvents.length - 1; i++) {
        if (allEvents[i].day > allEvents[i + 1].day) {
          outOfOrderEvents.push(allEvents[i + 1].id);
        }
      }
      
      if (outOfOrderEvents.length > 0) {
        return `Events must be ordered by day. Event ${eventId} (day ${day}) is out of order. Please reorder events by day.`;
      }
    }
    
    return null; // No error
  }
};

// Make available globally
window.EventManager = EventManager; 