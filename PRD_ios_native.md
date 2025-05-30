# **QuickTax Native iOS App - Product Requirements Document**

## **1. Overview**

This document outlines the requirements for creating a fully native iOS implementation of QuickTax, which will exist alongside the current web-based and WebView-wrapped iOS applications. The native app will provide an authentic iOS user experience while maintaining feature parity with the existing web application.

## **2. Project Structure**

### **2.1. Directory Organization**
- All native iOS app code will be contained within `/ios_native/` subdirectory
- The existing web app and WebView iOS app remain untouched
- Shared resources (like app icons) will be referenced from the existing iOS app where possible

### **2.2. Bundle Configuration**
- **Bundle Identifier:** `me.denehs.quicktaxnative`
- **Team ID:** Same as existing app - will use git filters to prevent committing
- **App Display Name:** Quick Tax (for App Store and user-facing display)
- **Internal Project Name:** QuickTaxNative (for code organization only)
- **Deployment Target:** iOS 15.0+
- **Supported Devices:** Universal (iPhone and iPad)

## **3. Technical Architecture**

### **3.1. UI Framework**
- **Primary Framework:** SwiftUI (Standard Apple Framework Only)
  - Provides modern, declarative UI development
  - Native iOS look and feel with system-standard components
  - Excellent support for dynamic layouts and state management
  - Built-in support for Dark Mode and accessibility features
- **No Third-Party UI Libraries:** 
  - Use only standard SwiftUI components and modifiers
  - Leverage SF Symbols for consistent iconography
  - Custom styling through ViewModifiers and ButtonStyles
  - Ensures authentic iOS experience and minimal dependencies

### **3.2. Architecture Pattern**
- **MVVM (Model-View-ViewModel)** architecture
  - Clear separation between UI and business logic
  - Facilitates testing of tax calculation logic
  - Supports reactive UI updates with Combine framework

### **3.3. Data Management**
- **Core Data** for local persistence
  - Stores user inputs and calculations
  - Supports multiple tax year scenarios
  - All data remains local to device
- **UserDefaults** for app preferences and settings

### **3.4. Tax Calculation Engine**
- Direct translation of existing web app calculation logic from TypeScript to Swift
- Maintain exact same calculation methods and formulas to ensure consistent results
- Modular design matching web app structure:
  - Federal tax calculations (translating `/src/calculators/federal/`)
  - California state tax calculations (translating `/src/calculators/california/`)
  - Shared utilities (translating `/src/calculators/utils/`)
- Use same test cases from web app to verify calculation accuracy
- Line-by-line translation of calculation algorithms to prevent discrepancies

## **4. Feature Parity Requirements**

### **4.1. Implementation Approach**
To ensure absolute consistency with the web app:
1. **Code Analysis:** Thoroughly analyze existing TypeScript implementations in `/src/`
2. **Direct Translation:** Convert TypeScript code to Swift maintaining exact logic flow
3. **Test Case Reuse:** Use existing test cases from `/tests/` to verify iOS calculations
4. **Validation:** Compare results between web and iOS apps for identical inputs

### **4.2. Supported Features (Exact Match with Web App)**
Based on analysis of the web app codebase:
- **Tax Years:** 2025 only (with architecture designed to easily add future years, matching the approach in `/src/calculators/federal/constants.ts` and `/src/calculators/california/constants.ts`)
- **Filing Status:** Single, Married Filing Jointly (as implemented in `/src/types/index.ts`)
- **Income Types:** (matching `/src/components/steps/Income.tsx`)
  - Investment Income (Ordinary/Qualified Dividends, Interest, Short/Long-term Capital Gains/Losses)
  - YTD W2 Income (Taxable Wage, Federal/State Withholdings)
  - Future Income (Simple Estimation and Detailed Paycheck/RSU modes with exact same fields)
- **Deductions:** (matching `/src/components/steps/Deductions.tsx`)
  - Standard vs. Itemized comparison logic
  - SALT cap implementation ($10,000 federal limit)
  - Mortgage interest limits based on loan date
- **Estimated Tax Payments:** (matching `/src/components/steps/EstimatedPayments.tsx`)
  - Federal quarterly payments (4 dates)
  - California weighted payments (3 dates with 30%-40%-30% split)
- **Calculation Logic:** (direct translation from `/src/calculators/orchestrator.ts`)
  - Real-time calculations with same update triggers
  - Identical tax bracket applications
  - Internal calculations use full precision (Decimal type)
  - Display values rounded to whole dollars (no decimals shown to users)

### **4.3. iOS-Specific Enhancements**
- **Native Navigation:** Tab bar or navigation controller based flow
- **iOS Input Controls:**
  - Native number pads for financial inputs
  - Date pickers for payment dates and vesting schedules
  - Segmented controls for filing status
  - Native switches for options
- **Haptic Feedback:** Subtle feedback for important actions
- **Split View Support:** Optimized layouts for iPad
- **Keyboard Management:** Automatic scrolling and input field management
- **Share Sheet Integration:** Export summaries and calculations

## **5. User Experience Design**

### **5.1. Navigation Flow**
- **Tab-Based Navigation** for main sections:
  - Setup (Tax Year & Filing Status)
  - Income
  - Deductions
  - Payments
  - Summary
- **Modal Presentations** for:
  - Adding RSU vests
  - Detailed breakdowns
  - Settings and data management

### **5.2. Visual Design**
- **iOS Design Language:**
  - System fonts (SF Pro)
  - Standard iOS spacing and margins
  - Native iOS controls and gestures
- **Color Scheme:**
  - System colors that adapt to Light/Dark mode
  - Accent color matching the existing app icon theme
  - Semantic colors for income (green) and owed taxes (red)

### **5.3. Responsive Design**
- **iPhone:** Single column layout with stacked components
- **iPad:** Multi-column layout utilizing available space
- **Dynamic Type:** Support for all accessibility text sizes
- **Orientation:** Support for both portrait and landscape

### **5.4. Number Formatting and Display**
- **Display Format:** All monetary values displayed to users must be shown as whole numbers (no decimal places)
- **Internal Calculations:** Use Decimal type for all calculations to maintain precision
- **Formatting Rules:**
  - Round to nearest dollar for display using standard rounding (0.5 rounds up)
  - Use NumberFormatter with currency style and 0 fraction digits
  - Include thousands separators for readability (e.g., $1,234 not $1234)
  - Negative values shown with minus sign before dollar sign (e.g., -$500)
- **Input Fields:** Accept only whole dollar amounts (no cents input)
- **Consistency:** Match web app's display formatting exactly

## **6. Implementation Plan**

### **6.1. Phase 1: Project Setup and Core Architecture**
1. Create Xcode project structure in `/ios_native/`
2. Set up git filters for Team ID protection
3. Implement core data models and persistence layer
4. Create tax calculation engine with unit tests

### **6.2. Phase 2: UI Implementation**
1. Build navigation structure and main views
2. Implement income input screens
3. Create deduction selection interface
4. Build estimated payments tracking
5. Develop summary and insights view

### **6.3. Phase 3: Polish and Testing**
1. Add animations and transitions
2. Implement haptic feedback
3. Comprehensive testing on various devices
4. Performance optimization
5. Accessibility audit and improvements

## **7. Testing Strategy**

### **7.1. Unit Tests**
- Direct translation of existing web app test cases from `/tests/calculators/`
- Reuse test scenarios and expected values to ensure calculation consistency
- 100% coverage for tax calculation logic
- Test all edge cases and calculation scenarios already defined in web app
- Parameterized tests for multiple tax years matching web implementation

### **7.2. UI Tests**
- Automated UI tests for critical user flows
- Input validation testing
- State persistence verification

### **7.3. Manual Testing**
- Device testing across iPhone and iPad models
- iOS version compatibility testing (iOS 15-17)
- Accessibility testing with VoiceOver

## **8. Code Reference Strategy**

### **8.1. Web App References (For Consistency Only)**
Note: These are referenced to ensure identical behavior, not for direct code reuse:
- Tax calculation logic from `/src/calculators/` - studied and reimplemented in Swift
- Test cases and expected values from `/tests/` - used to verify iOS calculations match
- Tax constants and brackets from constants files - manually transcribed to Swift
- Business logic flow from orchestrator - reimplemented using iOS patterns
- Validation rules and edge cases - ensuring same behavior in iOS

### **8.2. iOS App Resources to Copy**
- App icon assets - copy from existing iOS app to maintain brand consistency
- Git filter configuration - replicate Team ID protection approach
- Project structure patterns - use as reference for organization

### **8.3. Completely New Implementations**
- All Swift code written from scratch (no direct code reuse)
- Native iOS UI components throughout
- iOS-specific architecture (MVVM, Core Data, etc.)
- Swift-idiomatic implementations of all features

## **9. Deployment Considerations**

### **9.1. App Store**
- App Store listing name: "Quick Tax"
- Will replace the existing WebView-based app in the store
- Same developer account and team
- Smooth transition strategy for existing users

### **9.2. Version Management**
- Independent versioning from web app
- Coordinated feature releases when possible
- Clear migration path for users wanting to switch

## **10. Privacy and Security**

### **10.1. Data Storage**
- All data stored locally on device only
- No cloud sync functionality
- No server communication required

### **10.2. Privacy Policy**
- Same privacy stance as web app
- Clear disclosure of local-only data storage
- Compliance with App Store privacy requirements

## **11. Multi-Year Tax Support Architecture**

### **11.1. Current Implementation**
- **Initial Release:** Support for tax year 2025 only
- **Year Selection UI:** Display year selector with 2025 as the only option to clearly indicate which tax year is being estimated
- **Future Ready:** UI component designed to easily accommodate additional years when added

### **11.2. Future-Ready Architecture**
Following the web app's pattern:
- **Year-Based Constants:** Store tax brackets, deductions, and rates in year-keyed dictionaries
- **Protocol-Based Calculators:** Define calculator protocols that accept year parameters
- **Easy Extension:** Adding a new year requires only:
  1. Adding new year's data to constant dictionaries
  2. Adding year to supported years enum
  3. Enabling year selection in UI
- **Test Infrastructure:** Parameterized tests that can automatically test new years

### **11.3. Implementation Pattern**
```swift
// Example structure matching web app approach
struct TaxYearData {
    let standardDeductions: [FilingStatus: Decimal]
    let taxBrackets: [FilingStatus: [TaxBracket]]
    // ... other year-specific data
}

let federalTaxData: [Int: TaxYearData] = [
    2025: TaxYearData(...)
    // Future years added here
]
```

## **12. Success Criteria**

1. **Feature Parity:** All web app features available in native app
2. **Performance:** Instant calculations with no perceptible lag
3. **Native Feel:** Indistinguishable from other native iOS apps
4. **User Satisfaction:** Smooth, intuitive experience for tax estimation
5. **Maintainability:** Clean, testable code architecture

## **13. Future Enhancements**

- **Widgets:** Home screen widgets showing tax summary
- **Shortcuts:** Siri Shortcuts for quick access to features
- **Apple Watch:** Companion app for quick reference
- **Document Scanner:** Receipt and document capture for deductions