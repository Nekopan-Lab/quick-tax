# **QuickTax Product Requirements Document**

## **1\. Introduction**

This document outlines the product requirements for "QuickTax," a web-based application designed to help individuals estimate their federal and California state tax payments throughout the tax year 2025\.

**IMPORTANT DISCLAIMER:** QuickTax is intended solely as a planning tool for *estimated* tax payments and is *not* a substitute for professional tax advice, official tax filing software, or the services of a licensed tax preparer. Its primary goal is to provide users with real-time insights into their estimated tax liability, allowing them to adjust their financial planning proactively.

## **2\. Goals**

* **Empower Users:** Provide a user-friendly tool for individuals to proactively estimate their tax payments for the 2025 tax year.  
* **Real-time Feedback:** Offer immediate updates on estimated tax owed or overpaid as users input their financial data.  
* **Simplify Complexity:** Break down tax calculations into understandable steps, guiding users through the process.  
* **Data Privacy:** Ensure all user data remains local to their device, reinforcing privacy and control.  
* **Support Key Scenarios:** Cater to common filing statuses (Single, Married Filing Jointly) and income types.

## **3\. Scope**

### **3.1. In Scope**

* **Product Name:** QuickTax  
* **Purpose:** Estimated tax payment calculation (not for filing).  
* **Tax Year:** 2025 (with architecture designed for future year expandability).  
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
* Support for tax years other than 2025 initially.  
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
   * **Prominent Disclaimer:** A clear, highly visible disclaimer stating that the tool is for estimation purposes only and does not constitute professional tax advice or licensed tax preparation.  
   * Automatically pre-fill with previous data if available, or start a new estimation if no previous data is found.  
   * Option to delete all locally stored data.  
   * A small footer link, when clicked, will open a popup with the data privacy disclaimer.  
2. **Step 1: Filing Status & Tax Scope:**  
   * **Input:**  
     * Filing Status: Radio buttons for "Single" or "Married Filing Jointly."  
     * Tax Scope: A checkbox for "California State Tax (FTB)." Federal tax calculation will always be performed.  
   * **Action:**  
     * Based on the Filing Status selection, the application will apply the correct federal and state tax rules.  
     * If "California State Tax (FTB)" is *not* checked, all California-specific UX elements (e.g., state-specific income fields, state estimated payment inputs, state tax breakdown) will be hidden or disabled.  
3. **Step 2: Deductions:**  
   * **Input:**  
     * Estimated full-year Property Tax.  
     * Estimated full-year Mortgage Interest.  
     * Estimated full-year Donations.  
   * **Guidance:** A clear explanation that these are *full-year estimations*.  
   * **Logic & Display:**  
     * Calculate total itemized deductions.  
     * Compare total itemized deductions to the applicable standard deduction for the selected filing status (Federal and California separately, if CA tax is selected).  
     * Automatically select and display which deduction method (Standard or Itemized) is more beneficial for the user for *each* jurisdiction, explaining why.  
     * The higher deduction amount will be used in subsequent tax calculations.  
4. **Step 3: Income:**  
   * **Structure:** Separate sections for "User Income" and "Spouse Income" (spouse section optional/skippable if filing status is Single).  
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
         * **Most Recent RSU Vest Data:**  
           * Taxable Wage (per vest).  
           * Federal Withhold (per vest).  
           * State Withhold (per vest) \- *This field will be hidden if California State Tax is not selected.*  
           * Vest Price (per share, if applicable, for calculation context).  
         * **Future RSU Vests:**  
           * Number of additional RSU vests expected for the rest of the year.  
           * Expected Vest Price for each future vest (default to most recent, user editable).  
   * **Real-time Display:** As income fields are updated, the "Calculated Total Income" for the user and spouse will update in real-time.  
5. **Step 4: Estimated Tax Payments YTD:**  
   * **Input:**  
     * Separate input fields for payments made for each IRS estimated tax due date.  
     * Separate input fields for payments made for each California FTB estimated tax due date (note CA has 3 payment dates) \- *These fields will be hidden if California State Tax is not selected.*  
6. **Step 5: Summary & Actionable Insights:**  
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
       * **Federal:** If tax is owed, divide the remaining owed amount equally among the remaining due dates. Display each payment amount and its corresponding due date.  
       * **California:** If tax is owed, calculate remaining payments based on CA's weighted schedule (30% Q1, 40% Q2, 30% Q4), considering payments already made. Display each payment amount and its corresponding due date \- *This section will be hidden if California State Tax is not selected.*  
       * **Context:** Display suggested payments alongside payments already made to show the full picture.

### **4.2. Navigation**

* **Step-by-Step Flow:** Clear "Next" and "Previous" buttons to guide users sequentially.  
* **Quick Navigation:** A persistent sidebar or top navigation bar with clickable links to each major step (e.g., "1. Filing Status," "2. Deductions," "3. Income," etc.) for quick access and editing.

### **4.3. Visual Design**

* **Theme:** The application will utilize a dark theme for its user interface. This includes dark backgrounds, light text, and appropriately contrasting accent colors to ensure readability and a modern aesthetic.

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
* **Styling:** Tailwind CSS for rapid and consistent UI development, ensuring responsiveness across devices. The dark theme will be implemented using Tailwind's dark mode capabilities or custom CSS variables.  
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

## **8\. Future Considerations**

* **Support for Additional Tax Years:** Implement a mechanism to easily update tax brackets, standard deductions, and rules for future tax years (e.g., through a configuration file or a simple data update process).  
* **Additional Filing Statuses:** Expand support for Head of Household, Married Filing Separately, etc.  
* **More Deduction/Credit Types:** Incorporate common tax credits (e.g., Child Tax Credit, Education Credits) and other deduction types.  
* **Self-Employment Income:** Add sections for business income and expenses, and calculation of self-employment tax.  
* **Internationalization/Localization:** Support for other states or countries if the product expands.  
* **Reporting:** Generate a printable summary report of the estimation.