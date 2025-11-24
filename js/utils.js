// Utility constants and functions for Revnet Planner
const FEES = {
  LOAN_INTERNAL: 0.025,
  LOAN_PROTOCOL: 0.035
};

const SCALING = {
  TOKENS_TO_M: 1000000, // Convert from tokens to M tokens
  M_TO_TOKENS: 1000000  // Convert from M tokens to tokens
};

const Utils = {
  calculateLoanFees(amount, isRepayment = false, loanAge = 0) {
    const absAmount = Math.abs(amount);
    if (isRepayment) {
      // For repayments: only charge interest if loan is older than 6 months
      const yearsElapsed = Math.max(0, (loanAge - 180) / 365); // 6-month grace period
      const interestRate = Math.exp(0.05 * yearsElapsed) - 1; // 5% continuous compounding interest
      const internalFee = absAmount * interestRate;
      return { internal: internalFee, protocol: 0 };
    } else {
      return { internal: absAmount * FEES.LOAN_INTERNAL, protocol: absAmount * FEES.LOAN_PROTOCOL };
    }
  },

  formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    return '$' + value.toLocaleString();
  },
  formatTooltipLabel(context) {
    const value = context.parsed.y;
    const label = context.dataset.label;
    if (value === null || value === undefined || isNaN(value)) return label + ': $0';
    return label + ': $' + value.toLocaleString();
  },

  normalizeLabel(label) {
    return label.toLowerCase().replace(/\s+/g, '');
  },

  generateEventDescription(dayData, chartType = 'general') {
    const descriptions = [];
    
    // Investment events
    if (dayData.investment > 0) {
      const investmentAmount = Utils.formatCurrency(dayData.investment);
      if (chartType === 'cashflow') {
        descriptions.push(`• Investment: ${investmentAmount} (inflow to Revnet)`);
      } else if (chartType === 'treasury' || chartType === 'backing') {
        descriptions.push(`• Investment: ${investmentAmount} added to treasury`);
      } else {
        descriptions.push(`• Investment: ${investmentAmount}`);
      }
    }
    
    // Revenue events
    if (dayData.revenue > 0) {
      const revenueAmount = Utils.formatCurrency(dayData.revenue);
      if (chartType === 'cashflow') {
        descriptions.push(`• Revenue: ${revenueAmount} (inflow to Revnet)`);
      } else if (chartType === 'treasury' || chartType === 'backing') {
        descriptions.push(`• Revenue: ${revenueAmount} added to treasury`);
      } else {
        descriptions.push(`• Revenue: ${revenueAmount}`);
      }
    }
    
    // Loan events
    Object.entries(dayData.splitLoans || {}).forEach(([label, loanData]) => {
      if (loanData.dollars > 0) {
        const loanAmount = Utils.formatCurrency(loanData.dollars);
        const tokenAmount = loanData.tokens.toLocaleString();
        if (chartType === 'cashflow') {
          descriptions.push(`• ${label} loan: ${loanAmount} (outflow from Revnet)`);
        } else if (chartType === 'treasury' || chartType === 'backing') {
          descriptions.push(`• ${label} loan: ${loanAmount} removed from treasury`);
        } else {
          descriptions.push(`• ${label} loan: ${loanAmount} for ${tokenAmount} tokens`);
        }
      }
    });
    
    // Loan repayment events
    Object.entries(dayData.splitLoanRepayments || {}).forEach(([label, repayData]) => {
      if (repayData.dollars > 0) {
        const repayAmount = Utils.formatCurrency(repayData.dollars);
        const tokenAmount = repayData.tokens.toLocaleString();
        if (chartType === 'cashflow') {
          descriptions.push(`• ${label} repayment: ${repayAmount} (inflow to Revnet)`);
        } else if (chartType === 'treasury' || chartType === 'backing') {
          descriptions.push(`• ${label} repayment: ${repayAmount} added to treasury`);
        } else {
          descriptions.push(`• ${label} repayment: ${repayAmount} for ${tokenAmount} tokens`);
        }
      }
    });
    
    // Loan interest fees
    if (dayData.loanRepaymentFees > 0) {
      const amount = Utils.formatCurrency(dayData.loanRepaymentFees);
      if (chartType === 'cashflow') {
        descriptions.push(`• Loan interest fees: ${amount} (charged on repayment)\n• Treated as revenue - flows into Revnet`);
      } else if (chartType === 'treasury' || chartType === 'backing') {
        descriptions.push(`• Internal fees: ${amount} added to treasury as revenue`);
      } else {
        descriptions.push(`• Internal fees: ${amount} (interest charged)`);
      }
    }
    
    // Cash out events
    Object.entries(dayData.splitCashOuts || {}).forEach(([label, cashOutData]) => {
      if (cashOutData.dollars > 0) {
        const cashOutAmount = Utils.formatCurrency(cashOutData.dollars);
        const tokenAmount = cashOutData.tokens.toLocaleString();
        if (chartType === 'token' || chartType === 'distribution') {
          descriptions.push(`• ${label} cashed out ${tokenAmount} tokens for ${cashOutAmount}\n• Reduced token supply`);
        } else if (chartType === 'treasury' || chartType === 'backing') {
          descriptions.push(`• ${label} cashed out ${tokenAmount} tokens for ${cashOutAmount}\n• Reduced treasury backing`);
        } else if (chartType === 'price') {
          descriptions.push(`• ${label} cashed out ${tokenAmount} tokens for ${cashOutAmount}\n• Increased cash out value due to reduced supply`);
        } else if (chartType === 'cashflow') {
          descriptions.push(`• ${label} cashed out ${tokenAmount} tokens for ${cashOutAmount}\n• 5% protocol fee deducted from payout\n• Net outflow from Revnet`);
        } else {
          descriptions.push(`• ${label} cashed out ${tokenAmount} tokens for ${cashOutAmount}`);
        }
      }
    });
    
    // Split multi-line descriptions into separate bullet points
    const allBulletPoints = [];
    descriptions.forEach(description => {
      const lines = description.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          allBulletPoints.push(line.trim());
        }
      });
    });
    
    return allBulletPoints.length > 0 ? allBulletPoints.join('\n') : 'No events on this day';
  }
};

// Make available globally
window.FEES = FEES;
window.SCALING = SCALING;
window.Utils = Utils;