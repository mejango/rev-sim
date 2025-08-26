// State and StateMachine for Revnet Calculator
const State = {
  stages: [],
  events: [],
  calculationResults: [],
  charts: {},
  isInitializing: true,
  counters: { stage: 0, event: 0, split: 0 }
};

const StateMachine = {
  // Calculate the complete system state at any given day
  getStateAtDay(targetDay) {
    // This will be called after EventManager is loaded
    if (typeof EventManager === 'undefined') {
      return {
        totalSupply: 0,
        revnetBacking: 0,
        tokensByLabel: {},
        dayLabeledInvestorLoans: {},
        loanHistory: {},
        day: targetDay
      };
    }
    const allEvents = EventManager.getAllEvents().allEvents;
    const eventsUpToDay = allEvents.filter(e => e.day <= targetDay);
    

    

    
    let totalSupply = 0;
    let revnetBacking = 0;
    let tokensByLabel = {};
    let dayLabeledInvestorLoans = {};
    let loanHistory = {};
    
    // Process all events up to the target day
    eventsUpToDay.forEach(event => {
      if (event.type === 'investment' || event.type === 'revenue') {
        revnetBacking += event.amount;
        
        // Use stage-based issuance price calculation, not bonding curve
        const currentStage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        let issuancePrice = 1.0;
        if (currentStage && currentStage.hasCuts) {
          const numCuts = Math.floor(event.day / currentStage.cutPeriod);
          issuancePrice = Math.pow(1 + currentStage.issuanceCut, numCuts);
        }
        
        const tokensPerDollar = 1 / issuancePrice;
        const newTokens = event.amount * tokensPerDollar;
        totalSupply += newTokens;
        
        // Distribute tokens according to stage splits
        if (currentStage) {
          // Distribute tokens to all split recipients
          Object.entries(currentStage.splits).forEach(([label, splitPercent]) => {
            const entityTokens = Math.round(newTokens * splitPercent);
            const normalizedLabel = Utils.normalizeLabel(label);
            if (!tokensByLabel[normalizedLabel]) {
              tokensByLabel[normalizedLabel] = 0;
            }
            tokensByLabel[normalizedLabel] += entityTokens;
          });
          
          // Give remaining tokens to the payer (investor)
          const totalSplitPercent = Object.values(currentStage.splits).reduce((sum, percent) => sum + percent, 0);
          const remainingTokens = Math.round(newTokens * (1 - totalSplitPercent));
          if (remainingTokens > 0 && event.label) {
            const normalizedPayerLabel = Utils.normalizeLabel(event.label);
            if (!tokensByLabel[normalizedPayerLabel]) {
              tokensByLabel[normalizedPayerLabel] = 0;
            }
            tokensByLabel[normalizedPayerLabel] += remainingTokens;
          }
        }
      } else if (event.type.endsWith('-cashout')) {
        const tokensToCash = event.amount;
        const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        if (stage) {
          const cashOutValue = this.calculateCashOutValueForEvent(tokensToCash, totalSupply, revnetBacking, stage.cashOutTax);

          revnetBacking -= cashOutValue;
          totalSupply -= tokensToCash;
          
          // Update the token holder's balance - ONLY the cashing out entity
          const label = event.type.replace('-cashout', '');
          const normalizedLabel = Utils.normalizeLabel(label);
          
          if (tokensByLabel[normalizedLabel]) {
            tokensByLabel[normalizedLabel] -= tokensToCash;
          }
        }
      } else if (event.type.endsWith('-loan')) {
        // Handle loans
        const label = event.type.replace('-loan', '');
        const normalizedLabel = Utils.normalizeLabel(label);
        let tokensLocked = event.amount; // Amount is already in tokens, not M tokens
        
        // Check if entity has enough tokens to lock as collateral
        const availableTokens = tokensByLabel[normalizedLabel] || 0;
        if (tokensLocked > availableTokens) {
          console.warn(`Warning: ${label} trying to lock ${tokensLocked} tokens but only has ${availableTokens} available. Limiting to available tokens.`);
          tokensLocked = Math.min(tokensLocked, availableTokens);
        }
        
        // Calculate loan amount using bonding curve
        const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        let loanAmount = 0;
        if (stage) {
          loanAmount = this.calculateCashOutValueForEvent(tokensLocked, totalSupply, revnetBacking, stage.cashOutTax);
        }
        

        
        if (!dayLabeledInvestorLoans[normalizedLabel]) {
          dayLabeledInvestorLoans[normalizedLabel] = 0;
        }
        dayLabeledInvestorLoans[normalizedLabel] += loanAmount;
        
        // Calculate fees
        const internalFee = loanAmount * 0.025; // 2.5% internal fee
        
        // Loans reduce Revnet balance by loan amount, but internal fee goes to Revnet
        // External fee leaves the system (doesn't affect treasury)
        revnetBacking = revnetBacking - loanAmount + internalFee;
        
        // Track loan in history
        if (!loanHistory[normalizedLabel]) {
          loanHistory[normalizedLabel] = [];
        }
        loanHistory[normalizedLabel].push({
          day: event.day,
          amount: loanAmount,
          tokensLocked: tokensLocked,
          remainingTokens: tokensLocked
        });
      } else if (event.type.endsWith('-repay')) {
        // Handle loan repayments
        const label = event.type.replace('-repay', '');
        const normalizedLabel = Utils.normalizeLabel(label);
        const tokensBeingUncollateralized = event.amount; // Amount is in tokens
        
        // Find the loan to repay
        if (loanHistory[normalizedLabel] && loanHistory[normalizedLabel].length > 0) {
          const oldestLoan = loanHistory[normalizedLabel][0];
          const tokensToUncollateralize = Math.min(tokensBeingUncollateralized, oldestLoan.remainingTokens);
          const remainingCollateralized = oldestLoan.remainingTokens - tokensToUncollateralize;
          
          // Calculate new loan amount for remaining collateral using bonding curve
          const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
          if (stage) {
            const newLoanAmount = this.calculateCashOutValueForEvent(remainingCollateralized, totalSupply, revnetBacking, stage.cashOutTax);
            
            // Calculate amount being returned to Revnet (original loan - new loan)
            const originalLoanAmount = oldestLoan.amount;
            const amountReturnedToRevnet = originalLoanAmount - newLoanAmount;
            
            // Calculate interest on the returned amount
            const daysElapsed = event.day - oldestLoan.day;
            const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365); // 6-month grace period
            const interestRate = Math.exp(0.05 * yearsElapsed); // 5% continuous compounding
            const internalFees = amountReturnedToRevnet * (interestRate - 1);
            
            // Update Revnet balance: receive principal + internal fees
            revnetBacking += amountReturnedToRevnet + internalFees;
            
            // Update loan history
            oldestLoan.remainingTokens = remainingCollateralized;
            oldestLoan.amount = newLoanAmount; // Update the loan amount for remaining collateral
            
            // Update outstanding loans - the new loan amount is what remains
            dayLabeledInvestorLoans[normalizedLabel] = newLoanAmount;
            
            // Return uncollateralized tokens to the entity
            if (!tokensByLabel[normalizedLabel]) {
              tokensByLabel[normalizedLabel] = 0;
            }
            // Note: We don't add tokens back here because they were never removed from tokensByLabel
            // The tokens are still in tokensByLabel, they're just collateralized (locked)
            // So we don't need to add them back - they're already there
            
            // Issue new tokens from internal fees (same logic as loan events)
            if (internalFees > 0) {
              // Use stage-based issuance price calculation, not bonding curve
              let issuancePrice = 1.0;
              if (stage && stage.hasCuts) {
                const numCuts = Math.floor(event.day / stage.cutPeriod);
                issuancePrice = Math.pow(1 + stage.issuanceCut, numCuts);
              }
              const tokensPerDollar = 1 / issuancePrice;
              const tokensFromFees = Math.round(internalFees * tokensPerDollar);
              
                              // Distribute to stage splits
                if (stage) {
                  Object.entries(stage.splits).forEach(([splitLabel, splitPercent]) => {
                    const tokensForSplit = Math.round(tokensFromFees * splitPercent);
                    const normalizedSplitLabel = Utils.normalizeLabel(splitLabel);
                    if (!tokensByLabel[normalizedSplitLabel]) {
                      tokensByLabel[normalizedSplitLabel] = 0;
                    }
                    tokensByLabel[normalizedSplitLabel] += tokensForSplit;
                  });
                  
                  // Give remaining tokens to the fee payer (the entity repaying the loan)
                  const totalSplitPercent = Object.values(stage.splits).reduce((sum, percent) => sum + percent, 0);
                  const remainingTokens = Math.round(tokensFromFees * (1 - totalSplitPercent));
                  if (remainingTokens > 0) {
                    tokensByLabel[normalizedLabel] += remainingTokens;
                  }
                }
              
              totalSupply += tokensFromFees;
            }
          }
        }
      }
    });
    
    return {
      totalSupply,
      revnetBacking,
      tokensByLabel,
      dayLabeledInvestorLoans,
      loanHistory,
      day: targetDay
    };
  },
  
  // Calculate outstanding liability for a specific entity at a given day
  getOutstandingLiability(entityLabel, targetDay) {
    const state = this.getStateAtDay(targetDay);
    // Normalize the entity label to match how it's stored in loanHistory
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const entityLoans = state.loanHistory[normalizedLabel] || [];
    
    let principal = 0;
    let interest = 0;
    let total = 0;
    
    entityLoans.forEach(loan => {
      if (loan.remainingTokens > 0) {
        const daysElapsed = targetDay - loan.day;
        const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365); // 6-month grace period
        const interestRate = Math.exp(0.05 * yearsElapsed); // 5% continuous compounding
        
        const loanPrincipal = loan.amount;
        const loanInterest = loanPrincipal * (interestRate - 1);
        
        principal += loanPrincipal;
        interest += loanInterest;
      }
    });
    
    total = principal + interest;
    return { principal, interest, total };
  },
  
  // Calculate available tokens for an entity at a given day
  getAvailableTokens(entityLabel, targetDay) {
    const state = this.getStateAtDay(targetDay);
    // Normalize the entity label to match how it's stored in tokensByLabel
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const totalTokens = state.tokensByLabel[normalizedLabel] || 0;
    const collateralizedTokens = this.getCollateralizedTokens(entityLabel, targetDay);
    return Math.max(0, totalTokens - collateralizedTokens);
  },
  
  // Calculate collateralized tokens for an entity at a given day
  getCollateralizedTokens(entityLabel, targetDay) {
    const state = this.getStateAtDay(targetDay);
    // Normalize the entity label to match how it's stored in loanHistory
    const normalizedLabel = Utils.normalizeLabel(entityLabel);
    const entityLoans = state.loanHistory[normalizedLabel] || [];
    return entityLoans.reduce((total, loan) => total + loan.remainingTokens, 0);
  },
  
  // Calculate loan potential for an entity at a given day
  getLoanPotential(entityLabel, targetDay) {
    const state = this.getStateAtDay(targetDay);
    const availableTokens = this.getAvailableTokens(entityLabel, targetDay);
    const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(targetDay) : null;
    
    if (availableTokens <= 0 || state.totalSupply <= 0) {
      return 0;
    }
    
    // According to rules: Loan potential = cash out value of tokens assuming full treasury 
    // (including outstanding loaned amounts) and full token supply (including locked tokens being used as collateral for loans)
    const totalOutstandingLoans = Object.values(state.dayLabeledInvestorLoans).reduce((sum, amount) => sum + amount, 0);
    const fullTreasury = state.revnetBacking + totalOutstandingLoans;
    
    // Include locked tokens in total supply for loan potential calculation
    const totalLockedTokens = Object.values(state.loanHistory).reduce((sum, loans) => {
      return sum + loans.reduce((loanSum, loan) => loanSum + loan.remainingTokens, 0);
    }, 0);
    const fullTokenSupply = state.totalSupply + totalLockedTokens;
    
    // Use the same bonding curve formula as cash out calculation
    const loanPotential = this.calculateCashOutValueForEvent(availableTokens, fullTokenSupply, fullTreasury, stage.cashOutTax);
    

    
    return loanPotential;
  },
  
  // Helper method for cash out calculations
  calculateCashOutValueForEvent(tokensToCash, totalSupply, revnetBacking, cashOutTax) {
    if (totalSupply <= 0) return 0;
    
    // According to rules: Uses bonding curve where supply doesn't include locked tokens being used as collateral for loans, 
    // and treasury doesn't include outstanding loaned amounts
    const cashOutValue = (revnetBacking * tokensToCash / totalSupply) * ((1 - cashOutTax) + (tokensToCash * cashOutTax / totalSupply));
    
    return cashOutValue;
  },

  // Calculate fees for a loan amount
  calculateLoanFees(loanAmount, isRepayment = false, loanAge = 0) {
    const absAmount = Math.abs(loanAmount);
    if (isRepayment) {
      // For repayments: only charge interest if loan is older than 6 months
      const yearsElapsed = Math.max(0, (loanAge - 180) / 365); // 6-month grace period
      const interestRate = Math.exp(0.05 * yearsElapsed) - 1; // 5% continuous compounding interest
      const internalFee = absAmount * interestRate;
      return { internal: internalFee, protocol: 0 };
    } else {
      return { internal: absAmount * 0.025, protocol: absAmount * 0.035 };
    }
  },

  // Calculate total invested amount for a label up to a specific day
  getTotalInvested(label, targetDay) {
    if (typeof EventManager === 'undefined') return 0;
    
    const allEvents = EventManager.getAllEvents().allEvents;
    const eventsUpToDay = allEvents.filter(e => e.day <= targetDay);
    
    let totalInvested = 0;
    eventsUpToDay.forEach(event => {
      if ((event.type === 'investment' || event.type === 'revenue') && 
          Utils.normalizeLabel(event.label) === Utils.normalizeLabel(label)) {
        totalInvested += event.amount;
      }
    });
    
    return totalInvested;
  },

  // Calculate total fees (internal + external) for a specific day
  getTotalFeesForDay(targetDay) {
    if (typeof EventManager === 'undefined') return { internal: 0, external: 0 };
    
    const allEvents = EventManager.getAllEvents().allEvents;
    const dayEvents = allEvents.filter(e => e.day === targetDay);
    
    let internalFees = 0;
    let externalFees = 0;
    
    dayEvents.forEach(event => {
      if (event.type.endsWith('-loan')) {
        // Calculate loan amount and fees
        const state = this.getStateAtDay(event.day - 1);
        const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        if (stage) {
          const loanAmount = this.calculateCashOutValueForEvent(event.amount, state.totalSupply, state.revnetBacking, stage.cashOutTax);
          const fees = this.calculateLoanFees(loanAmount);
          internalFees += fees.internal;
          externalFees += fees.protocol;
        }
      } else if (event.type.endsWith('-repay')) {
        // Calculate repayment fees (interest)
        const state = this.getStateAtDay(event.day - 1);
        const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        if (stage) {
          // Find the original loan to calculate interest
          const label = event.type.replace('-repay', '');
          const normalizedLabel = Utils.normalizeLabel(label);
          const entityLoans = state.loanHistory[normalizedLabel] || [];
          
          entityLoans.forEach(loan => {
            if (loan.remainingTokens > 0) {
              const daysElapsed = event.day - loan.day;
              const yearsElapsed = Math.max(0, (daysElapsed - 180) / 365);
              const interestRate = Math.exp(0.05 * yearsElapsed) - 1;
              const interest = loan.amount * interestRate;
              internalFees += interest;
            }
          });
        }
      } else if (event.type.endsWith('-cashout')) {
        // Calculate external fee for cash out (5% of cash out value)
        const state = this.getStateAtDay(event.day - 1);
        const stage = typeof StageManager !== 'undefined' ? StageManager.getStageAtDay(event.day) : null;
        if (stage) {
          const cashOutValue = this.calculateCashOutValueForEvent(event.amount, state.totalSupply, state.revnetBacking, stage.cashOutTax);
          externalFees += cashOutValue * 0.05; // 5% external fee
        }
      }
    });
    
    return { internal: internalFees, external: externalFees };
  }
};

// Make available globally
window.State = State;
window.StateMachine = StateMachine;