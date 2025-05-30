#!/bin/bash
# Git smudge filter - restores DEVELOPMENT_TEAM value on checkout
# Read the team ID from environment or a local config file

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="$SCRIPT_DIR/../.xcode-config"

# Default team ID (empty)
TEAM_ID=""

# Try to read from config file
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    TEAM_ID="${XCODE_DEVELOPMENT_TEAM:-}"
fi

# Fall back to environment variable if not in config
TEAM_ID="${TEAM_ID:-${XCODE_DEVELOPMENT_TEAM:-}}"

# Apply the team ID
sed "s/DEVELOPMENT_TEAM = \"\";/DEVELOPMENT_TEAM = \"$TEAM_ID\";/g"