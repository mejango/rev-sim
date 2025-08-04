# RevNet Calculator

A comprehensive simulation tool for modeling RevNet (Revenue Network) financial protocols. This calculator allows you to simulate token economics, loan systems, fee structures, and cash flows in a RevNet environment.

## What is a RevNet?

A RevNet (Revenue Network) is a financial protocol that allows entities to:

1. **Invest capital** and receive tokens representing ownership
2. **Take loans** against their token holdings as collateral
3. **Generate revenue** through fees and interest
4. **Cash out tokens** for underlying treasury value

## Core Mechanics

### 1. Token Issuance
- New money (investments, revenue) creates new tokens at current issuance price, which starts at 1 token per dollar
- Tokens are distributed according to stage splits (e.g., 20% Team 1, 10% Team 2)
- ALL split recipients receive their allocated tokens, with any remaining tokens in excess of the total split percent going to the payer of the money that generated the tokens
- Issuance price increases over time according to an issuance cut percent and frequency

### 2. Loan System
- Entities can borrow against their token holdings (limited by cash out value of tokens)
- Loans lock tokens as collateral until repayment
- **Loan potential** = cash out value of tokens assuming full treasury (including outstanding loaned amounts) and full token supply (including locked tokens being used as collateral for loans)
- **2.5% upfront internal fee** (goes to treasury as revenue)
- **3.5% upfront external protocol fee** (goes to external entities)
- Loan principal (loaned amount before upfront fees) can be paid back at any time to access collateral, and must include an additional **5% annual compounding interest** after 6-month grace period

### 3. Cash Out System
- Token holders can cash out tokens for treasury value
- Uses bonding curve: `value = (treasury * tokens / supply) * ((1-tax) + tokens*tax/supply)`
  - Supply doesn't include locked tokens being used as collateral for loans
  - Treasury doesn't include outstanding loaned amounts
- Cash out tax rate is set by the stage (reduces returned value)
- **5% external protocol fee** on cash out amount

### 4. Fee Structure
- **Internal Fees**: Revenue to Revnet treasury (2.5% loan origination, interest on repayments)
- **External Protocol Fees**: External expenses (3.5% loan origination, 5% cash out)
- Internal fees generate tokens, external protocol fees don't (they leave the system)

## How to Use

### For New Users
1. **Configure Stages**: Set up stages with token distribution splits
2. **Add Events**: Create events for investments, loans, repayments, and cash outs
3. **Calculate**: Click Calculate to run the simulation
4. **View Results**: Analyze detailed charts and tables showing the financial flows

### For Developers

#### Project Structure
```
sim/
├── index.html          # Main application interface
├── styles.css          # Application styling
├── README.md           # This file
└── js/
    ├── app.js          # Main application initialization
    ├── calculator.js   # Core calculation engine
    ├── chartManager.js # Chart creation and management
    ├── eventManager.js # Event handling and validation
    ├── resultsDisplay.js # Results table and summary display
    ├── stageManager.js # Stage configuration management
    ├── state.js        # State machine and calculations
    ├── ui.js           # UI utility functions
    └── utils.js        # General utility functions
```

#### Key Components

**State Machine (`state.js`)**
- `getStateAtDay(day)`: Calculate complete system state at any given day
- `getTotalFeesForDay(day)`: Calculate internal and external fees for a specific day
- `calculateCashOutValueForEvent()`: Calculate cash out value using bonding curve
- `calculateLoanFees()`: Calculate loan fees and interest

**Event Manager (`eventManager.js`)**
- Handles all event types: investment, revenue, loans, repayments, cash outs
- Validates event data and calculates resulting states
- Manages event sequences and import/export functionality

**Chart Manager (`chartManager.js`)**
- Creates 12 different chart types showing various aspects of the system
- Handles data preparation and chart configuration
- Manages chart updates and interactions

**Results Display (`resultsDisplay.js`)**
- Generates detailed results table showing day-by-day financial flows
- Creates summary analytics for splits and payers
- Shows token valuations, loan status, and performance metrics

#### Key Features

**Charts Available:**
1. **Token Distribution**: Shows token balances for each entity over time
2. **Splits Loan Status**: Loan amounts and potential for stage splits
3. **Investor Loan Status**: Loan amounts and potential for individual investors
4. **Loan Potential Comparison**: Maximum loan amounts each entity could take
5. **Outstanding Loans Comparison**: Current loan balances over time
6. **Revnet Treasury Backing**: Total value backing the treasury
7. **Token Issuance Price**: Price for new token issuance
8. **Token Cash Out Value**: Value per token when cashing out
9. **Split Ownership %**: Percentage ownership of total tokens
10. **Tokens Backing Loans %**: Percentage of tokens locked as collateral
11. **Cash Flows**: Money flowing in and out of the system
12. **Fee Flows**: Internal and protocol fees generated
13. **Token Valuations**: Total value of token holdings over time
14. **Token Performance**: ROI performance of token investments

**Analytics Sections:**
- **Split Analytics**: Detailed breakdown for stage splits (Team, etc.)
- **Payer Analytics**: Performance metrics for entities that invested money
- **Detailed Results Table**: Day-by-day financial flows with event details

#### Technical Details

**Fee Calculations:**
- Internal fees are calculated as revenue to the system
- External fees leave the system and don't generate tokens
- Repayment interest is calculated with 6-month grace period, then 5% annual compounding

**Token Calculations:**
- Token distribution follows stage splits exactly
- Remaining tokens go to the payer
- Locked tokens are excluded from cash out calculations
- Loan potential includes full treasury and supply assumptions

**State Tracking:**
- Complete state is calculated for each day with events
- All historical data is preserved for accurate calculations
- Loan history tracks remaining amounts and interest calculations

## Getting Started

1. **Clone or download** the project files
2. **Open `index.html`** in a web browser
3. **Configure stages** with your desired token distribution splits
4. **Add events** to simulate your RevNet scenario
5. **Click Calculate** to run the simulation
6. **Analyze results** using the charts and tables

## Browser Compatibility

- Modern browsers with ES6+ support
- Chart.js 4.4.0 for visualizations
- No external dependencies beyond Chart.js CDN

## Contributing

When contributing to this project:

1. **Maintain calculation accuracy** - All financial calculations must be precise
2. **Update documentation** - Keep this README current with any changes
3. **Test thoroughly** - Verify calculations with known scenarios
4. **Follow existing patterns** - Maintain consistency with current code structure

## License

This project is provided as-is for educational and simulation purposes. Please ensure compliance with any applicable licenses for Chart.js and other dependencies. 