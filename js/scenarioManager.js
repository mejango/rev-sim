// Scenario Manager for Revnet Calculator
const ScenarioManager = {
  scenarios: {
    'conservative-growth': {
      name: "Conservative Growth",
      description: "A steady, sustainable Revnet with consistent 10% annual revenue growth. Perfect for risk-averse investors looking for stable returns over time.",
      narrative: "This Revnet demonstrates steady, sustainable growth with consistent revenue generation. Starting with a $10M investment, it grows revenue by 10% annually, showing how organic growth creates value for all participants.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Angel Investor" },
        { day: 90, type: "revenue", amount: 2, label: "Q1 Revenue" },
        { day: 180, type: "revenue", amount: 2.2, label: "Q2 Revenue" },
        { day: 270, type: "revenue", amount: 2.42, label: "Q3 Revenue" },
        { day: 360, type: "revenue", amount: 2.66, label: "Q4 Revenue" },
        { day: 450, type: "revenue", amount: 2.93, label: "Q1 Revenue" },
        { day: 540, type: "revenue", amount: 3.22, label: "Q2 Revenue" }
      ]
    },

    'hypergrowth': {
      name: "Hypergrowth",
      description: "A high-risk, high-reward scenario with explosive exponential revenue growth. Ideal for investors seeking maximum returns and willing to accept volatility.",
      narrative: "This Revnet experiences true hypergrowth, with revenue doubling every 30 days. Starting with $1M in revenue, it grows to $32M in just 5 months, demonstrating exponential scaling.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Seed Investor" },
        { day: 90, type: "revenue", amount: 1, label: "Q1 Revenue" },
        { day: 180, type: "revenue", amount: 2, label: "Q2 Revenue" },
        { day: 270, type: "revenue", amount: 4, label: "Q3 Revenue" },
        { day: 360, type: "revenue", amount: 8, label: "Q4 Revenue" },
        { day: 450, type: "revenue", amount: 16, label: "Q5 Revenue" },
        { day: 540, type: "revenue", amount: 32, label: "Q6 Revenue" }
      ]
    },

    'bootstrap-scale': {
      name: "Bootstrap to Scale",
      description: "A bootstrapped Revnet that starts small and grows organically through revenue generation.",
      narrative: "This Revnet starts with minimal capital and grows organically through revenue generation, demonstrating sustainable growth without external funding.",
      events: [
        { day: 0, type: "investment", amount: 1, label: "Founder Investment" },
        { day: 60, type: "revenue", amount: 0.5, label: "First Revenue" },
        { day: 180, type: "revenue", amount: 1, label: "Growing Revenue" },
        { day: 300, type: "revenue", amount: 2, label: "Scaling Revenue" },
        { day: 420, type: "revenue", amount: 4, label: "Expanding Revenue" },
        { day: 540, type: "revenue", amount: 8, label: "Mature Revenue" }
      ]
    },

    'vc-fueled': {
      name: "VC-Fueled Growth",
      description: "A traditional startup trajectory with multiple funding rounds (Series A, B, C).",
      narrative: "This Revnet follows a traditional startup growth pattern with multiple funding rounds, showing how institutional backing can accelerate growth.",
      events: [
        { day: 0, type: "investment", amount: 2, label: "Angel Investor" },
        { day: 90, type: "investment", amount: 10, label: "Series A" },
        { day: 180, type: "revenue", amount: 3, label: "Product Revenue" },
        { day: 270, type: "investment", amount: 25, label: "Series B" },
        { day: 360, type: "revenue", amount: 8, label: "Scaling Revenue" },
        { day: 450, type: "revenue", amount: 15, label: "Mature Revenue" },
        { day: 540, type: "investment", amount: 50, label: "Series C" }
      ]
    },

    'community-driven': {
      name: "Community-Driven",
      description: "A Revnet focused on community building with generous token splits and incentives for active participants.",
      narrative: "This Revnet prioritizes community building with generous token splits. The focus is on creating value for community members through token distributions and incentives rather than maximizing investor returns.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Community Fund" },
        { day: 30, type: "revenue", amount: 1, label: "Community Revenue" },
        { day: 90, type: "revenue", amount: 2, label: "Growing Community" },
        { day: 180, type: "revenue", amount: 4, label: "Active Community" },
        { day: 270, type: "revenue", amount: 6, label: "Thriving Community" },
        { day: 360, type: "revenue", amount: 8, label: "Community Success" }
      ]
    },

    'boom-bust': {
      name: "Boom-Bust Cycle",
      description: "A volatile scenario showing rapid growth followed by market correction, demonstrating the risks and opportunities of timing.",
      narrative: "This Revnet experiences the classic boom-bust cycle with rapid initial growth followed by a market correction. It demonstrates the importance of timing and risk management in Revnet investments.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Early Investor" },
        { day: 60, type: "revenue", amount: 5, label: "Initial Growth" },
        { day: 120, type: "revenue", amount: 20, label: "Boom Phase" },
        { day: 180, type: "revenue", amount: 50, label: "Peak Growth" },
        { day: 240, type: "revenue", amount: 30, label: "Market Correction" },
        { day: 300, type: "revenue", amount: 25, label: "Stabilization" },
        { day: 360, type: "revenue", amount: 15, label: "Recovery" }
      ]
    },

    // Capital Access Scenarios (contextual variations of growth scenarios)
    'conservative-growth-with-loans': {
      name: "Conservative Growth + Team Loans",
      description: "Conservative growth with team taking strategic loans for operating capital.",
      narrative: "Building on the conservative growth pattern, the team takes substantial loans against their tokens to fund critical operations and expansion, demonstrating how teams can leverage their token holdings for working capital.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Angel Investor" },
        { day: 30, type: "loan", amount: 0.8, label: "Team" },
        { day: 90, type: "revenue", amount: 2, label: "Q1 Revenue" },
        { day: 120, type: "loan", amount: 1.2, label: "Team" },
        { day: 180, type: "revenue", amount: 2.2, label: "Q2 Revenue" },
        { day: 210, type: "loan", amount: 1.5, label: "Team" },
        { day: 270, type: "revenue", amount: 2.42, label: "Q3 Revenue" },
        { day: 300, type: "loan", amount: 1.8, label: "Team" },
        { day: 365, type: "revenue", amount: 2.66, label: "Q4 Revenue" },
        { day: 395, type: "loan", amount: 2.0, label: "Team" },
        { day: 455, type: "revenue", amount: 2.93, label: "Q1 Revenue" },
        { day: 485, type: "loan", amount: 2.2, label: "Team" },
        { day: 545, type: "revenue", amount: 3.22, label: "Q2 Revenue" },
        { day: 575, type: "payback-loan", amount: 1.0, label: "Team" }
      ]
    },

    'hypergrowth-with-exits': {
      name: "Hypergrowth + Investor Exits",
      description: "Hypergrowth with early investors cashing out portions as value multiplies.",
      narrative: "Building on the exponential growth pattern, early investors strategically cash out portions of their holdings as the value multiplies, demonstrating exit opportunities.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Seed Investor" },
        { day: 90, type: "revenue", amount: 1, label: "Q1 Revenue" },
        { day: 180, type: "revenue", amount: 2, label: "Q2 Revenue" },
        { day: 270, type: "revenue", amount: 4, label: "Q3 Revenue" },
        { day: 360, type: "cashout", amount: 0.2, label: "Seed Investor" },
        { day: 450, type: "revenue", amount: 8, label: "Q5 Revenue" },
        { day: 540, type: "cashout", amount: 0.3, label: "Seed Investor" }
      ]
    },

    'bootstrap-with-liquidity': {
      name: "Bootstrap + Strategic Liquidity",
      description: "Bootstrap growth with team using loans for expansion capital.",
      narrative: "Building on the bootstrap pattern, the team uses substantial loans to fund critical expansion while maintaining organic growth momentum, showing how bootstrapped companies can scale without external funding.",
      events: [
        { day: 0, type: "investment", amount: 1, label: "Founder Investment" },
        { day: 20, type: "loan", amount: 0.3, label: "Team" },
        { day: 60, type: "revenue", amount: 0.5, label: "First Revenue" },
        { day: 90, type: "loan", amount: 0.5, label: "Team" },
        { day: 180, type: "revenue", amount: 1, label: "Growing Revenue" },
        { day: 210, type: "loan", amount: 0.8, label: "Team" },
        { day: 240, type: "loan", amount: 1.2, label: "Team" },
        { day: 300, type: "revenue", amount: 2, label: "Scaling Revenue" },
        { day: 330, type: "loan", amount: 1.0, label: "Team" },
        { day: 360, type: "loan", amount: 0.8, label: "Team" },
        { day: 420, type: "revenue", amount: 4, label: "Expanding Revenue" },
        { day: 450, type: "loan", amount: 1.5, label: "Team" },
        { day: 480, type: "payback-loan", amount: 1.0, label: "Team" }
      ]
    },

    'vc-fueled-with-exits': {
      name: "VC-Fueled + Strategic Exits",
      description: "VC growth with early investors taking partial exits during funding rounds.",
      narrative: "Building on the VC-fueled pattern, early investors take strategic partial exits during major funding rounds while the Revnet continues to scale.",
      events: [
        { day: 0, type: "investment", amount: 2, label: "Angel Investor" },
        { day: 90, type: "investment", amount: 10, label: "Series A" },
        { day: 180, type: "revenue", amount: 3, label: "Product Revenue" },
        { day: 270, type: "investment", amount: 25, label: "Series B" },
        { day: 360, type: "cashout", amount: 0.2, label: "Angel Investor" },
        { day: 450, type: "revenue", amount: 15, label: "Mature Revenue" },
        { day: 540, type: "investment", amount: 50, label: "Series C" }
      ]
    },

    'community-with-liquidity': {
      name: "Community + Liquidity Access",
      description: "Community-driven growth with strategic liquidity for community members.",
      narrative: "Building on the community-driven pattern, community members access liquidity through loans while maintaining focus on community building.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Community Fund" },
        { day: 30, type: "revenue", amount: 1, label: "Community Revenue" },
        { day: 90, type: "revenue", amount: 2, label: "Growing Community" },
        { day: 180, type: "loan", amount: 0.2, label: "Community Fund" },
        { day: 270, type: "revenue", amount: 4, label: "Active Community" },
        { day: 360, type: "payback-loan", amount: 0.1, label: "Community Fund" },
        { day: 450, type: "revenue", amount: 8, label: "Community Success" }
      ]
    },

    'boom-bust-with-timing': {
      name: "Boom-Bust + Strategic Timing",
      description: "Boom-bust cycle with strategic exits during peak and loans during recovery.",
      narrative: "Building on the boom-bust pattern, participants use strategic timing for exits during peaks and loans during recovery phases.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Early Investor" },
        { day: 60, type: "revenue", amount: 5, label: "Initial Growth" },
        { day: 120, type: "revenue", amount: 20, label: "Boom Phase" },
        { day: 180, type: "revenue", amount: 50, label: "Peak Growth" },
        { day: 240, type: "cashout", amount: 0.4, label: "Early Investor" },
        { day: 300, type: "loan", amount: 0.3, label: "Early Investor" },
        { day: 360, type: "revenue", amount: 15, label: "Recovery" }
      ]
    },

    // Additional Capital Access scenarios
    'conservative-growth-with-exits': {
      name: "Conservative Growth + Investor Exits",
      description: "Conservative growth with investors taking partial exits.",
      narrative: "Building on the conservative growth pattern, investors take strategic partial exits as the Revnet demonstrates steady value appreciation.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Angel Investor" },
        { day: 90, type: "revenue", amount: 2, label: "Q1 Revenue" },
        { day: 180, type: "revenue", amount: 2.2, label: "Q2 Revenue" },
        { day: 270, type: "revenue", amount: 2.42, label: "Q3 Revenue" },
        { day: 360, type: "cashout", amount: 0.2, label: "Angel Investor" },
        { day: 450, type: "revenue", amount: 2.93, label: "Q4 Revenue" },
        { day: 540, type: "cashout", amount: 0.15, label: "Angel Investor" }
      ]
    },

    'hypergrowth-with-loans': {
      name: "Hypergrowth + Growth Financing",
      description: "Hypergrowth with team using loans to fuel expansion.",
      narrative: "Building on the exponential growth pattern, the team uses strategic loans to fund aggressive expansion and capitalize on rapid growth opportunities, demonstrating how hypergrowth companies can leverage their token value for scaling.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Seed Investor" },
        { day: 30, type: "loan", amount: 0.3, label: "Team" },
        { day: 60, type: "loan", amount: 0.4, label: "Team" },
        { day: 90, type: "revenue", amount: 1, label: "Q1 Revenue" },
        { day: 120, type: "loan", amount: 0.5, label: "Team" },
        { day: 150, type: "loan", amount: 0.6, label: "Team" },
        { day: 180, type: "revenue", amount: 2, label: "Q2 Revenue" },
        { day: 210, type: "loan", amount: 0.7, label: "Team" },
        { day: 240, type: "loan", amount: 0.8, label: "Team" },
        { day: 270, type: "revenue", amount: 4, label: "Q3 Revenue" },
        { day: 300, type: "loan", amount: 0.9, label: "Team" },
        { day: 330, type: "loan", amount: 1.0, label: "Team" },
        { day: 360, type: "revenue", amount: 8, label: "Q4 Revenue" },
        { day: 390, type: "loan", amount: 1.1, label: "Team" },
        { day: 420, type: "loan", amount: 1.2, label: "Team" },
        { day: 450, type: "revenue", amount: 16, label: "Q5 Revenue" },
        { day: 480, type: "loan", amount: 1.3, label: "Team" },
        { day: 510, type: "loan", amount: 1.4, label: "Team" },
        { day: 540, type: "revenue", amount: 32, label: "Q6 Revenue" },
        { day: 570, type: "payback-loan", amount: 0.8, label: "Team" }
      ]
    },

    'bootstrap-with-exits': {
      name: "Bootstrap + Founder Liquidity",
      description: "Bootstrap growth with founders taking partial exits.",
      narrative: "Building on the bootstrap pattern, founders take strategic partial exits to access personal liquidity while maintaining control.",
      events: [
        { day: 0, type: "investment", amount: 1, label: "Founder Investment" },
        { day: 60, type: "revenue", amount: 0.5, label: "First Revenue" },
        { day: 180, type: "revenue", amount: 1, label: "Growing Revenue" },
        { day: 300, type: "revenue", amount: 2, label: "Scaling Revenue" },
        { day: 360, type: "cashout", amount: 0.2, label: "Founder Investment" },
        { day: 420, type: "revenue", amount: 4, label: "Expanding Revenue" },
        { day: 540, type: "cashout", amount: 0.15, label: "Founder Investment" }
      ]
    },

    'vc-fueled-with-loans': {
      name: "VC-Fueled + Growth Bridge Loans",
      description: "VC growth with team using loans between funding rounds.",
      narrative: "Building on the VC-fueled pattern, the team uses substantial bridge loans between major funding rounds to maintain aggressive growth momentum and capitalize on market opportunities.",
      events: [
        { day: 0, type: "investment", amount: 2, label: "Angel Investor" },
        { day: 30, type: "loan", amount: 0.8, label: "Team" },
        { day: 90, type: "investment", amount: 10, label: "Series A" },
        { day: 120, type: "loan", amount: 1.5, label: "Team" },
        { day: 180, type: "revenue", amount: 3, label: "Product Revenue" },
        { day: 210, type: "loan", amount: 2.0, label: "Team" },
        { day: 270, type: "investment", amount: 25, label: "Series B" },
        { day: 300, type: "loan", amount: 2.5, label: "Team" },
        { day: 330, type: "loan", amount: 2.2, label: "Team" },
        { day: 360, type: "loan", amount: 2.0, label: "Team" },
        { day: 450, type: "revenue", amount: 15, label: "Mature Revenue" },
        { day: 480, type: "loan", amount: 2.8, label: "Team" },
        { day: 540, type: "investment", amount: 50, label: "Series C" },
        { day: 570, type: "loan", amount: 3.0, label: "Team" },
        { day: 600, type: "loan", amount: 1.8, label: "Team" },
        { day: 630, type: "loan", amount: 1.5, label: "Team" },
        { day: 720, type: "payback-loan", amount: 2.0, label: "Team" }
      ]
    },

    'community-with-exits': {
      name: "Community + Fund Exits",
      description: "Community-driven growth with community fund taking exits.",
      narrative: "Building on the community-driven pattern, the community fund takes strategic exits to provide returns to community members.",
      events: [
        { day: 0, type: "investment", amount: 5, label: "Community Fund" },
        { day: 30, type: "revenue", amount: 1, label: "Community Revenue" },
        { day: 90, type: "revenue", amount: 2, label: "Growing Community" },
        { day: 180, type: "revenue", amount: 4, label: "Active Community" },
        { day: 270, type: "cashout", amount: 0.3, label: "Community Fund" },
        { day: 360, type: "revenue", amount: 6, label: "Thriving Community" },
        { day: 450, type: "cashout", amount: 0.2, label: "Community Fund" }
      ]
    },

    'boom-bust-with-liquidity': {
      name: "Boom-Bust + Volatility Liquidity",
      description: "Boom-bust cycle with liquidity access during fluctuations.",
      narrative: "Building on the boom-bust pattern, participants access liquidity strategically during market fluctuations to manage risk and opportunities.",
      events: [
        { day: 0, type: "investment", amount: 10, label: "Early Investor" },
        { day: 60, type: "revenue", amount: 5, label: "Initial Growth" },
        { day: 120, type: "revenue", amount: 20, label: "Boom Phase" },
        { day: 180, type: "revenue", amount: 50, label: "Peak Growth" },
        { day: 240, type: "revenue", amount: 30, label: "Market Correction" },
        { day: 300, type: "loan", amount: 0.4, label: "Early Investor" },
        { day: 360, type: "revenue", amount: 15, label: "Recovery" }
      ]
    }
  },

  loadScenario(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) {
      console.error('Scenario not found:', scenarioKey);
      return;
    }

    // Determine if this is an operations scenario
    const isOperationsScenario = scenarioKey.includes('-with-');
    
    if (isOperationsScenario) {
      // For operations scenarios, load the base growth scenario first, then add operations events
      const baseScenarioKey = scenarioKey.split('-with-')[0];
      const baseScenario = this.scenarios[baseScenarioKey];
      
      if (baseScenario) {
        // Load the base growth scenario first
        this.loadGrowthScenario(baseScenarioKey);
        
        // Then add the operations events on top
        this.addOperationsEvents(scenario.events, scenarioKey);
      }
    } else {
      // For growth scenarios, clear and load normally
      this.loadGrowthScenario(scenarioKey);
    }
  },

  collapseScenariosDropdown() {
    const container = document.getElementById('scenarios-container');
    if (container) {
      container.style.display = 'none';
      const toggleIcon = container.previousElementSibling?.querySelector('.toggle-icon');
      if (toggleIcon) {
        toggleIcon.textContent = '▶';
        toggleIcon.style.transform = 'rotate(0deg)';
      }
    }
  },

  loadGrowthScenario(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) {
      console.error('Growth scenario not found:', scenarioKey);
      return;
    }

    // Update Capital Access scenarios based on the selected growth scenario
    this.updateCapitalAccessScenarios(scenarioKey);

    // Clear current state and selected operations scenarios
    this.clearScenario();
    this.selectedOperationsScenarios.clear();

    // Load growth scenario events
    scenario.events.forEach(eventData => {
      EventManager.addEvent();
      const eventId = State.events[State.events.length - 1];
      
      // Store the event data in State for later use
      if (!State.eventData) State.eventData = {};
      State.eventData[eventId] = { ...eventData };
      
      // Set all values without triggering updateEventFields
      const typeSelect = UI.$(`event-type-${eventId}`);
      if (typeSelect) {
        typeSelect.value = eventData.type;
      }

      const dayInput = UI.$(`event-day-${eventId}`);
      if (dayInput) {
        dayInput.value = eventData.day;
      }

      const labelInput = UI.$(`event-label-${eventId}`);
      if (labelInput) {
        labelInput.value = eventData.label;
      }

      const amountInput = UI.$(`event-amount-${eventId}`);
      if (amountInput) {
        amountInput.value = eventData.amount;
      }

      // For loan/repay/cashout events, set token holder
      if (eventData.type === 'loan' || eventData.type === 'payback-loan' || eventData.type === 'cashout') {
        const tokenHolderSelect = UI.$(`token-holder-${eventId}`);
        if (tokenHolderSelect) {
          EventManager.populateTokenHolderDropdown(eventId, eventData.type);
          tokenHolderSelect.value = eventData.label;
        }
      }
    });

    // Update scenario description
    this.updateScenarioDescription(scenarioKey, scenario);

    // Set as current scenario
    this.setCurrentScenario(scenarioKey);
    
    // Expand Events section so users can see and customize the loaded events
    this.expandEventsSection();

    // Show success message
    this.showNotification(`Loaded "${scenario.name}" scenario`, 'success');

    // Sort events by day after loading
    EventManager.sortEvents();
    
    // Update all event fields after all events are loaded
    State.events.forEach(eventId => {
      EventManager.updateEventFields(eventId);
    });
    // Clean up stored event data after it's been used
    State.eventData = {};
    
    // Force recalculation
    EventManager.forceRecalculation();
    
    // Collapse the scenarios dropdown after selection
    this.collapseScenariosDropdown();
  },

  addOperationsEvents(operationsEvents, operationsScenarioKey) {
    
    // Add operations events to existing growth scenario events
    operationsEvents.forEach(eventData => {
      EventManager.addEvent();
      const eventId = State.events[State.events.length - 1];
      
      // Store the event data in State for later use
      if (!State.eventData) State.eventData = {};
      State.eventData[eventId] = { ...eventData };
      
      // Set all values without triggering updateEventFields
      const typeSelect = UI.$(`event-type-${eventId}`);
      if (typeSelect) {
        typeSelect.value = eventData.type;
      }

      const dayInput = UI.$(`event-day-${eventId}`);
      if (dayInput) {
        dayInput.value = eventData.day;
      }

      const labelInput = UI.$(`event-label-${eventId}`);
      if (labelInput) {
        labelInput.value = eventData.label;
      }

      const amountInput = UI.$(`event-amount-${eventId}`);
      if (amountInput) {
        amountInput.value = eventData.amount;
      }

      // For loan/repay/cashout events, set token holder
      if (eventData.type === 'loan' || eventData.type === 'payback-loan' || eventData.type === 'cashout') {
        const tokenHolderSelect = UI.$(`token-holder-${eventId}`);
        if (tokenHolderSelect) {
          EventManager.populateTokenHolderDropdown(eventId, eventData.type);
          tokenHolderSelect.value = eventData.label;
        }
      }
    });

    // Sort events by day after loading
    EventManager.sortEvents();
    
    // Update all event fields after all events are loaded
    State.events.forEach(eventId => {
      EventManager.updateEventFields(eventId);
    });
    // Clean up stored event data after it's been used
    State.eventData = {};
    
    // Force recalculation
    EventManager.forceRecalculation();
  },

  updateScenarioDescription(scenarioKey, scenario) {
    const descriptionElement = UI.$('scenario-description');
    if (!descriptionElement) return;

    // Determine if this is an operations scenario
    const isOperationsScenario = scenarioKey.includes('-with-');
    let description = '';
    
    if (isOperationsScenario) {
      // Extract base scenario key
      const baseScenarioKey = scenarioKey.split('-with-')[0];
      const baseScenario = this.scenarios[baseScenarioKey];
      
      if (baseScenario) {
        description = `
          <div style="margin-bottom: 15px;">
            <strong style="color: #28a745;">Growth Strategy:</strong> ${baseScenario.name}<br>
            <em style="color: #666; font-size: 12px;">${baseScenario.description}</em>
          </div>
          <div>
            <strong style="color: #007bff;">Operations Strategy:</strong> ${scenario.name}<br>
            <em style="color: #666; font-size: 12px;">${scenario.description}</em>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 12px; color: #555;">
            <strong>Combined Story:</strong> ${baseScenario.narrative} ${scenario.narrative}
          </div>
        `;
      } else {
        description = `<strong>${scenario.name}</strong><br>${scenario.description}<br><br><em>${scenario.narrative}</em>`;
      }
    } else {
      description = `<strong>${scenario.name}</strong><br>${scenario.description}<br><br><em>${scenario.narrative}</em>`;
    }
    
    descriptionElement.innerHTML = description;
    descriptionElement.style.display = 'block';
  },

  toggleOperationsScenario(scenarioKey, isSelected) {
    if (isSelected) {
      this.selectedOperationsScenarios.add(scenarioKey);
    } else {
      this.selectedOperationsScenarios.delete(scenarioKey);
    }
    
    // Reload the current growth scenario with all selected operations
    this.reloadCurrentScenarioWithOperations();
  },

  reloadCurrentScenarioWithOperations() {
    if (!this.currentScenario) return;
    
    // Store current selected operations
    const currentSelected = new Set(this.selectedOperationsScenarios);
    
    // Load the base growth scenario (this will clear all events and selectedOperationsScenarios)
    this.loadGrowthScenario(this.currentScenario);
    
    // Restore selected operations
    this.selectedOperationsScenarios = currentSelected;
    
    // Collect all events from selected operations scenarios
    const allOperationsEvents = [];
    this.selectedOperationsScenarios.forEach(operationsKey => {
      const operationsScenario = this.scenarios[operationsKey];
      if (operationsScenario) {
        allOperationsEvents.push(...operationsScenario.events);
      }
    });
    
    // Add all operations events at once
    if (allOperationsEvents.length > 0) {
      this.addOperationsEvents(allOperationsEvents, 'combined-operations');
    }
    
    // Update the description to show all selected operations
    this.updateMultiOperationsDescription();
    
    // Restore checkbox states
    this.selectedOperationsScenarios.forEach(operationsKey => {
      const checkbox = document.getElementById(`ops-${operationsKey}`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    
    // Also uncheck checkboxes for deselected operations
    Object.keys(this.scenarios).forEach(scenarioKey => {
      if (scenarioKey.includes('-with-')) {
        const checkbox = document.getElementById(`ops-${scenarioKey}`);
        if (checkbox) {
          checkbox.checked = this.selectedOperationsScenarios.has(scenarioKey);
        }
      }
    });
  },

  updateMultiOperationsDescription() {
    const descriptionElement = UI.$('scenario-description');
    if (!descriptionElement || !this.currentScenario) return;

    const baseScenario = this.scenarios[this.currentScenario];
    if (!baseScenario) return;

    let description = `
      <div style="margin-bottom: 15px;">
        <strong style="color: #28a745;">Growth Strategy:</strong> ${baseScenario.name}<br>
        <em style="color: #666; font-size: 12px;">${baseScenario.description}</em>
      </div>
    `;

    if (this.selectedOperationsScenarios.size > 0) {
      description += `<div style="margin-bottom: 15px;"><strong style="color: #007bff;">Operations Strategies:</strong></div>`;
      
      this.selectedOperationsScenarios.forEach(operationsKey => {
        const operationsScenario = this.scenarios[operationsKey];
        if (operationsScenario) {
          description += `
            <div style="margin-bottom: 10px; padding-left: 15px;">
              <strong style="color: #007bff;">• ${operationsScenario.name}</strong><br>
              <em style="color: #666; font-size: 12px;">${operationsScenario.description}</em>
            </div>
          `;
        }
      });

      // Combine narratives
      let combinedNarrative = baseScenario.narrative;
      this.selectedOperationsScenarios.forEach(operationsKey => {
        const operationsScenario = this.scenarios[operationsKey];
        if (operationsScenario) {
          combinedNarrative += ' ' + operationsScenario.narrative;
        }
      });

      description += `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 12px; color: #555;">
          <strong>Combined Story:</strong> ${combinedNarrative}
        </div>
      `;
    }
    
    descriptionElement.innerHTML = description;
    descriptionElement.style.display = 'block';
  },

  loadNone() {
    // Clear scenario and set to None
    this.clearScenario();
    this.setCurrentScenario('none');
    this.selectedOperationsScenarios.clear();
    
    // Clear operations scenario checkboxes
    document.querySelectorAll('.scenario-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Clear capital access scenarios display
    const container = document.getElementById('capital-access-buttons');
    if (container) {
      container.innerHTML = '<p style="color: #666; font-style: italic;">Select a growth scenario to see operations options</p>';
    }
    
    // Recreate charts with empty data so axes are visible
    if (typeof ChartManager !== 'undefined') {
      ChartManager.createAll();
    }
    
    // Expand Events section so users can start adding their own events
    this.expandEventsSection();
    
    // Collapse the scenarios dropdown after selection
    this.collapseScenariosDropdown();
    
    // Don't show notification for default "None" selection
    // this.showNotification('Cleared scenario - starting with blank slate', 'info');
  },

  expandEventsSection() {
    const eventsContainer = document.getElementById('events-container');
    const eventsHeader = eventsContainer ? eventsContainer.previousElementSibling : null;
    if (eventsContainer && eventsHeader) {
      eventsContainer.style.display = 'block';
      const toggleIcon = eventsHeader.querySelector('.toggle-icon');
      if (toggleIcon) {
        toggleIcon.textContent = '▼';
        toggleIcon.style.transform = 'rotate(0deg)';
      }
    }
  },

  clearScenario() {
    // Clear all events (but keep stages)
    State.events.forEach(eventId => {
      const eventElement = UI.$(`event-${eventId}`);
      if (eventElement) eventElement.remove();
    });
    State.events = [];
    State.counters.event = 0;

    // Clear "Add event" buttons
    if (typeof EventManager !== 'undefined' && EventManager.updateAddEventButtons) {
      EventManager.updateAddEventButtons();
    }

    // Clear results
    State.calculationResults = [];
    if (State.charts) {
      Object.values(State.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      State.charts = {};
    }

    // Clear UI
    const summaryElement = UI.$('summary');
    if (summaryElement) summaryElement.innerHTML = '';
    
    const tableElement = UI.$('tableResults');
    if (tableElement) tableElement.innerHTML = '';

    // Hide scenario description
    const descriptionElement = UI.$('scenario-description');
    if (descriptionElement) descriptionElement.style.display = 'none';
  },

  // Track current scenario state
  currentScenario: null,
  selectedOperationsScenarios: new Set(),
  savedScenarios: {},

  // Load saved scenarios from localStorage
  loadSavedScenarios() {
    const saved = localStorage.getItem('revnet-saved-scenarios');
    if (saved) {
      this.savedScenarios = JSON.parse(saved);
    }
  },

  // Save scenarios to localStorage
  saveToLocalStorage() {
    localStorage.setItem('revnet-saved-scenarios', JSON.stringify(this.savedScenarios));
  },

  // Update current scenario state
  setCurrentScenario(scenarioKey) {
    this.currentScenario = scenarioKey;
    this.updateSelectedIndicator();
    this.updateSelectedButton();
    this.hideSaveButton();
  },

  // Update selected button visual state
  updateSelectedButton() {
    // Remove selected class from all scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add selected class to current scenario button
    if (this.currentScenario === 'none') {
      const noneBtn = document.getElementById('scenario-btn-none');
      if (noneBtn) noneBtn.classList.add('selected');
    } else if (this.currentScenario) {
      const btn = document.getElementById(`scenario-btn-${this.currentScenario}`);
      if (btn) btn.classList.add('selected');
    }
  },

  // Update selected scenario indicator
  updateSelectedIndicator() {
    const indicator = document.getElementById('selected-scenario-indicator');
    const nameSpan = document.getElementById('selected-scenario-name');
    
    if (this.currentScenario === 'none') {
      if (indicator) indicator.style.display = 'none';
    } else if (this.currentScenario && this.scenarios[this.currentScenario]) {
      if (indicator && nameSpan) {
        indicator.style.display = 'block';
        nameSpan.textContent = this.scenarios[this.currentScenario].name;
      }
    } else {
      if (indicator) indicator.style.display = 'none';
    }
  },

  // Show save button when events change
  showSaveButton() {
    const saveBtn = document.getElementById('save-scenario-btn');
    if (saveBtn) {
      saveBtn.style.display = 'inline-block';
    }
  },

  // Hide save button
  hideSaveButton() {
    const saveBtn = document.getElementById('save-scenario-btn');
    if (saveBtn) {
      saveBtn.style.display = 'none';
    }
  },

  // Show save dialog
  showSaveDialog() {
    const name = prompt('Enter a name for your scenario:');
    if (name && name.trim()) {
      const description = prompt('Enter a description (optional):');
      this.saveCurrentScenario(name.trim(), description || '');
    }
  },

  // Save current scenario
  saveCurrentScenario(name, description) {
    const events = EventManager.getAllEvents().allEvents.map(event => ({
      day: event.day,
      type: event.type,
      amount: event.amount / 1000000, // Convert back to M
      label: event.label
    }));

    const scenario = {
      name: name,
      description: description,
      events: events,
      timestamp: Date.now()
    };

    this.savedScenarios[name] = scenario;
    this.saveToLocalStorage();
    this.showNotification(`Scenario "${name}" saved!`, 'success');
  },

  // Export current scenario
  exportCurrentScenario() {
    const events = EventManager.getAllEvents().allEvents.map(event => ({
      day: event.day,
      type: event.type,
      amount: event.amount / 1000000,
      label: event.label
    }));

    const scenario = {
      name: this.currentScenario ? this.scenarios[this.currentScenario].name : 'Custom Scenario',
      description: this.currentScenario ? this.scenarios[this.currentScenario].description : 'Custom scenario',
      events: events
    };

    const dataStr = JSON.stringify(scenario, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  // Show import dialog
  showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const scenario = JSON.parse(e.target.result);
            this.loadImportedScenario(scenario);
          } catch (error) {
            this.showNotification('Invalid scenario file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  },

  // Load imported scenario
  loadImportedScenario(scenario) {
    this.clearScenario();
    
    scenario.events.forEach(eventData => {
      EventManager.addEvent();
      const eventId = State.events[State.events.length - 1];
      
      const typeSelect = UI.$(`event-type-${eventId}`);
      if (typeSelect) {
        typeSelect.value = eventData.type;
      }

      const dayInput = UI.$(`event-day-${eventId}`);
      if (dayInput) {
        dayInput.value = eventData.day;
      }

      const labelInput = UI.$(`event-label-${eventId}`);
      if (labelInput) {
        labelInput.value = eventData.label;
      }

      const amountInput = UI.$(`event-amount-${eventId}`);
      if (amountInput) {
        amountInput.value = eventData.amount;
      }

      if (eventData.type === 'loan' || eventData.type === 'payback-loan' || eventData.type === 'cashout') {
        const tokenHolderSelect = UI.$(`token-holder-${eventId}`);
        if (tokenHolderSelect) {
          EventManager.populateTokenHolderDropdown(eventId, eventData.type);
          tokenHolderSelect.value = eventData.label;
        }
      }

      EventManager.updateEventFields(eventId);
    });

    this.currentScenario = null;
    this.updateSelectedIndicator();
    this.showSaveButton();
    
    setTimeout(() => {
      EventManager.forceRecalculation();
    }, 100);
    
    this.showNotification(`Imported scenario: ${scenario.name}`, 'success');
  },

  // Initialize scenario management
  init() {
    this.loadSavedScenarios();
  },

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      z-index: 1000;
      opacity: 1;
      transform: translateX(0);
    `;

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#28a745';
        break;
      case 'error':
        notification.style.backgroundColor = '#dc3545';
        break;
      case 'warning':
        notification.style.backgroundColor = '#ffc107';
        notification.style.color = '#212529';
        break;
      default:
        notification.style.backgroundColor = '#17a2b8';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  },

  updateCapitalAccessScenarios(selectedScenarioKey) {

    
    // Mapping of growth scenarios to their operations variations
    const operationsMapping = {
      'conservative-growth': {
        title: "Conservative Growth Capital Access",
        description: "Explore liquidity options for steady, sustainable growth",
        scenarios: [
          {
            key: 'conservative-growth-with-loans',
            name: "Team Operating Loans",
            description: "Team takes strategic loans for operating capital",
            type: "builder"
          },
          {
            key: 'conservative-growth-with-exits',
            name: "Investor Partial Exits", 
            description: "Investors cash out portions as value grows steadily",
            type: "investor"
          }
        ]
      },
      'hypergrowth': {
        title: "Hypergrowth Capital Access",
        description: "Explore liquidity options for explosive growth",
        scenarios: [
          {
            key: 'hypergrowth-with-exits',
            name: "Strategic Investor Exits",
            description: "Investors exit portions as value multiplies",
            type: "investor"
          },
          {
            key: 'hypergrowth-with-loans',
            name: "Growth Financing Loans",
            description: "Team uses loans to fuel rapid expansion",
            type: "builder"
          }
        ]
      },
      'bootstrap-scale': {
        title: "Bootstrap Capital Access",
        description: "Explore liquidity options for organic growth",
        scenarios: [
          {
            key: 'bootstrap-with-liquidity',
            name: "Expansion Loans",
            description: "Team uses loans for strategic expansion",
            type: "builder"
          },
          {
            key: 'bootstrap-with-exits',
            name: "Founder Liquidity",
            description: "Founders take partial exits for personal liquidity",
            type: "investor"
          }
        ]
      },
      'vc-fueled': {
        title: "VC-Fueled Capital Access",
        description: "Explore liquidity options during funding rounds",
        scenarios: [
          {
            key: 'vc-fueled-with-exits',
            name: "Strategic Partial Exits",
            description: "Early investors exit during major funding rounds",
            type: "investor"
          },
          {
            key: 'vc-fueled-with-loans',
            name: "Growth Bridge Loans",
            description: "Team uses loans between funding rounds",
            type: "builder"
          }
        ]
      },
      'community-driven': {
        title: "Community Capital Access",
        description: "Explore liquidity options for community building",
        scenarios: [
          {
            key: 'community-with-liquidity',
            name: "Community Member Loans",
            description: "Community members access liquidity through loans",
            type: "builder"
          },
          {
            key: 'community-with-exits',
            name: "Community Fund Exits",
            description: "Community fund takes strategic exits",
            type: "investor"
          }
        ]
      },
      'boom-bust': {
        title: "Boom-Bust Capital Access",
        description: "Explore liquidity options for volatile markets",
        scenarios: [
          {
            key: 'boom-bust-with-timing',
            name: "Strategic Market Timing",
            description: "Exits during peaks, loans during recovery",
            type: "investor"
          },
          {
            key: 'boom-bust-with-liquidity',
            name: "Volatility Liquidity",
            description: "Access liquidity during market fluctuations",
            type: "builder"
          }
        ]
      }
    };

    const container = document.getElementById('capital-access-buttons');
    if (!container) {
      return;
    }

    // Get the mapping for the selected scenario
    const mapping = operationsMapping[selectedScenarioKey];
    if (!mapping) {
      container.innerHTML = '<p style="color: #666; font-style: italic;">Select a growth scenario to see operations options</p>';
      return;
    }

    // Generate the HTML for capital access scenarios
    let html = '';
    mapping.scenarios.forEach(scenario => {
      html += `
        <div class="scenario-option">
          <input type="checkbox" id="ops-${scenario.key}" class="scenario-checkbox" data-scenario-key="${scenario.key}">
          <label for="ops-${scenario.key}" class="scenario-btn ${scenario.type}">
            <strong>${scenario.name}</strong><br>
            <small>${scenario.description}</small>
          </label>
        </div>
      `;
    });
    container.innerHTML = html;
    
    // Add event listeners after HTML is inserted
    mapping.scenarios.forEach(scenario => {
      const checkbox = document.getElementById(`ops-${scenario.key}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          ScenarioManager.toggleOperationsScenario(scenario.key, e.target.checked);
        });
      }
    });
  }
};

// Make available globally
window.ScenarioManager = ScenarioManager; 