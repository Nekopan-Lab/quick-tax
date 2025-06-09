#!/usr/bin/env node

import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { size: 152, name: 'icon-152.png' },
  { size: 167, name: 'icon-167.png' },
  { size: 180, name: 'apple-touch-icon.png', exists: true }, // Already exists
  { size: 192, name: 'icon-192.png' },
  { size: 192, name: 'icon-192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-512-maskable.png', maskable: true },
  { size: 96, name: 'icon-96.png' }
];

const splashScreens = [
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS/11 Pro
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' }, // iPhone XS Max/11 Pro Max
  { width: 828, height: 1792, name: 'splash-828x1792.png' }    // iPhone XR/11
];

const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');
const appleTouchIconPath = join(publicDir, 'apple-touch-icon.png');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Read the SVG file for general icons
const svgBuffer = readFileSync(svgPath);

// Read the apple-touch-icon for iOS-specific icons
const appleIconBuffer = readFileSync(appleTouchIconPath);

// Generate icons
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const { size, name, maskable, exists } of sizes) {
    if (exists) {
      console.log(`Skipping ${name} (already exists)`);
      continue;
    }
    
    const outputPath = join(publicDir, name);
    
    // Use apple-touch-icon for iOS-specific icons (152, 167)
    const isIOSIcon = name.includes('icon-152') || name.includes('icon-167');
    const sourceBuffer = isIOSIcon ? appleIconBuffer : svgBuffer;
    
    if (maskable) {
      // For maskable icons, add padding (safe area)
      const padding = Math.floor(size * 0.1);
      const innerSize = size - (padding * 2);
      
      await sharp(sourceBuffer)
        .resize(innerSize, innerSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
    } else {
      // Regular icons
      await sharp(sourceBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
    }
    
    console.log(`Generated ${name} (${size}x${size})`);
  }
  
  // Generate splash screens
  console.log('\nGenerating splash screens...');
  
  for (const { width, height, name } of splashScreens) {
    const outputPath = join(publicDir, name);
    const iconSize = Math.min(width, height) * 0.25;
    
    // Create a white background with centered apple-touch-icon
    const icon = await sharp(appleIconBuffer)
      .resize(Math.floor(iconSize), Math.floor(iconSize))
      .png()
      .toBuffer();
    
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([
        {
          input: icon,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(outputPath);
    
    console.log(`Generated ${name} (${width}x${height})`);
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);