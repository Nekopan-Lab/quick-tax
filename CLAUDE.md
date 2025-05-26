# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Specifications Import

The following line imports all product specifications and requirements from the Product Requirements Document:

@PRD.md

**NOTE**: The imported PRD.md contains the complete product specifications for QuickTax, including user flows, tax calculation rules, UI requirements, and deployment instructions. All development work must align with these specifications.

## Important: PRD Update Policy

**CRITICAL**: If any future user prompts or requests conflict with the specifications in PRD.md, you must:
1. Inform the user of the conflict with the existing PRD
2. Ask for confirmation to proceed with the change
3. If confirmed, update PRD.md FIRST to reflect the new requirements
4. Then implement the changes in code
5. Include in commit message: "Updated PRD.md to reflect: [change description]"

## Technical Implementation Guidelines

### Key Principles
- **PRD.md is the authoritative source** for all product requirements
- Strict separation between UX layer and calculation logic (see PRD Section 6.1)
- All data remains client-side only

### Testing Requirements
- Comprehensive unit tests for all tax calculation functions
- Test coverage must include all scenarios in PRD Section 7

### Deployment Process
Follow the deployment requirements in PRD Section 8:
1. Run `npm run build`
2. Copy `dist/index.html` to root as `index.html`
3. Copy `dist/assets/` to root as `assets/`
4. Commit and push all changes

### Development Guidelines

#### Commit Messages
- Always include summary of user's prompt
- Format: "As requested: '[user prompt]'"
- When PRD is updated: "Updated PRD.md to reflect: [change]"

#### Code Standards
- Follow existing patterns and conventions
- Ensure alignment with PRD specifications
- Maintain test coverage for calculation logic

## Quick Reference

For detailed requirements, refer to these PRD sections:
- **User Flow**: Section 4
- **Tax Calculations**: Section 7
- **Deployment**: Section 8
- **Privacy**: Section 5.2