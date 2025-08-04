// Results display for Revnet Calculator
const ResultsDisplay = {
  showTable() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return;
    }
    
    const tableContainer = document.getElementById('tableResults');
    if (!tableContainer) return;
    
    let tableHTML = '<h3>Detailed Results</h3>';
    tableHTML += '<table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    tableHTML += '<thead><tr>';
    tableHTML += '<th>Day</th>';
    tableHTML += '<th>Revnet Balance</th>';
    tableHTML += '<th>Total Supply</th>';
    tableHTML += '<th>Investment</th>';
    tableHTML += '<th>Revenue</th>';
    tableHTML += '<th>Internal Fees</th>';
    tableHTML += '<th>Protocol Fees</th>';
    tableHTML += '<th>Loans</th>';
    tableHTML += '<th>Pay Back</th>';
    tableHTML += '<th>Cash Out</th>';
    tableHTML += '<th>Events</th>';
    tableHTML += '</tr></thead><tbody>';
    
    State.calculationResults.forEach(result => {
      // Only show rows that have actual events
      if (!result.events || result.events.length === 0) {
        return; // Skip this row
      }
      
      const day = result.day;
      const revnetBalance = result.revnetBacking;
      const totalSupply = result.totalSupply;
      
      // Extract event data
      let investment = 0;
      let revenue = 0;
      let internalFees = 0;
      let protocolFees = 0;
      let loans = 0;
      let payBack = 0;
      let cashOut = 0;
      let eventDescriptions = [];
      
      result.events.forEach(event => {
        if (event.type === 'investment') {
          investment += event.amount;
          eventDescriptions.push(`Investment: ${Utils.formatCurrency(event.amount)}`);
        } else if (event.type === 'revenue') {
          revenue += event.amount;
          eventDescriptions.push(`Revenue: ${Utils.formatCurrency(event.amount)}`);
        } else if (event.type.endsWith('-loan')) {
          // Calculate actual loan amount in dollars (not tokens)
          const stage = StageManager.getStageAtDay(day);
          let loanAmount = 0;
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            loanAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
          }
          const internalFee = loanAmount * 0.025;
          const protocolFee = loanAmount * 0.035; // 3.5% protocol fee
          
          loans += loanAmount;
          internalFees += internalFee;
          protocolFees += protocolFee;
          
          eventDescriptions.push(`${event.label} Loan: ${Utils.formatCurrency(loanAmount)}`);
        } else if (event.type.endsWith('-repay')) {
          // Calculate actual repayment amount in dollars (not tokens)
          const stage = StageManager.getStageAtDay(day);
          let repaymentAmount = 0;
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            repaymentAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
          }
          payBack += repaymentAmount;
          
          // Calculate repayment fees (interest) - same logic as in state.js
          const state = StateMachine.getStateAtDay(day - 1);
          const label = event.type.replace('-repay', '');
          const normalizedLabel = Utils.normalizeLabel(label);
          const entityLoans = state.loanHistory[normalizedLabel] || [];
          
          entityLoans.forEach(loan => {
            if (loan.remainingTokens > 0) {
              const daysElapsed = day - loan.day;
              const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365);
              const interestRate = Math.exp(0.05 * yearsElapsed) - 1;
              const interest = loan.amount * interestRate;
              internalFees += interest;
            }
          });
          
          eventDescriptions.push(`${event.label} Repayment: ${Utils.formatCurrency(repaymentAmount)}`);
        } else if (event.type.endsWith('-cashout')) {
          // Calculate actual cash out amount in dollars (not tokens)
          const stage = StageManager.getStageAtDay(day);
          let cashOutAmount = 0;
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            cashOutAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
          }
          cashOut += cashOutAmount;
          
          // Calculate external fee for cash out (5% of cash out value)
          const externalFee = cashOutAmount * 0.05;
          protocolFees += externalFee;
          
          eventDescriptions.push(`${event.label} Cash Out: ${Utils.formatCurrency(cashOutAmount)}`);
        }
      });
      
      // Add internal fees to revenue (since internal fees are revenue to Revnet)
      const totalRevenue = revenue + internalFees;
      
      tableHTML += '<tr>';
      tableHTML += `<td>${day}</td>`;
      tableHTML += `<td>${Utils.formatCurrency(revnetBalance)}</td>`;
      tableHTML += `<td>${totalSupply.toLocaleString()}</td>`;
      tableHTML += `<td>${investment > 0 ? Utils.formatCurrency(investment) : ''}</td>`;
      tableHTML += `<td>${totalRevenue > 0 ? Utils.formatCurrency(totalRevenue) : ''}</td>`;
      tableHTML += `<td>${internalFees > 0 ? Utils.formatCurrency(internalFees) : ''}</td>`;
      tableHTML += `<td>${protocolFees > 0 ? Utils.formatCurrency(protocolFees) : ''}</td>`;
      tableHTML += `<td>${loans > 0 ? Utils.formatCurrency(loans) : ''}</td>`;
      tableHTML += `<td>${payBack > 0 ? Utils.formatCurrency(payBack) : ''}</td>`;
      tableHTML += `<td>${cashOut > 0 ? Utils.formatCurrency(cashOut) : ''}</td>`;
      tableHTML += `<td title="${eventDescriptions.join('\n')}">${eventDescriptions.length} event(s)</td>`;
      tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
  },

  showSummary() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return;
    }
    
    const summaryContainer = document.getElementById('summary');
    if (!summaryContainer) return;
    
    const finalResult = State.calculationResults[State.calculationResults.length - 1];
    const lastStage = StageManager.getStageAtDay(finalResult.day);
    
    // Calculate key metrics
    const totalOutstandingLoans = Object.values(finalResult.dayLabeledInvestorLoans).reduce((sum, amount) => sum + amount, 0);
    const fullRevnetBalance = finalResult.revnetBacking + totalOutstandingLoans;
    const totalLockedTokens = Object.values(finalResult.loanHistory).reduce((sum, loans) => {
      return sum + loans.reduce((loanSum, loan) => loanSum + loan.remainingTokens, 0);
    }, 0);
    const liquidSupply = finalResult.totalSupply - totalLockedTokens;
    // Issuance Price (use stage config cut logic)
    const stage = StageManager.getStageAtDay(finalResult.day);
    let issuancePrice = 1.0;
    if (stage && stage.hasCuts) {
      const numCuts = Math.floor(finalResult.day / stage.cutPeriod);
      issuancePrice = Math.pow(1 + stage.issuanceCut, numCuts);
    }
    const cashOutValue = StateMachine.calculateCashOutValueForEvent(1, finalResult.totalSupply, finalResult.revnetBacking, lastStage.cashOutTax);
    
    let summaryHTML = '<div class="summary">';
    summaryHTML += `<h3>Final State (Day ${finalResult.day})</h3>`;
    summaryHTML += `<p><strong>Current Stage:</strong> ${lastStage.stageIndex + 1}</p>`;
    summaryHTML += `<p><strong>Total Supply:</strong> ${finalResult.totalSupply.toLocaleString()} tokens</p>`;
    summaryHTML += `<p><strong>Liquid Supply:</strong> ${liquidSupply.toLocaleString()} tokens (${totalLockedTokens.toLocaleString()} locked as collateral)</p>`;
    summaryHTML += `<p><strong>Revnet Balance:</strong> ${Utils.formatCurrency(finalResult.revnetBacking)} (actual balance)</p>`;
    summaryHTML += `<p><strong>Full Revnet Balance:</strong> ${Utils.formatCurrency(fullRevnetBalance)} (including ${Utils.formatCurrency(totalOutstandingLoans)} in outstanding loans)</p>`;
          summaryHTML += `<p><strong>Issuance Price:</strong> $${issuancePrice.toFixed(2)} (price for new investors)</p>`;
    summaryHTML += `<p><strong>Cash Out Value:</strong> $${cashOutValue.toFixed(8)} per token (cash out tax rate: ${lastStage.cashOutTax}, based on liquid supply)</p>`;
    
    // Split Analytics
    summaryHTML += '<h3>Split Analytics</h3>';
    
    // Get all unique labels from tokensByLabel
    const allLabels = Object.keys(finalResult.tokensByLabel);
    
    // Get all split labels from stages
    const stageSplitLabels = new Set();
    State.stages.forEach(stageId => {
      const splitsContainer = UI.$(`stage-splits-${stageId}`);
      if (splitsContainer) {
        const splitItems = splitsContainer.querySelectorAll('.split-item');
        splitItems.forEach(item => {
          const labelInput = item.querySelector('input[type="text"]');
          const label = labelInput.value.trim();
          if (label) {
            stageSplitLabels.add(Utils.normalizeLabel(label));
          }
        });
      }
    });
    
    const splitLabels = allLabels.filter(label => stageSplitLabels.has(label));
    
    splitLabels.forEach(label => {
      const tokens = finalResult.tokensByLabel[label] || 0;
      const ownership = (tokens / finalResult.totalSupply * 100).toFixed(1);
      const totalTokenValue = tokens * cashOutValue;
      const lockedTokens = finalResult.loanHistory[label] ? 
        finalResult.loanHistory[label].reduce((sum, loan) => sum + loan.remainingTokens, 0) : 0;
      const lockedPercent = tokens > 0 ? (lockedTokens / tokens * 100).toFixed(1) : 0;
      const freeTokens = tokens - lockedTokens;
      const freeTokenValue = freeTokens * cashOutValue;
      const loansOutstanding = finalResult.dayLabeledInvestorLoans[label] || 0;
      const loanPotential = StateMachine.getLoanPotential(label, finalResult.day);
      
      // Calculate total amount cashed out by this split
      let totalCashedOut = 0;
      let totalCashedOutTokens = 0;
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label && event.type.endsWith('-cashout')) {
            // Calculate actual cash out amount in dollars
            const stage = StageManager.getStageAtDay(result.day);
            if (stage) {
              const stateBefore = StateMachine.getStateAtDay(result.day - 1);
              const cashOutAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
              totalCashedOut += cashOutAmount;
              totalCashedOutTokens += event.amount;
            }
          }
        });
      });
      
      // Get the proper display name from stage splits
      let displayName = label;
      State.stages.forEach(stageId => {
        const splitsContainer = UI.$(`stage-splits-${stageId}`);
        if (splitsContainer) {
          const splitItems = splitsContainer.querySelectorAll('.split-item');
          splitItems.forEach(item => {
            const labelInput = item.querySelector('input[type="text"]');
            const originalLabel = labelInput.value.trim();
            if (Utils.normalizeLabel(originalLabel) === label) {
              displayName = originalLabel;
            }
          });
        }
      });
      
      summaryHTML += `
        <div class="split-analytics">
          <h4>${displayName}</h4>
          <p><strong>Tokens:</strong> ${tokens.toLocaleString()} (${ownership}%)</p>
          <p><strong>Token Value:</strong> ${Utils.formatCurrency(totalTokenValue)} ($${cashOutValue.toFixed(2)} per token)</p>
          <p><strong>Unlocked Token Value:</strong> ${Utils.formatCurrency(freeTokenValue)} (${freeTokens.toLocaleString()} free tokens)</p>
          <p><strong>Loans (Borrowed / Max):</strong> ${Utils.formatCurrency(loansOutstanding)} / ${Utils.formatCurrency(loanPotential)}</p>
          <p><strong>Tokens Backing Loans:</strong> ${lockedTokens.toLocaleString()} tokens (${lockedPercent}%)</p>
          <p><strong>Amount Cashed Out:</strong> ${Utils.formatCurrency(totalCashedOut)} (${totalCashedOutTokens.toLocaleString()} tokens)</p>
        </div>
      `;
    });
    
    // Payer Analytics - only show entities that actually invested money
    const payerLabels = allLabels.filter(label => {
      // First, check if this is a stage split (should be excluded)
      const isStageSplit = stageSplitLabels.has(label);
      if (isStageSplit) return false;
      
      // Then check if this entity actually invested money
      let totalInvested = 0;
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label && (event.type === 'investment' || event.type === 'revenue')) {
            totalInvested += event.amount;
          }
        });
      });
      
      // Only include if they actually invested money
      return totalInvested > 0;
    });
    
    if (payerLabels.length > 0) {
      summaryHTML += '<h3>Payer Analytics</h3>';
      
      payerLabels.forEach(label => {
        const totalTokens = finalResult.tokensByLabel[label] || 0;
        const ownership = (totalTokens / finalResult.totalSupply * 100).toFixed(2);
        const totalTokenValue = totalTokens * cashOutValue;
        const loansOutstanding = finalResult.dayLabeledInvestorLoans[label] || 0;
        const lockedTokens = finalResult.loanHistory[label] ? 
          finalResult.loanHistory[label].reduce((sum, loan) => sum + loan.remainingTokens, 0) : 0;
        const availableTokens = totalTokens - lockedTokens;
        
        // Calculate invested amount from events
        let invested = StateMachine.getTotalInvested(label, finalResult.day);
        
        // Calculate total amount cashed out by this entity
        let totalCashedOut = 0;
        State.calculationResults.forEach(result => {
          result.events.forEach(event => {
            if (Utils.normalizeLabel(event.label) === label && event.type.endsWith('-cashout')) {
              // Calculate actual cash out amount in dollars
              const stage = StageManager.getStageAtDay(result.day);
              if (stage) {
                const stateBefore = StateMachine.getStateAtDay(result.day - 1);
                const cashOutAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
                totalCashedOut += cashOutAmount;
              }
            }
          });
        });
        
        // Total value includes current token value + amount cashed out
        const totalValue = totalTokenValue + totalCashedOut;
        
        const roi = invested > 0 ? ((totalValue - invested) / invested * 100) : 0;
        const multiple = invested > 0 ? (totalValue / invested) : 0;
        
        // Get the proper display name from events
        let displayName = label;
        State.calculationResults.forEach(result => {
          result.events.forEach(event => {
            if (Utils.normalizeLabel(event.label) === label) {
              displayName = event.label;
            }
          });
        });
        
        summaryHTML += `
          <div class="investor-analytics">
            <h4>${displayName}</h4>
            <p><strong>Invested:</strong> $${invested.toLocaleString()}</p>
            <p><strong>Current Value:</strong> $${totalTokenValue.toLocaleString()}</p>
            ${totalCashedOut > 0 ? `<p><strong>Amount Cashed Out:</strong> $${totalCashedOut.toLocaleString()}</p>` : ''}
            <p><strong>Total Value:</strong> $${totalValue.toLocaleString()}</p>
            <p><strong>Return:</strong> ${roi > 0 ? '+' : ''}${roi.toFixed(1)}% (${multiple.toFixed(2)}x)</p>
            <p><strong>Total Tokens:</strong> ${totalTokens.toLocaleString()} (${ownership}% ownership)</p>
            <p><strong>Available Tokens:</strong> ${availableTokens.toLocaleString()} (${totalTokens > 0 ? ((availableTokens / totalTokens) * 100).toFixed(1) : 0}% of total)</p>
            <p><strong>Loans:</strong> ${Utils.formatCurrency(loansOutstanding)}</p>
            <p><strong>Collateralized Tokens:</strong> ${lockedTokens.toLocaleString()}</p>
          </div>
        `;
      });
    }
    
    summaryHTML += '</div>';
    summaryContainer.innerHTML = summaryHTML;
  },

  showLoading() {
    const loadingElement = document.getElementById('loading');
    const contentElement = document.getElementById('content');
    
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
    
    if (contentElement) {
      contentElement.style.display = 'none';
    }
  },

  hideLoading() {
    const loadingElement = document.getElementById('loading');
    const contentElement = document.getElementById('content');
    
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    if (contentElement) {
      contentElement.style.display = 'block';
    }
  },

  updateAll() {
    this.showSummary();
    this.showTable();
  }
};

// Make available globally
window.ResultsDisplay = ResultsDisplay; 