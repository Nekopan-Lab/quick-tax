#!/bin/bash

# sync-web-assets.sh
# Syncs built web assets from dist/ to iOS app bundle

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
IOS_PROJECT_DIR="$SCRIPT_DIR/../QuickTax/QuickTax"
WEB_RESOURCES_DIR="$IOS_PROJECT_DIR/WebResources"

echo "Starting iOS asset sync..."

# Check if dist directory exists
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    echo -e "${RED}Error: dist/ directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

# Create WebResources directory if it doesn't exist
mkdir -p "$WEB_RESOURCES_DIR"

# Clean existing resources (but keep .gitkeep if it exists)
if [ -f "$WEB_RESOURCES_DIR/.gitkeep" ]; then
    find "$WEB_RESOURCES_DIR" -mindepth 1 ! -name '.gitkeep' -delete
else
    rm -rf "$WEB_RESOURCES_DIR"/*
fi

# Copy all assets from dist to WebResources
echo "Copying assets from dist/ to iOS project..."
cp -R "$PROJECT_ROOT/dist/"* "$WEB_RESOURCES_DIR/"

# Fix absolute paths in index.html for iOS
echo "Fixing asset paths for iOS..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|href="/assets/|href="./assets/|g' "$WEB_RESOURCES_DIR/index.html"
    sed -i '' 's|src="/assets/|src="./assets/|g' "$WEB_RESOURCES_DIR/index.html"
else
    # Linux
    sed -i 's|href="/assets/|href="./assets/|g' "$WEB_RESOURCES_DIR/index.html"
    sed -i 's|src="/assets/|src="./assets/|g' "$WEB_RESOURCES_DIR/index.html"
fi

# Create a build info file
echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$WEB_RESOURCES_DIR/build-timestamp.txt"

# Count copied files
FILE_COUNT=$(find "$WEB_RESOURCES_DIR" -type f ! -name '.gitkeep' ! -name 'build-timestamp.txt' | wc -l | tr -d ' ')

echo -e "${GREEN}✅ Successfully synced $FILE_COUNT files to iOS project${NC}"
echo -e "${GREEN}📱 You can now build and run the iOS app in Xcode${NC}"