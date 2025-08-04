// Chart management for Revnet Calculator
const ChartManager = {
  createAll() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return;
    }
    
    this.createTokenChart();
    this.createTeamLoanChart();
    this.createInvestorLoanChart();
    this.createLoanPotentialChart();
    this.createOutstandingLoansChart();
    this.createBackingChart();
    this.createIssuancePriceChart();
    this.createCashOutValueChart();
    this.createDistributionChart();
    this.createDilutionChart();
    this.createCashFlowChart();
    this.createCashFlowFeesChart();
    this.createTokenValuationChart();
    this.createTokenPerformanceChart();

  },

  updateAll() {
    // Force complete chart recreation to ensure all charts reflect updated data
    this.createAll();
  },

  createTokenChart() {
    const ctx = document.getElementById('tokenChart');
    if (!ctx) return;
    
    if (State.charts.tokenChart) {
      State.charts.tokenChart.destroy();
    }
    
    const data = this.prepareTokenChartData();
    
    State.charts.tokenChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                
                if (!dayData || !dayData.events || dayData.events.length === 0) {
                  return '';
                }
                
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• Investment of ${Utils.formatCurrency(event.amount)} created new tokens`);
                      contextInfo.push(`• Distributed to splits and ${event.label}`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Revenue of ${Utils.formatCurrency(event.amount)} created new tokens`);
                      contextInfo.push(`• Distributed to splits and ${event.label}`);
                      break;
                    case 'loan':
                    case 'angelinvestor-loan':
                      contextInfo.push(`• ${event.label} took out a loan of ${Utils.formatCurrency(event.amount)}`);
                      contextInfo.push(`• Tokens locked as collateral`);
                      break;
                    case 'payback-loan':
                    case 'angelinvestor-repay':
                      contextInfo.push(`• ${event.label} paid back ${Utils.formatCurrency(event.amount)} of loan`);
                      contextInfo.push(`• Tokens unlocked from collateral`);
                      break;
                    case 'cashout':
                    case 'angelinvestor-cashout':
                      contextInfo.push(`• ${event.label} cashed out ${(event.amount / 1000000).toFixed(1)}M tokens`);
                      contextInfo.push(`• Tokens burned from supply`);
                      break;
                  }
                });
                
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false, // Show all labels
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createTeamLoanChart() {
    const ctx = document.getElementById('teamLoanChart');
    if (!ctx) return;
    
    if (State.charts.teamLoanChart) {
      State.charts.teamLoanChart.destroy();
    }
    
    const data = this.prepareTeamLoanChartData();
    
    State.charts.teamLoanChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                
                if (!dayData || !dayData.events || dayData.events.length === 0) {
                  return '';
                }
                
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'team-loan':
                      contextInfo.push(`• Team took out a loan of ${Utils.formatCurrency(event.amount)}`);
                      contextInfo.push(`• Tokens locked as collateral`);
                      break;
                    case 'team-repay':
                      contextInfo.push(`• Team paid back ${Utils.formatCurrency(event.amount)} of loan`);
                      contextInfo.push(`• Tokens unlocked from collateral`);
                      break;
                  }
                });
                
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createInvestorLoanChart() {
    const ctx = document.getElementById('investorLoanChart');
    if (!ctx) return;
    
    if (State.charts.investorLoanChart) {
      State.charts.investorLoanChart.destroy();
    }
    
    const data = this.prepareInvestorLoanChartData();
    
    State.charts.investorLoanChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                
                if (!dayData || !dayData.events || dayData.events.length === 0) {
                  return '';
                }
                
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'angelinvestor-loan':
                      contextInfo.push(`• ${event.label} took out a loan of ${Utils.formatCurrency(event.amount)}`);
                      contextInfo.push(`• Tokens locked as collateral`);
                      break;
                    case 'angelinvestor-repay':
                      contextInfo.push(`• ${event.label} paid back ${Utils.formatCurrency(event.amount)} of loan`);
                      contextInfo.push(`• Tokens unlocked from collateral`);
                      break;
                  }
                });
                
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createLoanPotentialChart() {
    const ctx = document.getElementById('loanPotentialChart');
    if (!ctx) return;
    
    if (State.charts.loanPotentialChart) {
      State.charts.loanPotentialChart.destroy();
    }
    
    const data = this.prepareLoanPotentialChartData();
    
    State.charts.loanPotentialChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• ${event.label} invested $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Revenue of $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                    case 'cashout':
                    case event.type.endsWith('-cashout'):
                      contextInfo.push(`• ${event.label} cashed out ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createOutstandingLoansChart() {
    const ctx = document.getElementById('outstandingLoansChart');
    if (!ctx) return;
    
    if (State.charts.outstandingLoansChart) {
      State.charts.outstandingLoansChart.destroy();
    }
    
    const data = this.prepareOutstandingLoansChartData();
    
    State.charts.outstandingLoansChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createBackingChart() {
    const ctx = document.getElementById('backingChart');
    if (!ctx) return;
    
    if (State.charts.backingChart) {
      State.charts.backingChart.destroy();
    }
    
    const data = this.prepareBackingChartData();
    
    State.charts.backingChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel,
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• ${event.label} invested $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Revenue of $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                    case 'cashout':
                    case event.type.endsWith('-cashout'):
                      contextInfo.push(`• ${event.label} cashed out ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createIssuancePriceChart() {
    const ctx = document.getElementById('issuancePriceChart');
    if (!ctx) return;
    
    if (State.charts.issuancePriceChart) {
      State.charts.issuancePriceChart.destroy();
    }
    
    const data = this.prepareIssuancePriceChartData();
    
    State.charts.issuancePriceChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
              },
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• ${event.label} invested $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Revenue of $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                    case 'cashout':
                    case event.type.endsWith('-cashout'):
                      contextInfo.push(`• ${event.label} cashed out ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  },

  createCashOutValueChart() {
    const ctx = document.getElementById('cashOutValueChart');
    if (!ctx) return;
    
    if (State.charts.cashOutValueChart) {
      State.charts.cashOutValueChart.destroy();
    }
    
    const data = this.prepareCashOutValueChartData();
    
    State.charts.cashOutValueChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  },

  createDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    if (State.charts.distributionChart) {
      State.charts.distributionChart.destroy();
    }
    
    const data = this.prepareDistributionChartData();
    
    State.charts.distributionChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
              },
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• ${event.label} invested $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Revenue of $${Utils.formatCurrency(event.amount)}`);
                      break;
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                    case 'cashout':
                    case event.type.endsWith('-cashout'):
                      contextInfo.push(`• ${event.label} cashed out ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
  },

  createDilutionChart() {
    const ctx = document.getElementById('dilutionChart');
    if (!ctx) return;
    
    if (State.charts.dilutionChart) {
      State.charts.dilutionChart.destroy();
    }
    
    const data = this.prepareDilutionChartData();
    
    State.charts.dilutionChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
              },
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = State.calculationResults.find(r => r.day === day);
                if (!dayData || !dayData.events || dayData.events.length === 0) return '';
                let contextInfo = [];
                dayData.events.forEach(event => {
                  switch (event.type) {
                    case 'loan':
                    case event.type.endsWith('-loan'):
                      contextInfo.push(`• ${event.label} took out loan with ${event.amount.toLocaleString()} tokens collateralized`);
                      break;
                    case 'payback-loan':
                    case event.type.endsWith('-repay'):
                      contextInfo.push(`• ${event.label} repaid ${event.amount.toLocaleString()} tokens`);
                      break;
                  }
                });
                return contextInfo.length > 0 ? '\n' + contextInfo.join('\n') : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
  },

  createCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart');
    if (!ctx) return;
    
    if (State.charts.cashFlowChart) {
      State.charts.cashFlowChart.destroy();
    }
    
    const data = this.prepareCashFlowChartData();
    
    State.charts.cashFlowChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: function(context) {
                return `Day ${context[0].label}`;
              },
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${Utils.formatCurrency(value)}`;
              },
              afterBody: function(context) {
                const day = parseInt(context[0].label);
                const dayData = data.cashFlowData.find(d => d.day === day);
                
                if (!dayData) return '';
                
                // Show full breakdown
                const breakdown = [
                  `Investment: ${Utils.formatCurrency(dayData.investment)}`,
                  `Revenue: ${Utils.formatCurrency(dayData.revenue)}`,
                  `Internal Fees: ${Utils.formatCurrency(dayData.internalFees)}`,
                  `Protocol Fees: ${Utils.formatCurrency(dayData.externalFees)}`,
                  `Day 1 Investors Loan Pay back: ${Utils.formatCurrency(dayData.loans + dayData.loanRepayments)}`,
                  `Total Flow: ${Utils.formatCurrency(dayData.totalFlow)}`
                ];
                
                // Add context based on events
                const dayEvents = State.calculationResults.find(r => r.day === day)?.events || [];
                let contextInfo = [];
                
                dayEvents.forEach(event => {
                  switch (event.type) {
                    case 'investment':
                      contextInfo.push(`• Investment of ${Utils.formatCurrency(event.amount)} flowed into Revnet`);
                      contextInfo.push(`• Added to treasury backing`);
                      break;
                    case 'revenue':
                      contextInfo.push(`• Service revenue of ${Utils.formatCurrency(event.amount)} flowed into Revnet`);
                      contextInfo.push(`• Added to treasury backing`);
                      break;
                    case event.type.endsWith('-loan'):
                      const loanLabel = event.type.replace('-loan', '');
                      contextInfo.push(`• ${loanLabel} took out loan with ${(event.amount / 1000000).toFixed(1)}M tokens collateralized`);
                      break;
                    case event.type.endsWith('-repay'):
                      const repayLabel = event.type.replace('-repay', '');
                      contextInfo.push(`• ${repayLabel} repaid ${(event.amount / 1000000).toFixed(1)}M tokens`);
                      break;
                    case event.type.endsWith('-cashout'):
                      const cashoutLabel = event.type.replace('-cashout', '');
                      contextInfo.push(`• ${cashoutLabel} cashed out ${(event.amount / 1000000).toFixed(1)}M tokens`);
                      break;
                  }
                });
                
                return '\n' + breakdown.join('\n') + (contextInfo.length > 0 ? '\n\n' + contextInfo.join('\n') : '');
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createCashFlowFeesChart() {
    const ctx = document.getElementById('cashFlowFeesChart');
    if (!ctx) return;
    
    if (State.charts.cashFlowFeesChart) {
      State.charts.cashFlowFeesChart.destroy();
    }
    
    const data = this.prepareCashFlowFeesChartData();
    
    State.charts.cashFlowFeesChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createTokenValuationChart() {
    const ctx = document.getElementById('tokenValuationChart');
    if (!ctx) return;
    
    if (State.charts.tokenValuationChart) {
      State.charts.tokenValuationChart.destroy();
    }
    
    const data = this.prepareTokenValuationChartData();
    
    State.charts.tokenValuationChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: Utils.formatTooltipLabel
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        }
      }
    });
  },

  createTokenPerformanceChart() {
    const ctx = document.getElementById('tokenPerformanceChart');
    if (!ctx) return;
    
    if (State.charts.tokenPerformanceChart) {
      State.charts.tokenPerformanceChart.destroy();
    }
    
    const data = this.prepareTokenPerformanceChartData();
    
    State.charts.tokenPerformanceChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            }
          }
        }
      }
    });
  },



  // Data preparation methods will be added here...
  // (These are placeholder methods that need to be implemented based on the original chart data preparation logic)
  // Shared function to create event-driven X-axis labels
  createEventDrivenLabels() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return [];
    }

    const labels = [];
    
    // Always start with day 0
    labels.push(0);
    
    // Add day 1 if there are events
    if (State.calculationResults.some(r => r.day === 1)) {
      labels.push(1);
    }
    
    // Add strategic intermediate points (30, 60, 90, 120, 150, 180, 210, 240, 270)
    // but only if they're within the range of our events
    const maxEventDay = Math.max(0, ...State.calculationResults.map(r => r.day));
    const strategicDays = [30, 60, 90, 120, 150, 180, 210, 240, 270];
    
    strategicDays.forEach(day => {
      if (day <= maxEventDay + 90) {
        labels.push(day);
      }
    });
    
    // Add all actual event days
    State.calculationResults.forEach(result => {
      if (result.events && result.events.length > 0 && !labels.includes(result.day)) {
        labels.push(result.day);
      }
    });
    
    // Add extended timeline points (300, 330, 360, 370) if we have events that go that far
    const extendedDays = [300, 330, 360, 370];
    extendedDays.forEach(day => {
      if (day <= maxEventDay + 90 && !labels.includes(day)) {
        labels.push(day);
      }
    });
    
    // Sort the labels
    return labels.sort((a, b) => a - b);
  },

  prepareTokenChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }
    


    const labels = this.createEventDrivenLabels();

    // Get all unique labels for token distribution
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      if (result.tokensByLabel) {
        Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
      }
    });

    const datasets = [];

    // Add individual token holder datasets
    const colors = [
      'rgb(54, 162, 235)', 'rgb(255, 159, 64)', 'rgb(153, 102, 255)',
      'rgb(255, 205, 86)', 'rgb(201, 203, 207)', 'rgb(255, 99, 132)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      // Get total tokens for this label
      const totalData = labels.map(day => {
        const stateAtDay = StateMachine.getStateAtDay(day);
        return stateAtDay.tokensByLabel[label] || 0;
      });
      
      // Get locked tokens for this label
      const lockedData = labels.map(day => {
        return StateMachine.getCollateralizedTokens(label, day);
      });
      
      // Calculate liquid tokens (total - locked)
      const liquidData = labels.map((day, index) => {
        const totalTokens = totalData[index];
        const lockedTokens = lockedData[index];
        return Math.max(0, totalTokens - lockedTokens);
      });
      
      const baseColor = colors[colorIndex % colors.length];
      const backgroundColor = baseColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
      
      // Get the original display name for this label
      let displayName = label;
      
      // Check if it's a stage split (like "team")
      State.stages.forEach(stageId => {
        const splitsContainer = document.getElementById(`stage-splits-${stageId}`);
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
      
      // Check if it's an event label (like "angelinvestor")
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      // Add liquid tokens dataset
      datasets.push({
        label: displayName,
        data: liquidData,
        borderColor: baseColor,
        backgroundColor: backgroundColor,
        tension: 0.1,
        borderWidth: 2
      });
      
      // Check if this label has any locked tokens
      const hasLockedTokens = lockedData.some(val => val > 0);
      
      if (hasLockedTokens) {
        datasets.push({
          label: `${displayName} (Locked)`,
          data: lockedData,
          borderColor: baseColor,
          backgroundColor: 'transparent',
          tension: 0.1,
          borderWidth: 2,
          borderDash: [10, 5], // Dashed line pattern
          fill: false
        });
      }
      
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareTeamLoanChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    const teamLoans = labels.map(day => {
      let result = State.calculationResults.find(r => r.day === day);
      if (!result) {
        // Find the last available result before this day
        const lastResult = State.calculationResults
          .filter(r => r.day < day)
          .sort((a, b) => b.day - a.day)[0];
        if (lastResult) {
          result = lastResult;
        } else {
          return 0;
        }
      }
      const teamLoanHistory = result.loanHistory['team'] || [];
      return teamLoanHistory.reduce((sum, loan) => sum + loan.amount, 0);
    });

    return {
      labels,
      datasets: [{
        label: 'Team Loans',
        data: teamLoans,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }]
    };
  },

  prepareInvestorLoanChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique investor labels from dayLabeledInvestorLoans
    const allInvestorLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.dayLabeledInvestorLoans || {}).forEach(label => allInvestorLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)',
      'rgb(153, 102, 255)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)'
    ];
    
    let colorIndex = 0;
    allInvestorLabels.forEach(label => {
      const investorLoans = labels.map(day => {
        let result = State.calculationResults.find(r => r.day === day);
        if (!result) {
          // Find the last available result before this day
          const lastResult = State.calculationResults
            .filter(r => r.day < day)
            .sort((a, b) => b.day - a.day)[0];
          if (lastResult) {
            result = lastResult;
          } else {
            return 0;
          }
        }
        
        // Calculate outstanding loans from loan history
        const entityLoans = result.loanHistory[label] || [];
        const total = entityLoans.reduce((sum, loan) => {
          if (loan.remainingTokens > 0) {
            return sum + loan.amount;
          }
          return sum;
        }, 0);
        

        
        return total;
      });
      
      // Get the original display name for this label
      let displayName = label;
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      datasets.push({
        label: `${displayName} Loans`,
        data: investorLoans,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareLoanPotentialChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for loan potential
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)',
      'rgb(153, 102, 255)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      const loanPotential = labels.map(day => {
        let result = State.calculationResults.find(r => r.day === day);
        if (!result) {
          // Find the last available result before this day
          const lastResult = State.calculationResults
            .filter(r => r.day < day)
            .sort((a, b) => b.day - a.day)[0];
          if (lastResult) {
            result = lastResult;
          } else {
            return 0;
          }
        }
        return StateMachine.getLoanPotential(label, day);
      });
      
      // Get the original display name for this label
      let displayName = label;
      
      // Check if it's a stage split (like "team")
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
      
      // Check if it's an event label (like "angelinvestor")
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      datasets.push({
        label: `${displayName} Potential`,
        data: loanPotential,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareOutstandingLoansChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for outstanding loans
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.dayLabeledInvestorLoans).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)',
      'rgb(153, 102, 255)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      const outstandingLoans = labels.map(day => {
        let result = State.calculationResults.find(r => r.day === day);
        if (!result) {
          // Find the last available result before this day
          const lastResult = State.calculationResults
            .filter(r => r.day < day)
            .sort((a, b) => b.day - a.day)[0];
          if (lastResult) {
            result = lastResult;
          } else {
            return 0;
          }
        }
        return result.dayLabeledInvestorLoans[label] || 0;
      });
      
      // Get the original display name for this label
      let displayName = label;
      
      // Check if it's an event label (like "angelinvestor")
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      datasets.push({
        label: `${displayName} Outstanding`,
        data: outstandingLoans,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareBackingChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    const revnetBacking = labels.map(day => {
      let result = State.calculationResults.find(r => r.day === day);
      if (!result) {
        // Find the last available result before this day
        const lastResult = State.calculationResults
          .filter(r => r.day < day)
          .sort((a, b) => b.day - a.day)[0];
        if (lastResult) {
          result = lastResult;
        } else {
          return 0;
        }
      }
      return result.revnetBacking;
    });

    return {
      labels,
      datasets: [{
        label: 'Revnet Backing',
        data: revnetBacking,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  },

  prepareIssuancePriceChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    const issuancePrice = labels.map(day => {
      const stage = StageManager.getStageAtDay(day);
      if (!stage || !stage.hasCuts) return 1.0;
      const numCuts = Math.floor(day / stage.cutPeriod);
      return Math.pow(1 + stage.issuanceCut, numCuts);
    });

    return {
      labels,
      datasets: [{
        label: 'Issuance Price',
        data: issuancePrice,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }]
    };
  },

  prepareCashOutValueChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    const cashOutValue = labels.map(day => {
      let result = State.calculationResults.find(r => r.day === day);
      if (!result) {
        // Find the last available result before this day
        const lastResult = State.calculationResults
          .filter(r => r.day < day)
          .sort((a, b) => b.day - a.day)[0];
        if (lastResult) {
          result = lastResult;
        } else {
          return 0;
        }
      }
      const stage = StageManager.getStageAtDay(day);
      if (!stage) return 0;
      
      // Calculate per-token cash out value
      if (result.totalSupply <= 0) return 0;
      
      // For cash out value calculation:
      // Treasury = Revnet backing (the total backing is already the treasury available for cash outs)
      // Supply = Total token supply (excluding locked tokens being used as collateral for loans)
      const treasury = result.revnetBacking;
      
      const totalLockedTokens = Object.values(result.loanHistory || {}).reduce((sum, loans) => {
        return sum + loans.reduce((loanSum, loan) => loanSum + loan.remainingTokens, 0);
      }, 0);
      const supply = result.totalSupply - totalLockedTokens;
      
      if (supply <= 0) return 0;
      
      const perTokenValue = StateMachine.calculateCashOutValueForEvent(1, supply, treasury, stage.cashOutTax);
      return perTokenValue;
    });

    return {
      labels,
      datasets: [{
        label: 'Cash Out Value',
        data: cashOutValue,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }]
    };
  },

  prepareDistributionChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    };

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for ownership distribution
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)',
      'rgb(153, 102, 255)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      // Calculate ownership percentage for each label
      const ownershipData = State.calculationResults.map(result => {
        const totalTokens = result.tokensByLabel[label] || 0;
        return result.totalSupply > 0 ? (totalTokens / result.totalSupply) * 100 : 0;
      });
      
      // Get the original display name for this label
      let displayName = label;
      
      // Check if it's a stage split (like "team")
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
      
      // Check if it's an event label (like "angelinvestor")
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      datasets.push({
        label: `${displayName} %`,
        data: ownershipData,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareDilutionChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for tokens backing loans
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)',
      'rgb(153, 102, 255)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      // Calculate percentage of tokens backing loans for each label
      const dilutionData = labels.map(day => {
        let result = State.calculationResults.find(r => r.day === day);
        if (!result) {
          // Find the last available result before this day
          const lastResult = State.calculationResults
            .filter(r => r.day < day)
            .sort((a, b) => b.day - a.day)[0];
          if (lastResult) {
            result = lastResult;
          } else {
            return 0;
          }
        }
        const totalTokens = result.tokensByLabel[label] || 0;
        const collateralizedTokens = StateMachine.getCollateralizedTokens(label, day);
        return totalTokens > 0 ? (collateralizedTokens / totalTokens) * 100 : 0;
      });
      
      // Get the original display name for this label
      let displayName = label;
      
      // Check if it's a stage split (like "team")
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
      
      // Check if it's an event label (like "angelinvestor")
      State.calculationResults.forEach(result => {
        result.events.forEach(event => {
          if (Utils.normalizeLabel(event.label) === label) {
            displayName = event.label;
          }
        });
      });
      
      datasets.push({
        label: `${displayName} Tokens Backing Loans %`,
        data: dilutionData,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareCashFlowChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Calculate cash flows for each day
    const cashFlowData = labels.map(day => {
      const dayEvents = State.calculationResults.find(r => r.day === day)?.events || [];
      
      let investment = 0;
      let revenue = 0;
      let loans = 0;
      let loanRepayments = 0;
      let cashOuts = 0;
      let actualRevenue = 0; // Only revenue events
      
      // Process events for this day
      dayEvents.forEach(event => {
        if (event.type === 'investment') {
          investment += event.amount;
        } else if (event.type === 'revenue') {
          revenue += event.amount;
          actualRevenue += event.amount;
        } else if (event.type.endsWith('-loan')) {
          // Calculate actual loan amount (not token amount)
          const stage = StageManager.getStageAtDay(day);
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            const loanAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
            loans += loanAmount;
          }
        } else if (event.type.endsWith('-repay')) {
          // Calculate actual repayment amount
          const stage = StageManager.getStageAtDay(day);
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            const repaymentAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
            loanRepayments += repaymentAmount;
          }
        } else if (event.type.endsWith('-cashout')) {
          // Calculate actual cash out amount
          const stage = StageManager.getStageAtDay(day);
          if (stage) {
            const stateBefore = StateMachine.getStateAtDay(day - 1);
            const cashOutAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, stage.cashOutTax);
            cashOuts += cashOutAmount;
          }
        }
      });
      
      // Get fees for this day
      const dayFees = StateMachine.getTotalFeesForDay(day);
      const internalFees = dayFees.internal; // always positive
      const externalFees = dayFees.external; // always positive
      
      // Add internal fees to revenue (positive bar), and as negative to internal fees (negative bar)
      revenue += internalFees;
      const internalFeesBar = -internalFees;
      const externalFeesBar = -externalFees;
      
      return {
        day,
        investment,
        revenue, // includes both actual revenue and internal fees
        actualRevenue, // for tooltip
        loans: -loans, // Negative because loans flow out
        loanRepayments,
        cashOuts: -cashOuts, // Negative because cash outs flow out
        internalFees: internalFeesBar, // negative bar
        internalFeesPositive: internalFees, // for tooltip
        externalFees: externalFeesBar, // negative bar
        totalFlow: investment + revenue + (-loans) + loanRepayments + (-cashOuts) + internalFeesBar + externalFeesBar
      };
    });

    return {
      labels,
      datasets: [
        {
          label: 'Investment',
          data: cashFlowData.map(d => d.investment),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          stack: 'Stack 0'
        },
        {
          label: 'Revenue',
          data: cashFlowData.map(d => d.revenue),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          stack: 'Stack 0'
        },
        {
          label: 'Internal Fees',
          data: cashFlowData.map(d => d.internalFees),
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.8)',
          stack: 'Stack 0'
        },
        {
          label: 'Protocol Fees',
          data: cashFlowData.map(d => d.externalFees),
          borderColor: 'rgb(201, 203, 207)',
          backgroundColor: 'rgba(201, 203, 207, 0.8)',
          stack: 'Stack 0'
        },
        {
          label: 'Day 1 Investors Loan Pay back',
          data: cashFlowData.map(d => d.loans + d.loanRepayments),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          stack: 'Stack 0'
        }
      ],
      cashFlowData // Store the detailed data for tooltips
    };
  },

  prepareCashFlowFeesChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Calculate fees from events using StateMachine
    const internalFees = labels.map(day => {
      const dayFees = StateMachine.getTotalFeesForDay(day);
      return dayFees.internal; // Keep internal fees positive
    });
    
    const externalFees = labels.map(day => {
      const dayFees = StateMachine.getTotalFeesForDay(day);
      return -dayFees.external; // Make external fees negative
    });

    return {
      labels,
      datasets: [
        {
          label: 'Internal Fees',
          data: internalFees,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          tension: 0.1
        },
        {
          label: 'External Fees',
          data: externalFees,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          tension: 0.1
        }
      ]
    };
  },

  prepareTokenValuationChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for token valuations
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)',
      'rgb(239, 68, 68)', 'rgb(139, 92, 246)', 'rgb(236, 72, 153)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      // Calculate token value for each label
      const tokenValues = State.calculationResults.map(result => {
        const totalTokens = result.tokensByLabel[label] || 0;
        const stage = StageManager.getStageAtDay(result.day);
        if (!stage) return 0;
        
        // Calculate cash out value per token
        const cashOutValue = StateMachine.calculateCashOutValueForEvent(1, result.totalSupply, result.revnetBacking, stage.cashOutTax);
        return totalTokens * cashOutValue;
      });
      
      // Get the proper display name for the label
      const displayName = EventManager.getDisplayNameForLabel(label);
      
      datasets.push({
        label: `${displayName} Token Value`,
        data: tokenValues,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },

  prepareTokenPerformanceChartData() {
    if (!State.calculationResults || State.calculationResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.createEventDrivenLabels();
    
    // Get all unique labels for token performance
    const allLabels = new Set();
    State.calculationResults.forEach(result => {
      Object.keys(result.tokensByLabel).forEach(label => allLabels.add(label));
    });

    const datasets = [];
    const colors = [
      'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)',
      'rgb(239, 68, 68)', 'rgb(139, 92, 246)', 'rgb(236, 72, 153)'
    ];
    
    let colorIndex = 0;
    allLabels.forEach(label => {
      // Calculate ROI for each label
      const roiData = State.calculationResults.map(result => {
        const totalTokens = result.tokensByLabel[label] || 0;
        const stage = StageManager.getStageAtDay(result.day);
        if (!stage) return 0;
        
        // Calculate cash out value per token
        const cashOutValue = StateMachine.calculateCashOutValueForEvent(1, result.totalSupply, result.revnetBacking, stage.cashOutTax);
        const currentValue = totalTokens * cashOutValue;
        
        // Calculate total amount cashed out by this entity UP TO THIS DAY ONLY
        let totalCashedOut = 0;
        State.calculationResults.forEach(dayResult => {
          if (dayResult.day <= result.day) { // Only count cash outs up to current day
            dayResult.events.forEach(event => {
              if (Utils.normalizeLabel(event.label) === label && event.type.endsWith('-cashout')) {
                // Calculate actual cash out amount in dollars
                const eventStage = StageManager.getStageAtDay(dayResult.day);
                if (eventStage) {
                  const stateBefore = StateMachine.getStateAtDay(dayResult.day - 1);
                  const cashOutAmount = StateMachine.calculateCashOutValueForEvent(event.amount, stateBefore.totalSupply, stateBefore.revnetBacking, eventStage.cashOutTax);
                  totalCashedOut += cashOutAmount;
                }
              }
            });
          }
        });
        
        // Calculate invested amount from events UP TO THIS DAY ONLY
        let invested = 0;
        State.calculationResults.forEach(dayResult => {
          if (dayResult.day <= result.day) { // Only count investments up to current day
            dayResult.events.forEach(event => {
              if (Utils.normalizeLabel(event.label) === label && (event.type === 'investment' || event.type === 'revenue')) {
                invested += event.amount;
              }
            });
          }
        });
        
        // Total value includes current token value + amount cashed out
        const totalValue = currentValue + totalCashedOut;
        
        if (invested > 0) {
          return ((totalValue - invested) / invested) * 100;
        }
        return 0;
      });
      
      // Get the proper display name for the label
      const displayName = EventManager.getDisplayNameForLabel(label);
      
      datasets.push({
        label: `${displayName} ROI (%)`,
        data: roiData,
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: colors[colorIndex % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        tension: 0.1
      });
      colorIndex++;
    });

    return { labels, datasets };
  },


};

// Make available globally
window.ChartManager = ChartManager; 