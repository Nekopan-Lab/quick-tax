const fs = require('fs');

// Read the file
let content = fs.readFileSync('/Users/davidkao/Codes/quick-tax/src/components/Step3Income.tsx', 'utf8');

// Define color replacements
const replacements = [
  // Text colors
  { from: /text-gray-100/g, to: 'text-gray-900' },
  { from: /text-gray-200/g, to: 'text-gray-800' },
  { from: /text-gray-300/g, to: 'text-gray-700' },
  { from: /text-gray-400/g, to: 'text-gray-600' },
  { from: /text-gray-500/g, to: 'text-gray-500' },
  
  // Background colors
  { from: /bg-gray-700\/50/g, to: 'bg-gray-50 border border-gray-200' },
  { from: /bg-gray-700/g, to: 'bg-white' },
  { from: /bg-gray-800/g, to: 'bg-gray-100' },
  
  // Border colors
  { from: /border-gray-600/g, to: 'border-gray-300' },
  { from: /border-gray-700/g, to: 'border-gray-300' },
  
  // Placeholder colors
  { from: /placeholder-gray-500/g, to: 'placeholder-gray-400' },
  
  // Button colors
  { from: /bg-gray-600/g, to: 'bg-gray-300' },
  { from: /hover:bg-gray-700/g, to: 'hover:bg-gray-400' },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Write the updated content
fs.writeFileSync('/Users/davidkao/Codes/quick-tax/src/components/Step3Income.tsx', content);

console.log('Step3Income.tsx has been updated to light theme!');