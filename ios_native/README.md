# Quick Tax - Native iOS App

This is the native iOS implementation of Quick Tax, an estimated tax calculator for Federal and California taxes.

## Features

- **Tax Year 2025 Support**: Calculates estimated taxes for the 2025 tax year
- **Filing Status**: Supports Single and Married Filing Jointly
- **Income Types**: W2 wages, investment income, capital gains, dividends, RSUs
- **Deductions**: Standard vs. itemized deduction comparison
- **Real-time Calculations**: Updates as you type
- **Estimated Payments**: Track quarterly payments and get suggestions
- **Privacy First**: All data stored locally on device

## Architecture

- **UI Framework**: SwiftUI (standard Apple framework only)
- **Architecture Pattern**: MVVM
- **Data Persistence**: UserDefaults for local storage
- **Tax Calculations**: Direct translation from TypeScript web app

## Project Structure

```
QuickTaxNative/
├── Models/              # Data models and store
├── Views/               # SwiftUI views
│   └── Components/      # Reusable UI components
├── Calculators/         # Tax calculation logic
│   ├── Federal/         # Federal tax calculator
│   └── California/      # California tax calculator
├── Extensions/          # Swift extensions
└── Assets.xcassets/     # Images and colors
```

## Building and Running

1. Open `QuickTaxNative.xcodeproj` in Xcode
2. Select your target device or simulator
3. Press Cmd+R to build and run

## Testing

The project includes comprehensive unit tests for tax calculations:
- Run tests with Cmd+U in Xcode
- Tests verify calculation accuracy against web app results

## Development Notes

- Team ID is protected by git filters (see Scripts directory)
- All monetary values displayed as whole dollars (no cents)
- Tax calculations use Decimal type for precision
- Test cases match exactly with web app implementation

## Privacy

All data is stored locally on the device. No data is transmitted to any servers.