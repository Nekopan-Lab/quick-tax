# **QuickTax Product Requirements Document**

## **1\. Introduction**

This document outlines the product requirements for "QuickTax," a web-based application designed to help individuals estimate their federal and California state tax payments throughout the tax year.

**IMPORTANT DISCLAIMER:** QuickTax is intended solely as a planning tool for *estimated* tax payments and is *not* a substitute for professional tax advice, official tax filing software, or the services of a licensed tax preparer. Its primary goal is to provide users with real-time insights into their estimated tax liability, allowing them to adjust their financial planning proactively.

## **2\. Goals**

* **Empower Users:** Provide a user-friendly tool for individuals to proactively estimate their tax payments for the current tax year.  
* **Real-time Feedback:** Offer immediate updates on estimated tax owed or overpaid as users input their financial data.  
* **Simplify Complexity:** Break down tax calculations into understandable steps, guiding users through the process.  
* **Data Privacy:** Ensure all user data remains local to their device, reinforcing privacy and control.  
* **Support Key Scenarios:** Cater to common filing statuses (Single, Married Filing Jointly) and income types.

## **3\. Scope**

### **3.1. In Scope**

* **Product Name:** QuickTax  
* **Purpose:** Estimated tax payment calculation (not for filing).  
* **Tax Year:** User-selectable, starting with 2025 (with architecture designed to support maximum 2 tax years).  
* **Tax Jurisdictions:** Federal (IRS) and California state (FTB).  
* **Filing Statuses:** Single, Married Filing Jointly.  
* **Deductions:** Standard vs. Itemized (Property Tax, Mortgage Interest, Donations).  
* **Income Types:**  
  * Investment Income (Ordinary Dividend, Qualified Dividend, Interest, Short-term Capital Gain/Loss, Long-term Capital Gain/Loss).  
  * YTD W2 Income (Taxable Wage, Federal Withhold, State Withhold).  
  * Future Income (Simple Estimation Mode, Paycheck/RSU Vest Data Mode).  
* **Estimated Payments:** Tracking of YTD payments made to IRS and CA FTB.  
* **Output:** Real-time display of estimated tax owed/overpaid, detailed breakdown, and suggested remaining estimated payments.  
* **Data Storage:** Local browser storage.  
* **User Experience:** Step-by-step flow with quick navigation.

### **3.2. Out of Scope**

* Actual tax filing or submission to tax authorities.  
* Support for more than 2 tax years simultaneously.  
* Support for states other than California initially.  
* Support for filing statuses other than Single and Married Filing Jointly (e.g., Head of Household, Married Filing Separately, Qualifying Widower).  
* Complex tax scenarios (e.g., self-employment tax, foreign income, depreciation, credits beyond basic withholding).  
* Integration with financial institutions or payroll providers.  
* Server-side data storage.

## **4\. User Experience (UX)**

The application will feature a clear, step-by-step flow to guide users through the tax estimation process. A persistent navigation or progress indicator will allow users to quickly jump between sections or revisit previous steps for edits. The estimated tax owed/overpaid will be prominently displayed at the top of the interface and update in real-time with every input change.

### **4.1. Core User Flow**

1. **Welcome & Initial Setup:**  
   * User lands on the QuickTax application.  
   * **Application Title:** "QuickTax" with subtitle "Estimated Tax Calculator"  
   * **Prominent Disclaimer:** A clear, highly visible disclaimer stating that the tool is for estimation purposes only and does not constitute professional tax advice or licensed tax preparation. Note: Emojis should be avoided in the main application UI for a professional appearance, though may be used sparingly in disclaimers.  
   * Automatically pre-fill with previous data if available, or start a new estimation if no previous data is found.  
   * Option to delete all locally stored data.  
   * A small footer link, when clicked, will open a popup with the data privacy disclaimer.  
2. **Step 1: Filing Status & Tax Scope:**  
   * **Input:**  
     * Tax Year: Toggle button selector (currently 2025 only, with support for one additional year in the future).  
     * Filing Status: Radio buttons for "Single" or "Married Filing Jointly."  
     * Tax Scope: A checkbox for "California State Tax (FTB)." Federal tax calculation will always be performed.  
   * **Action:**  
     * Based on the Filing Status selection, the application will apply the correct federal and state tax rules.  
     * If "California State Tax (FTB)" is *not* checked, all California-specific UX elements (e.g., state-specific income fields, state estimated payment inputs, state tax breakdown) will be hidden or disabled.  
3. **Income:**  
   * **Structure:** Tab-based interface with "Your Income" and "Spouse Income" tabs when filing status is Married Filing Jointly. For Single filers, only the user income section is shown.  
   * **Spouse Income UI:** When Married Filing Jointly is selected:  
     * Default view shows only "Your Income" tab  
     * "Add Spouse Income (Optional)" button appears below the income form  
     * Clicking the button switches to spouse income tab  
     * Both tabs remain accessible once spouse income is initiated  
   * **Sub-sections for User/Spouse Income:**  
     * **Investment Income (Full Year Estimations):**  
       * Ordinary Dividends (total).  
       * Qualified Dividends (portion of ordinary dividends).  
       * Interest Income.  
       * Short-Term Capital Gains/Losses.  
       * Long-Term Capital Gains/Losses.  
       * **Hint:** Remind users these are full-year estimations.  
     * **YTD W2 Income:**  
       * Taxable Wage (Year-to-Date).  
       * Federal Withhold (Year-to-Date).  
       * State Withhold (Year-to-Date) \- *This field will be hidden if California State Tax is not selected.*  
     * **Future Income (User Selects One Mode):**  
       * **Mode I (Simple Estimation):**  
         * Estimated Future Taxable Wage.  
         * Estimated Future Federal Withhold.  
         * Estimated Future State Withhold \- *This field will be hidden if California State Tax is not selected.*  
       * **Mode II (Default \- Detailed Paycheck/RSU):**  
         * **Most Recent Paycheck Data:**  
           * Taxable Wage (per paycheck).  
           * Federal Withhold (per paycheck).  
           * State Withhold (per paycheck) \- *This field will be hidden if California State Tax is not selected.*  
           * Frequency of Payment (dropdown: Bi-weekly \- default, Monthly).  
           * Next Payment Date (date picker).  
         * **Most Recent RSU Vest Data:** *(Reference only - not added to total income)*  
           * Taxable Wage (per vest) - *Used to calculate withholding rate for future RSU vests*  
           * Federal Withhold (per vest) - *Used to calculate federal withholding rate*  
           * State Withhold (per vest) - *Used to calculate state withholding rate. This field will be hidden if California State Tax is not selected.*  
           * Vest Price (per share) - *Used as default price for future RSU vest calculations*  
         * **Future RSU Vests:**  
           * Dynamic list of RSU vests with the following fields for each vest:  
             * Vest Date (date picker)  
             * Number of Shares  
             * Expected Price per Share (defaults to most recent vest price if available)  
           * "Add RSU Vest" button to add additional vests  
           * "Remove" button for each vest to delete it  
   * **Real-time Display:** As income fields are updated, the "Calculated Total Income" for the user and spouse will update in real-time.  
4. **Deductions:**  
   * **Input:**  
     * Estimated full-year Property Tax.  
     * Estimated full-year Mortgage Interest.  
     * Mortgage-related fields (shown only when Mortgage Interest > 0):
       * Mortgage Loan Date: Radio buttons for "Before Dec 16, 2017" or "After Dec 15, 2017"
       * Mortgage Balance: Input field for current mortgage balance
     * Estimated full-year Donations.  
     * Other State Income Tax (shown only when California State Tax is NOT selected).
   * **Guidance:** A clear explanation that these are *full-year estimations*.  
   * **Logic & Display:**  
     * Calculate federal itemized deductions with the following limits:
       * **SALT Cap**: State and Local Tax (SALT) deduction is capped at $10,000 for federal taxes. This includes property tax plus either:
         * Estimated California state income tax (when CA tax is selected), or
         * Other state income tax entered manually (when CA tax is not selected)
       * **Mortgage Interest Limits**: Based on loan origination date:
         * Loans before Dec 16, 2017: Interest deductible on up to $1,000,000 of mortgage debt
         * Loans after Dec 15, 2017: Interest deductible on up to $750,000 of mortgage debt
         * If mortgage balance exceeds the limit, interest is prorated proportionally
     * Calculate California itemized deductions (when CA tax is selected):
       * No SALT cap for California
       * Mortgage interest limit is always $1,000,000 regardless of loan date
       * California does not allow deduction of California state income tax on CA return
     * Compare total itemized deductions to the applicable standard deduction for the selected filing status (Federal and California separately, if CA tax is selected).  
     * Automatically select and display which deduction method (Standard or Itemized) is more beneficial for the user for *each* jurisdiction, explaining why.  
     * The higher deduction amount will be used in subsequent tax calculations.
     * Show expandable breakdowns for itemized deductions (always available to show why standard/itemized was chosen):
       * Federal breakdown shows: Property tax, estimated CA state tax (or other state tax), SALT cap application, mortgage interest with limit application, and donations
       * California breakdown shows: Property tax, mortgage interest with $1M limit application, and donations
       * When itemized is less than standard deduction, show explanatory text
       * Clearly illustrate when caps/limits are applied with visual indicators and calculations
5. **Estimated Tax Payments YTD:**  
   * **Input:**  
     * Separate input fields for payments made for each IRS estimated tax due date.  
     * Separate input fields for payments made for each California FTB estimated tax due date (note CA has 3 payment dates) \- *These fields will be hidden if California State Tax is not selected.*  
6. **Summary & Actionable Insights:**  
   * **Display:**  
     * **Calculated Total Tax Owed / Overpaid:** Prominently displayed for Federal and California separately \- *California display will be hidden if California State Tax is not selected.*  
     * **Simple, Easy-to-Understand Breakdown:**  
       * Total Income (User \+ Spouse).  
       * Adjusted Gross Income (AGI).  
       * Deduction Applied (Standard or Itemized, with amount).  
       * Taxable Income.  
       * Calculated Tax Liability (before withholdings/payments).  
         * **Federal Tax Breakdown:**  
           * Ordinary Income Taxed At: \[Applicable Federal Marginal Rates\]  
           * Long-Term Capital Gains Taxed At: \[Applicable Federal LTCG Rates (0%, 15%, 20%)\]  
           * Other Investment Income (Ordinary Dividends, Interest) Taxed At: \[Applicable Federal Ordinary Income Rates\]  
         * **California Tax Breakdown (if selected):**  
           * All Income (including Capital Gains) Taxed At: \[Applicable California Marginal Rates\], plus the 1% mental health services tax for taxable income exceeding $1,000,000  
       * Total Withholdings (W2 YTD \+ Future).  
       * Total Estimated Payments Made YTD.  
       * Net Tax Owed / Overpaid.  
     * **Suggested Remaining Estimated Payments:**  
       * **Display Logic:**  
         * Show all payment quarters with clear visual distinction:  
           * Paid quarters: Green background with checkmark and "(Paid)" label  
           * Future unpaid quarters: Blue background with suggested amount  
           * Past due unpaid quarters: Gray background with $0 and "(Past Due)" label  
         * Calculate suggested future payments only for unpaid quarters that haven't passed their due date  
         * If all payments have been made, show final tax owed/overpaid amount with reminder that this is an estimation  
       * **Federal Calculation:**  
         * If tax is owed and unpaid quarters remain, divide the remaining owed amount equally among the unpaid quarterly due dates  
         * Example: If Q1 is paid, divide remaining balance equally among Q2, Q3, and Q4  
       * **California Calculation:**  
         * If tax is owed and unpaid quarters remain, calculate remaining payments based on CA's weighted schedule, adjusting weights proportionally based on unpaid quarters  
         * Original weights: Q1 (30%), Q2 (40%), Q4 (30%)  
         * Example adjustments:  
           * If only Q1 paid: Use 4:3 weight ratio for Q2:Q4 (57.1% Q2, 42.9% Q4)  
           * If only Q2 paid: Use 1:1 weight ratio for Q1:Q4 (50% Q1, 50% Q4)  
           * If Q1 and Q2 paid: 100% to Q4  
         * *This section will be hidden if California State Tax is not selected.*  
       * **Important Note:** When all payments are made, display: "Based on current data, you would [owe/be refunded] $X when filing taxes. This is an estimation only and not professional tax advice."

### **4.2. Navigation**

* **Step-by-Step Flow:** Clear "Next" and "Previous" buttons to guide users sequentially.  
* **Quick Navigation:** A persistent top navigation bar with clickable links to each major step (e.g., "Filing Status," "Income," "Deductions," etc.) for quick access and editing. Step numbers are not displayed in the navigation.  
* **Responsive Behavior:** On mobile devices, the navigation bar is horizontally scrollable to accommodate all steps without wrapping.

### **4.3. Visual Design**

* **Theme:** The application will utilize a light theme for its user interface. This includes light backgrounds, dark text, and appropriately contrasting accent colors to ensure readability and a clean, professional aesthetic.

## **5\. Data Management**

### **5.1. Local Storage**

* All user input data will be stored exclusively in the user's local browser storage (e.g., localStorage or IndexedDB).  
* **No data will be transmitted to any server.**

### **5.2. Data Privacy Disclaimer**

* A small footer link will be provided, which, when clicked, will open a popup containing the following disclaimer:"Your privacy is paramount. All data entered into QuickTax is stored *only* on your local device and is never sent to our servers. This allows you to pick up where you left off or update your estimates throughout the year. For complete privacy, you can delete all stored data at any time."

### **5.3. Data Persistence & Deletion**

* **Auto-Save:** Data will be automatically saved to local storage as the user progresses or makes changes.  
* **Pre-fill with Previous Data:** Upon returning to the application, the UI will automatically pre-fill with the user's last saved data.  
* **Delete All Data:** A clearly visible button (e.g., in settings or initial welcome screen) will allow users to delete all locally stored QuickTax data.

## **6\. Technical Considerations**

* **Frontend Framework:** A modern JavaScript framework (e.g., React, Vue, Angular) is recommended for building a responsive and interactive single-page application.  
* **Styling:** Tailwind CSS for rapid and consistent UI development, ensuring responsiveness across devices. The light theme will be implemented using Tailwind's default light mode styling or custom CSS variables.  
* **State Management:** Robust state management to handle real-time updates and data persistence (e.g., React Context API, Redux, Zustand).  
* **Input Validation:** Client-side validation for all input fields to ensure data integrity (e.g., numeric inputs, date formats).  
* **Calculations:** All tax calculations will be performed client-side using JavaScript.  
* **Responsiveness:** The application must be fully responsive and optimized for various screen sizes (desktop, tablet, mobile).

### **6.1. Architecture Principles**

* **Decoupling UX and Calculation Logic:** The user interface (UX) layer will be strictly separated from the underlying tax calculation logic. This separation will enable independent development, testing, and maintenance of both components. The UX will primarily focus on data input, display, and user interaction, while the calculation logic will handle all computations based on the provided data.  
* **Decoupled Federal and State Calculations:** The tax calculation logic will be further modularized, with distinct modules or functions for Federal (IRS) tax calculations and California (FTB) tax calculations. This ensures that changes to one jurisdiction's tax rules do not directly impact the other.  
* **Shared Calculation Utilities:** Where feasible, common calculation patterns (e.g., applying progressive tax brackets, aggregating income types) will be extracted into shared utility functions or modules that can be utilized by both federal and state calculation logic, promoting code reusability and consistency.  
* **Testability:** This architectural approach significantly enhances testability. Unit tests must be written for individual calculation functions (e.g., calculateFederalTax(income, deductions, filingStatus) or calculateCaliforniaTax(income, deductions, filingStatus)) without requiring UI rendering or complex setup, ensuring the accuracy of the tax computations.

## **7\. Tax Calculation Logic (Tax Year 2025\)**

**Disclaimer:** The tax rules and brackets provided below are based on the latest available information for the 2025 tax year at the time of writing. Tax laws are subject to change, and users should always consult official IRS and FTB publications or a qualified tax professional for definitive guidance.

### **7.1. Federal Tax (IRS) Calculation Rules**

**Source:** IRS.gov, various tax publications, and financial news outlets providing 2025 projections.

#### **7.1.1. Standard Deductions**

These values are applied automatically based on the selected filing status:

* **Single:** $15,000  
* **Married Filing Jointly:** $30,000

#### **7.1.2. Ordinary Income Tax Brackets (Marginal Rates)**

Taxable income is calculated as: Total Income \- Deductions (Standard or Itemized).

**For Single Filers:**

* **10%:** $0 to $11,925  
* **12%:** $11,926 to $48,475  
* **22%:** $48,476 to $103,350  
* **24%:** $103,351 to $197,300  
* **32%:** $197,301 to $250,525  
* **35%:** $250,526 to $626,350  
* **37%:** Over $626,350

**For Married Filing Jointly:**

* **10%:** $0 to $23,850  
* **12%:** $23,851 to $96,950  
* **22%:** $96,951 to $206,700  
* **24%:** $206,701 to $394,600  
* **32%:** $394,601 to $501,050  
* **35%:** $501,051 to $751,600  
* **37%:** Over $751,600

#### **7.1.3. Qualified Dividends & Long-Term Capital Gains Tax Rates**

These rates apply to the portion of qualified dividends and long-term capital gains that fall into specific income thresholds, *after* accounting for ordinary income. Short-term capital gains are taxed at ordinary income tax rates.

**For Single Filers:**

* **0%:** Taxable income up to $48,350  
* **15%:** Taxable income between $48,351 and $533,400  
* **20%:** Taxable income over $533,400

**For Married Filing Jointly:**

* **0%:** Taxable income up to $96,700  
* **15%:** Taxable income between $96,701 and $600,050  
* **20%:** Taxable income over $600,050

**Calculation Methodology:**

1. Calculate ordinary taxable income (Total Income \- Capital Gains/Qualified Dividends \- Deductions).  
2. Calculate tax on ordinary income using the marginal tax brackets.  
3. Add qualified dividends and long-term capital gains to the ordinary taxable income to find the total taxable income.  
4. Determine which capital gains/qualified dividend rate applies to the portion of income that falls into the capital gains brackets.  
5. Calculate the tax on qualified dividends and long-term capital gains separately.  
6. Sum the ordinary income tax and the capital gains/qualified dividends tax to get the total federal tax liability.

#### **7.1.4. Estimated Tax Payment Due Dates (Federal)**

* **Q1 (January 1 to March 31):** April 15, 2025  
* **Q2 (April 1 to May 31):** June 16, 2025  
* **Q3 (June 1 to August 31):** September 15, 2025  
* **Q4 (September 1 to December 31):** January 15, 2026

### **7.2. California State Tax (FTB) Calculation Rules**

**Source:** California Franchise Tax Board (FTB.ca.gov) and financial news outlets providing 2024-2025 projections. Note: California's 2025 brackets are typically inflation-adjusted versions of the 2024 brackets.

#### **7.2.1. Standard Deductions**

These values are applied automatically based on the selected filing status:

* **Single:** $5,540  
* **Married Filing Jointly:** $11,080

#### **7.2.2. Capital Gains Treatment**

* California **does not distinguish** between short-term and long-term capital gains. All capital gains are taxed as **ordinary income** and are subject to the regular state income tax brackets.

#### **7.2.3. Income Tax Brackets (Marginal Rates)**

Taxable income is calculated as: Total Income \- Deductions (Standard or Itemized).

**For Single Filers:**

* **1%:** $0 to $10,756  
* **2%:** $10,757 to $25,499  
* **4%:** $25,500 to $40,245  
* **6%:** $40,246 to $55,866  
* **8%:** $55,867 to $70,606  
* **9.3%:** $70,607 to $360,659  
* **10.3%:** $360,660 to $432,787  
* **11.3%:** $432,788 to $721,314  
* **12.3%:** $721,315 or more  
* For income above $1,000,000, there’s additional 1% mental health services tax

**For Married Filing Jointly:**

* **1%:** $0 to $21,512  
* **2%:** $21,513 to $50,998  
* **4%:** $50,999 to $80,490  
* **6%:** $80,491 to $111,732  
* **8%:** $111,733 to $141,212  
* **9.3%:** $141,213 to $721,318  
* **10.3%:** $721,319 to $865,574  
* **11.3%:** $865,575 to $1,442,628  
* **12.3%:** $1,442,629 or more (up to $2,000,000)  
* For income above $1,000,000, there’s additional 1% mental health services tax

#### **7.2.4. Estimated Tax Payment Due Dates & Percentages (California)**

California requires 3 payments for estimated tax, with specific percentages of the total estimated tax due at each interval.

* **Q1 (January 1 to March 31):** April 15, 2025 (30% of total estimated tax)  
* **Q2 (April 1 to May 31):** June 16, 2025 (40% of total estimated tax)  
* **Q3 (June 1 to August 31):** September 15, 2025 (0% \- no payment due)  
* **Q4 (September 1 to December 31):** January 15, 2026 (30% of total estimated tax)

## **8\. Deployment Requirements**

### **8.1. Hosting Platform**

* **Platform:** Cloudflare Workers
* **Type:** Edge-based static website hosting
* **Requirements:** The application must be built as a static single-page application (SPA) with all assets served from Cloudflare's global CDN

### **8.2. Build Process**

* **Build Output:** The build process must generate static HTML, CSS, and JavaScript files in the `dist/` directory
* **Entry Point:** The `dist/` directory must contain `index.html` as the main entry point
* **Asset Structure:** All static assets (JS, CSS, images) must be properly referenced with relative paths
* **No Server Dependencies:** The application must not require any server-side processing or API endpoints

### **8.3. Deployment Steps**

1. **Development Build:**
   * Run `npm run build` to generate production-ready assets in the `dist/` directory
   * Ensure all assets are optimized and minified for production

2. **Cloudflare Workers Setup:**
   * Configure `wrangler.toml` with appropriate settings
   * Ensure Cloudflare account is authenticated: `npx wrangler login`
   * Deploy using: `npx wrangler deploy`

3. **Version Control:**
   * Commit the source code and configuration files to the repository
   * Deploy manually using `npx wrangler deploy` or set up CI/CD automation

### **8.4. Local Testing**

* **Testing Method:** Use Wrangler CLI to test the deployment locally
* **Recommended:** Run `npx wrangler dev` to test Workers configuration
* **Access:** Navigate to the local URL provided by Wrangler
* **Important:** Also test with `npm run build && npm run preview` for production build verification

### **8.5. Continuous Deployment**

* **Manual Deployment:** Run `npm run build` followed by `npx wrangler deploy`
* **Automation Options:** Set up GitHub Actions or other CI tools to run deployment commands
* **Build Verification:** Wrangler CLI shows deployment status and logs
* **Asset Integrity:** Cloudflare Workers automatically handles asset serving and caching

## **9\. Multi-Year Tax Support**

### **9.1. Tax Year Architecture**

The application is designed with a flexible, multi-year architecture that supports easy addition of new tax years:

* **Modular Data Structure:** Tax brackets, standard deductions, and rates are organized by year in dedicated data structures
* **Year-Based Constants:** All tax calculation constants are stored in year-specific objects that can be easily updated or extended
* **Calculator APIs:** All tax calculation functions accept a tax year parameter, allowing calculations for any supported year
* **Type Safety:** TypeScript types ensure only supported tax years can be used throughout the application

### **9.2. Currently Supported Tax Years**

* **2025:** Full implementation with official IRS and California FTB tax brackets and rates
* **2026:** Preliminary implementation with estimated brackets (to be updated when official rates are released)

### **9.3. Adding New Tax Years**

To add support for a new tax year (e.g., 2027):

1. **Update Type Definitions:** Add the new year to the `TaxYear` type in `/src/types/index.ts`
2. **Federal Tax Data:** Add the new year's data to `FEDERAL_TAX_DATA` in `/src/calculators/federal/constants.ts`
3. **California Tax Data:** Add the new year's data to `CALIFORNIA_TAX_DATA` in `/src/calculators/california/constants.ts`
4. **Testing:** Add test cases for the new year in the respective test files
5. **UI Updates:** Update the tax year selector to include the new year

### **9.4. Data Sources and Updates**

* **Federal Data:** Based on IRS publications and inflation adjustments
* **California Data:** Based on California FTB publications and state-specific adjustments
* **Update Process:** When official brackets are released, placeholder data can be easily replaced with accurate values

### **9.5. Testing Guidelines for New Tax Years**

The test framework is designed to automatically support new tax years with minimal effort:

#### **Test Architecture**
* **Parameterized Tests:** All tests run automatically for each supported tax year
* **Data-Driven Testing:** Test scenarios are defined in structured data objects by year
* **Flexible Assertions:** Tests can validate full results or specific fields as needed

#### **Adding Tests for New Tax Years**

When adding a new tax year (e.g., 2027):

1. **Update Test Constants:** Add the new year to `SUPPORTED_TAX_YEARS` in `/tests/calculators/test-utils.ts`
2. **Federal Test Data:** Add 2027 data to `TAX_YEAR_DATA` in `/tests/calculators/federal/calculator.test.ts`
   - Include standard deductions for both filing statuses
   - Add test scenarios for single and married filing jointly
   - Calculate expected values based on new tax brackets
3. **California Test Data:** Add 2027 data to `CA_TAX_YEAR_DATA` in `/tests/calculators/california/calculator.test.ts`
   - Include standard deductions and mental health tax threshold
   - Add test scenarios covering various income levels
4. **Run Tests:** Execute `npm test` to verify all scenarios pass for the new year

#### **Test Coverage**
* **Standard Deductions:** Automatic testing for all filing statuses and years
* **Tax Calculations:** Comprehensive scenarios including edge cases, capital gains, and high income
* **Edge Cases:** Zero income, large deductions, and mental health tax thresholds
* **Multi-Year Validation:** All tests run for each supported tax year simultaneously

#### **Expected Value Calculation**
* Use online tax calculators or official IRS/FTB worksheets to calculate expected values
* Verify calculations manually for at least one test case per year
* Round values consistently with the calculator implementation (to 2 decimal places)

## **10\. Future Considerations**

* **Additional Filing Statuses:** Expand support for Head of Household, Married Filing Separately, etc.  
* **More Deduction/Credit Types:** Incorporate common tax credits (e.g., Child Tax Credit, Education Credits) and other deduction types.  
* **Self-Employment Income:** Add sections for business income and expenses, and calculation of self-employment tax.  
* **Additional States:** Support for states other than California if the product expands.  
* **Reporting:** Generate a printable summary report of the estimation.
* **Historical Tax Years:** Support for calculating taxes for previous years (2024, 2023, etc.).