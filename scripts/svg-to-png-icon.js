#!/usr/bin/env node

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'quicktax-icon.svg');
const outputPath = join(publicDir, 'apple-touch-icon-from-svg.png');

async function convertSvgToPng() {
  console.log('Converting SVG to PNG...');
  
  // Read the SVG file
  const svgBuffer = readFileSync(svgPath);
  
  // Convert to PNG at 1024x1024
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png({ quality: 100 })
    .toFile(outputPath);
  
  console.log('Created apple-touch-icon-from-svg.png');
  console.log('Preview the icon and if you like it, replace with:');
  console.log('mv public/apple-touch-icon-from-svg.png public/apple-touch-icon.png');
}

convertSvgToPng().catch(console.error);