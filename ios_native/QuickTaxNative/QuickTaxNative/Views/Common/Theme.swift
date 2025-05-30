import SwiftUI

// MARK: - Color Theme
extension Color {
    // Primary Colors
    static let primaryBlue = Color(red: 0.0, green: 0.478, blue: 1.0) // System blue
    static let primaryGreen = Color(red: 0.20, green: 0.78, blue: 0.35) // Success green
    static let primaryRed = Color(red: 1.0, green: 0.27, blue: 0.23) // Warning red
    
    // Background Colors
    static let backgroundPrimary = Color(UIColor.systemBackground)
    static let backgroundSecondary = Color(UIColor.secondarySystemBackground)
    static let backgroundTertiary = Color(UIColor.tertiarySystemBackground)
    
    // Text Colors
    static let textPrimary = Color(UIColor.label)
    static let textSecondary = Color(UIColor.secondaryLabel)
    static let textTertiary = Color(UIColor.tertiaryLabel)
    
    // Accent Colors
    static let accentPurple = Color(red: 0.69, green: 0.32, blue: 0.87)
    static let accentOrange = Color(red: 1.0, green: 0.62, blue: 0.04)
    
    // Status Colors
    static let successBackground = Color.primaryGreen.opacity(0.15)
    static let warningBackground = Color.primaryRed.opacity(0.15)
    static let infoBackground = Color.primaryBlue.opacity(0.15)
}

// MARK: - Typography
struct Typography {
    static let largeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let title1 = Font.system(size: 28, weight: .bold, design: .rounded)
    static let title2 = Font.system(size: 22, weight: .semibold, design: .rounded)
    static let title3 = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let headline = Font.system(size: 17, weight: .semibold, design: .default)
    static let body = Font.system(size: 17, weight: .regular, design: .default)
    static let callout = Font.system(size: 16, weight: .regular, design: .default)
    static let subheadline = Font.system(size: 15, weight: .regular, design: .default)
    static let footnote = Font.system(size: 13, weight: .regular, design: .default)
    static let caption1 = Font.system(size: 12, weight: .regular, design: .default)
    static let caption2 = Font.system(size: 11, weight: .regular, design: .default)
}

// MARK: - Spacing
struct Spacing {
    static let xxxSmall: CGFloat = 2
    static let xxSmall: CGFloat = 4
    static let xSmall: CGFloat = 8
    static let small: CGFloat = 12
    static let medium: CGFloat = 16
    static let large: CGFloat = 20
    static let xLarge: CGFloat = 24
    static let xxLarge: CGFloat = 32
    static let xxxLarge: CGFloat = 40
}

// MARK: - Corner Radius
struct CornerRadius {
    static let small: CGFloat = 8
    static let medium: CGFloat = 12
    static let large: CGFloat = 16
    static let xLarge: CGFloat = 20
    static let pill: CGFloat = 1000
}

// MARK: - Shadow
struct ShadowStyle {
    static let small = (color: Color.black.opacity(0.1), radius: CGFloat(4), x: CGFloat(0), y: CGFloat(2))
    static let medium = (color: Color.black.opacity(0.15), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
    static let large = (color: Color.black.opacity(0.2), radius: CGFloat(16), x: CGFloat(0), y: CGFloat(8))
}