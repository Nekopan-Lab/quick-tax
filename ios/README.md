# QuickTax iOS App

This directory contains the iOS wrapper application for QuickTax. The app uses a WKWebView to display the web application, providing a native iOS experience while leveraging the existing web codebase.

## Architecture

- **Universal App**: Supports both iPhone and iPad
- **WKWebView-based**: Displays the web app in a native container
- **Local Assets**: Web assets are bundled within the app for offline functionality
- **Native Navigation**: iOS navigation bar with reload functionality

## Development Setup

### Prerequisites

- Xcode 14.0 or later
- iOS 15.0+ deployment target
- Node.js and npm (for building web assets)

### Initial Setup

1. First, build and sync the web assets:
   ```bash
   npm run build:ios
   ```

2. Open the iOS project in Xcode:
   ```bash
   open ios/QuickTax/QuickTax.xcodeproj
   ```

3. Configure signing (required for device testing):
   - Select the QuickTax target
   - Go to "Signing & Capabilities"
   - Select your development team
   - Xcode will automatically manage provisioning profiles
   - Your team ID will be saved locally (not committed to git)

4. Build and run:
   - Select your target device (simulator or physical device)
   - Press Cmd+R or click the Run button

### Development Team Privacy

The project uses Git filters to keep your Apple Development Team ID private:
- Team IDs are automatically stripped when committing
- Your local team ID is stored in `ios/.xcode-config` (gitignored)
- The filters automatically restore your team ID when checking out

If you need to manually set your team ID:
```bash
echo "XCODE_DEVELOPMENT_TEAM=YOUR_TEAM_ID" > ios/.xcode-config
```

## Development Workflow

### Automated Build Integration

The project includes automated scripts to sync web assets to the iOS app:

- `npm run build:ios` - Builds web assets and syncs to iOS project
- `npm run dev:ios` - Same as build:ios with a friendly completion message
- `npm run clean:ios` - Removes synced web assets from iOS project

### Typical Development Flow

1. Make changes to the web application
2. Test in browser: `npm run dev`
3. Build and sync for iOS: `npm run build:ios`
4. Open Xcode and run the app
5. Test on simulator or device

### Important Notes

- Always run `npm run build:ios` after making web changes
- The sync script copies from `dist/` to `ios/QuickTax/QuickTax/WebResources/`
- Web assets in the iOS project are gitignored (except .gitkeep)
- The iOS app loads `index.html` from the bundled resources

## Project Structure

```
ios/
├── QuickTax/
│   ├── QuickTax.xcodeproj      # Xcode project file
│   └── QuickTax/
│       ├── AppDelegate.swift    # App lifecycle management
│       ├── SceneDelegate.swift  # Scene lifecycle management
│       ├── ViewController.swift # Main WebView controller
│       ├── Info.plist          # App configuration
│       ├── Assets.xcassets     # App icons and assets
│       ├── LaunchScreen.storyboard
│       └── WebResources/       # Synced web assets (gitignored)
├── Scripts/
│   └── sync-web-assets.sh      # Asset sync script
└── README.md                   # This file
```

## Testing

1. **Simulator Testing**: Works out of the box, no special configuration needed
2. **Device Testing**: Requires Apple Developer account for code signing
3. **TestFlight**: For beta testing, archive and upload through Xcode

## Distribution

### Local Distribution
1. Build for release: Product → Archive in Xcode
2. Export for Ad Hoc or Development distribution
3. Install via Xcode, Apple Configurator, or MDM

### App Store Distribution
1. Ensure app meets App Store guidelines
2. Update version and build numbers
3. Archive and upload to App Store Connect
4. Submit for review

## Troubleshooting

### Web assets not loading
- Ensure you ran `npm run build:ios`
- Check that WebResources folder contains index.html
- Clean build folder in Xcode (Cmd+Shift+K)

### Build errors
- Update Xcode to latest version
- Check that deployment target matches Info.plist
- Ensure Swift version is set correctly (5.0)

### JavaScript/LocalStorage issues
- WKWebView has some differences from Safari
- Check Safari developer console when connected to device
- Ensure all web APIs used are WKWebView compatible

## Version Management

- Web version: Managed in package.json
- iOS version: Managed in Xcode (Info.plist)
- Keep versions in sync for consistency
- Use semantic versioning (e.g., 1.0.0)

## Privacy & Security

- All data stored locally in WKWebView's localStorage
- No network requests to external servers
- No user tracking or analytics
- App Transport Security not required (local files only)