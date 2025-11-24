// Calculator module for Revnet Planner
const Calculator = {
  run() {
    try {
      if (State.stages.length === 0) {
        alert('Please add at least one stage before running calculations.');
        return false;
      }
      
      if (!StageManager.validateSplits()) {
        return false;
      }
      
      this.calculate();
      return true;
    } catch (error) {
      alert('An error occurred during calculation. Please check your inputs.');
      return false;
    }
  },

  calculate(resetResults = false) {
    if (resetResults) {
      State.calculationResults = [];
    }
    
    const allEvents = EventManager.getAllEvents();
    if (allEvents.allEvents.length === 0) {
      return;
    }
    
    const maxDay = Math.max(...allEvents.allEvents.map(e => e.day));
    const results = [];
    
    // Use StateMachine to calculate state for each day
    for (let day = 0; day <= maxDay; day++) {
      const stateAtDay = StateMachine.getStateAtDay(day);
      const dayEvents = allEvents.allEvents.filter(e => e.day === day);
      
      const dayResult = {
        day: day,
        revnetBacking: stateAtDay.revnetBacking,
        totalSupply: stateAtDay.totalSupply,
        tokensByLabel: stateAtDay.tokensByLabel,
        dayLabeledInvestorLoans: stateAtDay.dayLabeledInvestorLoans,
        loanHistory: stateAtDay.loanHistory,
        events: dayEvents
      };
      
      results.push(dayResult);
    }
    
    State.calculationResults = results;
  },

  clearResults() {
    State.calculationResults = [];
  }
};

// Make available globally
window.Calculator = Calculator; 