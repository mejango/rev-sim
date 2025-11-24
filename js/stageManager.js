// Stage management for Revnet Calculator
const StageManager = {
  addStage(autoAdded = false) {
    const id = State.counters.stage++;
    const isFirst = State.stages.length === 0;
    const stageNum = State.stages.length + 1;
    
    // If auto-added, inherit settings from the previous stage
    let hasCuts = !autoAdded; // Default: checked for first stage, unchecked for auto-added
    let cutValue = 50;
    let periodValue = 90;
    let taxValue = 0.1;
    
    if (autoAdded && State.stages.length > 0) {
      const prevStageId = State.stages[State.stages.length - 1];
      const prevHasCuts = UI.$(`stage-has-cuts-${prevStageId}`)?.checked || false;
      const prevCutValue = UI.$(`stage-cut-${prevStageId}`)?.value || '50';
      const prevPeriodValue = UI.$(`stage-period-${prevStageId}`)?.value || '90';
      const prevTaxValue = UI.$(`stage-tax-${prevStageId}`)?.value || '0.1';
      
      hasCuts = prevHasCuts;
      cutValue = prevCutValue;
      periodValue = prevPeriodValue;
      taxValue = prevTaxValue;
    }
    
    const stageHTML = `
      <div class="stage-card" id="stage-${id}">
        <h4>Stage ${stageNum} ${!isFirst ? `<button class="small remove" onclick="StageManager.removeStage(${id})">Remove</button>` : '(Initial)'}</h4>
        
        <div class="splits-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong>Splits</strong>
            <button class="small" onclick="StageManager.addSplit(${id})">+ Add Split</button>
          </div>
          <div id="stage-splits-${id}"></div>
          <div id="stage-splits-total-${id}" class="splits-total">
            Total allocated: 0% | Investor share: 100%
          </div>
        </div>
        
        <label style="margin-top: 10px; display: block;">
          <input type="checkbox" id="stage-has-cuts-${id}" onchange="StageManager.toggleCuts(${id})" ${hasCuts ? 'checked' : ''}>
          Add automatic issuance cuts?
        </label>
        <div id="stage-cuts-${id}" class="cuts-section" style="${hasCuts ? 'display: block;' : 'display: none;'}">
          <div class="inline-inputs">
            <div>
              <label>Issuance Cut</label>
              <div class="percent-wrapper">
                <input type="number" id="stage-cut-${id}" value="${cutValue}" min="0" max="100" onchange="EventManager.autoCalculate(); if (State.charts && State.charts.issuancePriceChart && typeof ChartManager !== 'undefined') { ChartManager.createIssuancePriceChart(); }">
              </div>
            </div>
            <div>
              <label>Cut Frequency</label>
              <div class="days-wrapper">
                <input type="number" id="stage-period-${id}" value="${periodValue}" min="1" onchange="EventManager.autoCalculate(); if (State.charts && State.charts.issuancePriceChart && typeof ChartManager !== 'undefined') { ChartManager.createIssuancePriceChart(); }">
              </div>
            </div>
          </div>
        </div>
        
        <label style="margin-top: 10px; display: block;">Cash Out Tax (0-1)</label>
        <input type="number" id="stage-tax-${id}" value="${taxValue}" min="0" max="1" step="0.01" onchange="StageManager.updateCashOutTaxDescription(${id})">
        <div id="cash-out-tax-description-${id}" style="font-size: 11px; color: #666; margin-top: 2px; margin-bottom: 15px; font-style: italic; padding-left: 2px;">
          Cashing out 10% of tokens gets 9.1% of the Revnet's balance
        </div>
        
        <label id="stage-duration-label-${id}" style="margin-top: 10px; display: block;">Duration (days) ${!isFirst ? '<span style="font-size: 10px; color: #666;">(0 = lasts forever)</span>' : ''}</label>
        <input type="number" id="stage-duration-${id}" value="${isFirst ? '' : '0'}" placeholder="forever" min="0" onchange="StageManager.checkForNewStage(${id})">
      </div>
    `;
    
    UI.$('stages').appendChild(UI.createElement(stageHTML));
    State.stages.push(id);
    
    // Copy splits from previous stage if auto-added, otherwise add default Team split
    if (autoAdded && State.stages.length > 1) {
      const prevStageId = State.stages[State.stages.length - 2]; // Previous stage (before the one we just added)
      const prevSplitsContainer = UI.$(`stage-splits-${prevStageId}`);
      if (prevSplitsContainer) {
        const prevSplitItems = prevSplitsContainer.querySelectorAll('.split-item');
        prevSplitItems.forEach(item => {
          const labelInput = item.querySelector('input[type="text"]');
          const percentInput = item.querySelector('input[type="number"]');
          const label = labelInput.value.trim();
          const percent = parseFloat(percentInput.value) || 0;
          if (label && percent > 0) {
            this.addSplit(id, label, percent);
          }
        });
      }
    } else {
      // Add default Team split
      this.addSplit(id, 'Team', 50);
    }
    
    // Initialize cash out tax description
    this.updateCashOutTaxDescription(id);
  },

  removeStage(id) {
    UI.$(`stage-${id}`).remove();
    State.stages = State.stages.filter(s => s !== id);
    this.updateStageNumbers();
    this.updateStageDurationHints();
    
    // If Stage 1 is now the last stage, clear its duration field to show "forever"
    if (State.stages.length === 1) {
      const stage1DurationInput = UI.$(`stage-duration-${State.stages[0]}`);
      if (stage1DurationInput) {
        stage1DurationInput.value = '';
      }
    }
  },

  updateStageNumbers() {
    State.stages.forEach((id, index) => {
      const stageDiv = UI.$(`stage-${id}`);
      const h4 = stageDiv.querySelector('h4');
      if (index === 0) {
        h4.innerHTML = `Stage 1 (Initial)`;
      } else {
        h4.innerHTML = `Stage ${index + 1} <button class="small remove" onclick="StageManager.removeStage(${id})">Remove</button>`;
      }
    });
  },

  checkForNewStage(stageId) {
    const durationValue = UI.$(`stage-duration-${stageId}`).value;
    const duration = durationValue === '' ? 0 : parseFloat(durationValue);
    const stageIndex = State.stages.indexOf(stageId);
    
    if (stageIndex === State.stages.length - 1 && duration > 0) {
      this.addStage(true);
    }
    
    this.updateStageDurationHints();
  },

  updateStageDurationHints() {
    State.stages.forEach((id, index) => {
      if (index > 0) {
        const durationLabel = UI.$(`stage-duration-label-${id}`);
        if (durationLabel) {
          if (index === State.stages.length - 1) {
            durationLabel.innerHTML = 'Duration (days) <span style="font-size: 10px; color: #666;">(0 = lasts forever)</span>';
          } else {
            durationLabel.innerHTML = 'Duration (days)';
          }
        }
      }
    });
  },

  toggleCuts(stageId) {
    const checkbox = UI.$(`stage-has-cuts-${stageId}`);
    const cutsSection = UI.$(`stage-cuts-${stageId}`);
    cutsSection.style.display = checkbox.checked ? 'block' : 'none';
    // Trigger recalculation and chart update when cuts are enabled/disabled
    EventManager.autoCalculate();
    // Also directly update issuance price chart since it depends on stage settings
    if (State.charts && State.charts.issuancePriceChart && typeof ChartManager !== 'undefined') {
      ChartManager.createIssuancePriceChart();
    }
  },

  updateCashOutTaxDescription(stageId) {
    const taxInput = UI.$(`stage-tax-${stageId}`);
    const descriptionDiv = UI.$(`cash-out-tax-description-${stageId}`);
    
    if (taxInput && descriptionDiv) {
      const taxRate = parseFloat(taxInput.value) || 0;
      const cashOutPercent = 10; // Example: 10% of tokens
      
      // Use bonding curve formula: y = (o*x/s) * ((1-r) + x*r/s)
      const o = 100; // treasury as percentage
      const s = 100; // liquid supply as percentage
      const x = cashOutPercent; // tokens being cashed out
      const r = taxRate;
      
      // Calculate using bonding curve formula
      const cashOutValue = (o * x / s) * ((1 - r) + (x * r / s));
      const effectivePercent = cashOutValue;
      
      descriptionDiv.textContent = `Cashing out ${cashOutPercent}% of tokens gets ${effectivePercent.toFixed(1)}% of the Revnet's balance`;
    }
    
    // Only auto-calculate if we're not in the initial setup phase
    if (State.events && State.events.length > 0) {
      const firstEventId = State.events[0];
      const dayElement = UI.$(`event-day-${firstEventId}`);
      const typeElement = UI.$(`event-type-${firstEventId}`);
      if (dayElement && typeElement) {
        setTimeout(() => EventManager.autoCalculate(), 100);
      }
    }
  },

  addSplit(stageId, defaultLabel = '', defaultPercent = 0) {
    const splitId = State.counters.split++;
    
    const splitHTML = `
      <div class="split-item" id="split-${splitId}">
        <input type="text" id="split-label-${splitId}" placeholder="Label (e.g., Team, Treasury)" value="${defaultLabel}" onchange="EventManager.updateAllEventTypes(); EventManager.autoCalculate();">
        <div class="percent-wrapper">
          <input type="number" id="split-percent-${splitId}" placeholder="0" value="${defaultPercent}" min="0" max="100" step="0.1" onchange="StageManager.updateSplitsTotal(${stageId}); EventManager.autoCalculate();">
        </div>
        <button class="small remove" onclick="StageManager.removeSplit(${stageId}, ${splitId})">×</button>
      </div>
    `;
    
    UI.$(`stage-splits-${stageId}`).appendChild(UI.createElement(splitHTML));
    this.updateSplitsTotal(stageId);
    
    // Auto-calculate after adding split
    setTimeout(() => EventManager.autoCalculate(), 100);
  },

  removeSplit(stageId, splitId) {
    UI.$(`split-${splitId}`).remove();
    this.updateSplitsTotal(stageId);
    
    // Auto-calculate after removing split
    setTimeout(() => EventManager.autoCalculate(), 100);
  },

  updateSplitsTotal(stageId) {
    const splitsContainer = UI.$(`stage-splits-${stageId}`);
    const splitItems = splitsContainer.querySelectorAll('.split-item');
    
    let total = 0;
    splitItems.forEach(item => {
      const percentInput = item.querySelector('input[type="number"]');
      total += parseFloat(percentInput.value) || 0;
    });
    
    // Auto-calculate after updating splits
    setTimeout(() => EventManager.autoCalculate(), 100);
    
    const totalDiv = UI.$(`stage-splits-total-${stageId}`);
    const investorShare = Math.max(0, 100 - total);
    
    totalDiv.innerHTML = `Total split limit: ${total.toFixed(1)}%<br>Payer gets remaining ${investorShare.toFixed(1)}%.`;
    
    totalDiv.classList.remove('warning', 'error');
    if (total > 100) {
      totalDiv.classList.add('error');
    } else if (total > 90) {
      totalDiv.classList.add('warning');
    }
  },

  getAllSplitLabels() {
    const labels = new Set();
    State.stages.forEach(stageId => {
      const splitsContainer = UI.$(`stage-splits-${stageId}`);
      if (splitsContainer) {
        const splitItems = splitsContainer.querySelectorAll('.split-item');
        splitItems.forEach(item => {
          const labelInput = item.querySelector('input[type="text"]');
          const label = labelInput.value.trim();
          if (label) {
            labels.add(label);
          }
        });
      }
    });
    return Array.from(labels);
  },

  getStageAtDay(day) {
    let cumulativeDays = 0;
    for (let i = 0; i < State.stages.length; i++) {
      const stageId = State.stages[i];
      const durationValue = UI.$(`stage-duration-${stageId}`).value;
      // Parse duration: empty string or 0 means forever (Infinity) only for the last stage
      // Otherwise, use the actual value (or 0 if empty/0 for non-last stages)
      let duration;
      if (i === State.stages.length - 1 && (durationValue === '' || durationValue === '0')) {
        duration = Infinity; // Last stage with 0 duration lasts forever
      } else if (durationValue === '' || durationValue === '0') {
        duration = 0; // Non-last stage with 0/empty duration means 0 days
      } else {
        duration = parseFloat(durationValue) || 0;
      }
      
      // Check if this day falls within this stage's duration
      // If it's the last stage, it always matches (duration is Infinity)
      // Otherwise, check if day is within this stage's range
      if (i === State.stages.length - 1 || (duration > 0 && day < cumulativeDays + duration)) {
        const splits = {};
        let totalSplitPercent = 0;
        
        const splitsContainer = UI.$(`stage-splits-${stageId}`);
        if (splitsContainer) {
          const splitItems = splitsContainer.querySelectorAll('.split-item');
          splitItems.forEach(item => {
            const labelInput = item.querySelector('input[type="text"]');
            const percentInput = item.querySelector('input[type="number"]');
            const label = labelInput.value.trim();
            const percent = parseFloat(percentInput.value) || 0;
            
            if (label && percent > 0) {
              splits[label] = percent / 100;
              totalSplitPercent += percent;
            }
          });
        }
        
        const investorSplit = Math.max(0, (100 - totalSplitPercent) / 100);
        const hasCuts = UI.$(`stage-has-cuts-${stageId}`).checked;
        
        return {
          splits: splits,
          investorSplit: investorSplit,
          hasCuts: hasCuts,
          issuanceCut: hasCuts ? parseFloat(UI.$(`stage-cut-${stageId}`).value) / 100 : 0,
          cutPeriod: hasCuts ? parseInt(UI.$(`stage-period-${stageId}`).value) : Infinity,
          cashOutTax: parseFloat(UI.$(`stage-tax-${stageId}`).value),
          stageIndex: i,
          stageStartDay: cumulativeDays
        };
      }
      
      cumulativeDays += duration;
    }
  },

  validateSplits() {
    for (let stageId of State.stages) {
      const splitsContainer = UI.$(`stage-splits-${stageId}`);
      const splitItems = splitsContainer.querySelectorAll('.split-item');
      let total = 0;
      splitItems.forEach(item => {
        const percentInput = item.querySelector('input[type="number"]');
        total += parseFloat(percentInput.value) || 0;
      });
      if (total > 100) {
        alert(`Stage ${State.stages.indexOf(stageId) + 1} has splits totaling ${total}%, which exceeds 100%. Please adjust.`);
        return false;
      }
    }
    return true;
  },

  addEvent() {
    EventManager.addEvent();
  }
};

// Make available globally
window.StageManager = StageManager; 