import SwiftUI

struct NavigationButtons: View {
    @Environment(\.selectedTab) var selectedTab
    let currentTab: Int
    
    var body: some View {
        HStack(spacing: 16) {
            // Previous button
            Button(action: {
                if currentTab > 0 {
                    selectedTab.wrappedValue = currentTab - 1
                }
            }) {
                HStack {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 14, weight: .medium))
                    Text("Previous")
                        .font(.system(size: 16, weight: .medium))
                }
                .foregroundColor(currentTab > 0 ? .emeraldGreen : .secondary)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(currentTab > 0 ? Color.emeraldGreen.opacity(0.1) : Color(UIColor.tertiarySystemFill))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(currentTab > 0 ? Color.emeraldGreen.opacity(0.3) : Color.clear, lineWidth: 1)
                )
            }
            .disabled(currentTab <= 0)
            
            Spacer()
            
            // Next button (hidden on Summary page)
            if currentTab < 4 {
                Button(action: {
                    selectedTab.wrappedValue = currentTab + 1
                }) {
                    HStack {
                        Text("Next")
                            .font(.system(size: 16, weight: .medium))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.buttonPrimary)
                    )
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 16)
    }
}

#Preview {
    NavigationButtons(currentTab: 1)
        .environment(\.selectedTab, .constant(1))
}