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

### Deployment Process & Testing

#### Cloudflare Workers Deployment
The project uses Cloudflare Workers for deployment:
1. Build the project: `npm run build`
2. Deploy to Cloudflare Workers: `npx wrangler deploy`
3. The app will be deployed to https://quicktax.nekopanlab.com

For CI/CD automation, you can set up GitHub Actions or other CI tools to run these commands on push to main.

#### Custom Domain Configuration
- Domain: https://quicktax.nekopanlab.com
- Configured via Cloudflare dashboard and wrangler.toml
- Vite config uses `base: '/'` for proper asset paths

#### CRITICAL: Deployment Build Verification
**You MUST verify the build works after EVERY code change to ensure Cloudflare Workers compatibility:**

1. **Test with dev server first:**
   - Use the dev server workflow above to test functionality
   - Ensure no console errors or warnings

2. **Verify production build:**
   ```bash
   npm run build
   ```
   - Must complete without errors
   - Check that `dist/` directory is created
   - Verify `dist/index.html` exists
   - Ensure `dist/assets/` contains JS/CSS files

3. **Common deployment issues to watch for:**
   - TypeScript errors that block the build
   - Missing dependencies in `package.json`
   - Import path errors that work in dev but fail in build
   - Asset references that don't resolve correctly

4. **Before pushing:**
   - Ensure `npm run build` succeeds
   - All tests pass (`npm test -- --run`)
   - No TypeScript errors
   - Dev server shows no console errors

### Development Guidelines

#### Local Testing After Code Changes
**MANDATORY**: After ANY code change, you MUST test BEFORE committing:

1. **Check if dev server is already running:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
   ```

2. **If server is NOT running (non-200 response), start it:**
   ```bash
   nohup npm run dev > dev.log 2>&1 & echo $!
   sleep 3
   ```

3. **Provide clickable link to user:**
   ```
   ✅ Development server running: http://localhost:5173/
   ```
   Note: Vite's hot module replacement will automatically reload changes in the browser

4. **Wait for user confirmation:** Only commit and push changes AFTER the user has tested and confirmed the changes work correctly.

5. **IMPORTANT**: This testing step must happen BEFORE any git commits. The workflow is:
   - Make code changes
   - Check if dev server is running (if not, start it)
   - Provide test link to user
   - Wait for user feedback
   - Only then commit and push if approved

#### Commit Messages
- Always include summary of user's prompt
- Format: "As requested: '[user prompt]'"
- When PRD is updated: "Updated PRD.md to reflect: [change]"

#### Auto-commit on Approval
- When user says "looks good" after testing changes, automatically commit and push
- No need to ask for permission to commit after "looks good" confirmation

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