import SwiftUI

// MARK: - Modern Card View
struct CardView<Content: View>: View {
    let content: Content
    var padding: CGFloat = Spacing.medium
    var backgroundColor: Color = .backgroundSecondary
    
    init(padding: CGFloat = Spacing.medium, 
         backgroundColor: Color = .backgroundSecondary,
         @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.backgroundColor = backgroundColor
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(backgroundColor)
            .cornerRadius(CornerRadius.large)
            .shadow(color: ShadowStyle.small.color, 
                   radius: ShadowStyle.small.radius, 
                   x: ShadowStyle.small.x, 
                   y: ShadowStyle.small.y)
    }
}

// MARK: - Gradient Button
struct GradientButton: View {
    let title: String
    let icon: String?
    let action: () -> Void
    var gradient: LinearGradient = LinearGradient(
        colors: [.primaryBlue, .accentPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    @State private var isPressed = false
    
    init(title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.xSmall) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                }
                Text(title)
                    .font(Typography.headline)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.medium)
            .background(gradient)
            .cornerRadius(CornerRadius.medium)
            .scaleEffect(isPressed ? 0.95 : 1.0)
        }
        .onLongPressGesture(minimumDuration: .infinity, maximumDistance: .infinity,
                           pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

// MARK: - Modern Text Field
struct ModernTextField: View {
    let title: String
    @Binding var text: String
    var placeholder: String = ""
    var keyboardType: UIKeyboardType = .default
    var prefix: String? = nil
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xxSmall) {
            Text(title)
                .font(Typography.caption1)
                .foregroundColor(isFocused ? .primaryBlue : .textSecondary)
            
            HStack {
                if let prefix = prefix {
                    Text(prefix)
                        .font(Typography.body)
                        .foregroundColor(.textSecondary)
                }
                
                TextField(placeholder, text: $text)
                    .font(Typography.body)
                    .keyboardType(keyboardType)
                    .focused($isFocused)
            }
            .padding(Spacing.small)
            .background(Color.backgroundTertiary)
            .cornerRadius(CornerRadius.small)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.small)
                    .stroke(isFocused ? Color.primaryBlue : Color.clear, lineWidth: 2)
            )
        }
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    let subtitle: String?
    let icon: String?
    
    init(title: String, subtitle: String? = nil, icon: String? = nil) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
    }
    
    var body: some View {
        HStack(spacing: Spacing.small) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(.primaryBlue)
                    .frame(width: 32, height: 32)
            }
            
            VStack(alignment: .leading, spacing: Spacing.xxxSmall) {
                Text(title)
                    .font(Typography.title3)
                    .foregroundColor(.textPrimary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(Typography.footnote)
                        .foregroundColor(.textSecondary)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, Spacing.xSmall)
    }
}

// MARK: - Progress Indicator
struct TaxProgressView: View {
    let progress: Double
    let title: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xSmall) {
            HStack {
                Text(title)
                    .font(Typography.caption1)
                    .foregroundColor(.textSecondary)
                
                Spacer()
                
                Text("\(Int(progress * 100))%")
                    .font(Typography.caption1)
                    .foregroundColor(.textSecondary)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.backgroundTertiary)
                        .frame(height: 8)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: [.primaryBlue, .accentPurple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * progress, height: 8)
                        .animation(.spring(), value: progress)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - Info Card
struct InfoCard: View {
    let title: String
    let value: String
    let subtitle: String?
    let icon: String
    let color: Color
    
    var body: some View {
        HStack(spacing: Spacing.medium) {
            Circle()
                .fill(color.opacity(0.15))
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 24))
                        .foregroundColor(color)
                )
            
            VStack(alignment: .leading, spacing: Spacing.xxxSmall) {
                Text(title)
                    .font(Typography.caption1)
                    .foregroundColor(.textSecondary)
                
                Text(value)
                    .font(Typography.title2)
                    .foregroundColor(.textPrimary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(Typography.caption2)
                        .foregroundColor(.textTertiary)
                }
            }
            
            Spacer()
        }
        .padding(Spacing.medium)
        .background(Color.backgroundSecondary)
        .cornerRadius(CornerRadius.large)
    }
}

// MARK: - Toggle Card
struct ToggleCard: View {
    let title: String
    let subtitle: String?
    @Binding var isOn: Bool
    
    var body: some View {
        CardView {
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xxxSmall) {
                    Text(title)
                        .font(Typography.headline)
                        .foregroundColor(.textPrimary)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(Typography.footnote)
                            .foregroundColor(.textSecondary)
                    }
                }
                
                Spacer()
                
                Toggle("", isOn: $isOn)
                    .labelsHidden()
                    .tint(.primaryBlue)
            }
        }
    }
}