# QuickTax - 2025 Tax Estimator

QuickTax is a web-based tax estimation tool for the 2025 tax year, focusing on federal (IRS) and California state (FTB) tax calculations. This is a client-side only application with no server components - all data is stored locally in the browser.

## Important Disclaimer

QuickTax is intended solely as a planning tool for estimated tax payments and is not a substitute for professional tax advice, official tax filing software, or the services of a licensed tax preparer.

## Features

- Federal and California tax calculations for 2025
- Support for Single and Married Filing Jointly statuses
- Investment income tracking (dividends, interest, capital gains)
- W2 income and withholding tracking
- RSU vest calculations
- Standard vs Itemized deduction comparison
- Estimated tax payment tracking
- Real-time tax calculation updates
- Suggested remaining estimated payments
- Dark theme interface
- All data stored locally in browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quick-tax.git
cd quick-tax
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Browser localStorage for data persistence

## Privacy

All data entered into QuickTax is stored only on your local device and is never sent to any servers. You can delete all stored data at any time using the "Delete All Data" button in the application.

## License

See LICENSE file for details.