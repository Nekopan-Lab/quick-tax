import SwiftUI

// MARK: - Theme Colors
extension Color {
    // MARK: Brand Colors
    static let emeraldGreen = Color(red: 16/255, green: 185/255, blue: 129/255)        // #10B981
    static let emeraldGreenDark = Color(red: 4/255, green: 120/255, blue: 87/255)      // #047857
    static let goldAccent = Color(red: 245/255, green: 158/255, blue: 11/255)          // #F59E0B
    static let goldAccentDark = Color(red: 217/255, green: 119/255, blue: 6/255)       // #D97706
    
    // MARK: Semantic Colors
    static let primaryBrand = emeraldGreen
    static let accentBrand = goldAccent
    
    // Navigation & Selection
    static let navSelected = emeraldGreen
    static let navSelectedBackground = emeraldGreen.opacity(0.1)
    static let toggleOn = emeraldGreen
    
    // Buttons
    static let buttonPrimary = emeraldGreen
    static let buttonAccent = goldAccent
    static let buttonDanger = Color.red
    
    // Status Colors
    static let success = Color(red: 34/255, green: 197/255, blue: 94/255)              // #22C55E
    static let warning = goldAccent
    static let error = Color(red: 239/255, green: 68/255, blue: 68/255)                // #EF4444
    
    // Backgrounds
    static let cardBackground = Color(UIColor.secondarySystemGroupedBackground)
    static let subtleBackground = Color(UIColor.tertiarySystemFill)
    static let selectedBackground = emeraldGreen.opacity(0.1)
    static let warningBackground = goldAccent.opacity(0.1)
    static let selectedBorder = emeraldGreen
    
    // Text
    static let primaryText = Color(UIColor.label)
    static let secondaryText = Color(UIColor.secondaryLabel)
    static let tertiaryText = Color(UIColor.tertiaryLabel)
}

// MARK: - Legacy Color Support
extension Color {
    // Keep these for backward compatibility
    static let customBlue = emeraldGreen
    static let customOrange = goldAccent
    static let customGreen = success
    static let customRed = error
    static let primaryBlue = emeraldGreen
    static let backgroundTertiary = Color(UIColor.tertiarySystemBackground)
}

// MARK: - Additional Color Extensions
extension Color {
    static let backgroundSecondary = Color(UIColor.secondarySystemBackground)
    static let textPrimary = Color(UIColor.label)
    static let textSecondary = Color(UIColor.secondaryLabel)
    static let textTertiary = Color(UIColor.tertiaryLabel)
    static let accentPurple = Color.purple
}

// MARK: - Corner Radius Constants
enum CornerRadius {
    static let small: CGFloat = 8
    static let medium: CGFloat = 12
    static let large: CGFloat = 16
}

// MARK: - Spacing Constants
enum Spacing {
    static let xxxSmall: CGFloat = 2
    static let xxSmall: CGFloat = 4
    static let xSmall: CGFloat = 8
    static let small: CGFloat = 12
    static let medium: CGFloat = 16
    static let large: CGFloat = 20
    static let xLarge: CGFloat = 24
    static let xxLarge: CGFloat = 32
}

// MARK: - Typography
enum Typography {
    static let largeTitle = Font.largeTitle
    static let title = Font.title
    static let title2 = Font.title2
    static let title3 = Font.title3
    static let headline = Font.headline
    static let body = Font.body
    static let callout = Font.callout
    static let subheadline = Font.subheadline
    static let footnote = Font.footnote
    static let caption1 = Font.caption
    static let caption2 = Font.caption2
}

// MARK: - Shadow Styles
struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
    
    static let small = ShadowStyle(
        color: Color.black.opacity(0.05),
        radius: 2,
        x: 0,
        y: 1
    )
    
    static let medium = ShadowStyle(
        color: Color.black.opacity(0.1),
        radius: 4,
        x: 0,
        y: 2
    )
    
    static let large = ShadowStyle(
        color: Color.black.opacity(0.15),
        radius: 8,
        x: 0,
        y: 4
    )
}