# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickTax is a web-based tax estimation tool for the 2025 tax year, focusing on federal (IRS) and California state (FTB) tax calculations. This is a client-side only application with no server components - all data is stored locally in the browser.

## Architecture Principles

### Separation of Concerns
- **UX Layer**: Handles all user interface, data input, and display logic
- **Calculation Logic**: Completely decoupled from UI, contains all tax computation logic
- **Federal vs State**: Federal (IRS) and California (FTB) calculations are modularized into separate modules
- **Shared Utilities**: Common calculation patterns (tax brackets, income aggregation) are extracted into reusable utilities

### Data Flow
1. User inputs data through step-by-step UI flow
2. Data is automatically saved to local browser storage
3. Real-time calculations update as user modifies inputs
4. No data is ever transmitted to servers

## Key Technical Stack

- **Frontend Framework**: Modern JavaScript framework (React/Vue/Angular)
- **Styling**: Tailwind CSS with light theme
- **State Management**: Robust client-side state management
- **Storage**: Browser localStorage or IndexedDB only

## Tax Calculation Requirements

### Filing Statuses
- Single
- Married Filing Jointly

### Income Types
- Investment Income (dividends, interest, capital gains/losses)
- W2 Income (YTD and future projections)
- RSU vests

### Deductions
- Standard vs Itemized comparison
- Property tax, mortgage interest, donations

### Tax Rules (2025)
- Federal: Progressive brackets with separate capital gains rates
- California: All income taxed as ordinary income, includes 1% mental health tax >$1M

## Testing Requirements

All tax calculation functions must have comprehensive unit tests covering:
- Federal tax calculations for all brackets and filing statuses
- California tax calculations including mental health tax
- Deduction comparisons (standard vs itemized)
- Capital gains calculations (federal only)
- Withholding and estimated payment tracking

## Privacy Requirements

- All data must remain local to the browser
- No external API calls or server communication
- Clear data deletion functionality must be provided
- Privacy disclaimer must be prominently displayed

## Deployment Requirements

- This application should be deployed via GitHub Pages, i.e. works as a static web page
- The build process must generate static assets that can be served directly without a backend server
- **CRITICAL**: The root directory must contain `index.html` as the entry point for GitHub Pages
- After any code changes, always:
  1. Run `npm run build` to generate production assets in `dist/`
  2. Copy `dist/index.html` to root directory as `index.html`
  3. Copy `dist/assets/` folder to root directory as `assets/`
  4. Commit and push all changes including the root `index.html` and `assets/` folder

## Local Testing

- For local testing, use a simple web server pointing to the root directory
- **Recommended method**: `python3 -m http.server 8000` from the root directory
- Access the application at `http://localhost:8000`
- This ensures testing matches the GitHub Pages deployment environment
- Do NOT use `npm run dev` for final testing as it runs a different server configuration

## Development Guidelines

- Always include summary of user's prompt as part of commit message
- Reference the exact user request in commit messages using format: "As requested: '[user prompt]'"