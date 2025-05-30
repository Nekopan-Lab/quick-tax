import SwiftUI

struct AmountInputField: View {
    let title: String
    @Binding var amount: String
    var placeholder: String = "0"
    var showCents: Bool = false
    
    @FocusState private var isFocused: Bool
    @State private var isAnimating = false
    
    var formattedAmount: String {
        let cleanAmount = amount.replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "$", with: "")
        
        if let value = Double(cleanAmount) {
            return NumberFormatter.currencyWholeNumber.string(from: NSNumber(value: value)) ?? "$0"
        }
        return ""
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xxSmall) {
            Text(title)
                .font(Typography.caption1)
                .foregroundColor(isFocused ? .primaryBlue : .textSecondary)
                .scaleEffect(isFocused ? 1.05 : 1.0)
                .animation(.spring(response: 0.3), value: isFocused)
            
            HStack(spacing: Spacing.xSmall) {
                Text("$")
                    .font(Typography.title2)
                    .foregroundColor(.textSecondary)
                
                TextField(placeholder, text: $amount)
                    .font(Typography.title2)
                    .keyboardType(.numberPad)
                    .focused($isFocused)
                    .onChange(of: amount) { newValue in
                        // Remove non-numeric characters
                        let filtered = newValue.filter { $0.isNumber }
                        if filtered != newValue {
                            amount = filtered
                        }
                    }
                
                if !amount.isEmpty && isFocused {
                    Button(action: {
                        amount = ""
                        withAnimation(.spring()) {
                            isAnimating = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            isAnimating = false
                        }
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.textTertiary)
                            .scaleEffect(isAnimating ? 1.2 : 1.0)
                    }
                }
            }
            .padding(Spacing.medium)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.medium)
                    .fill(isFocused ? Color.primaryBlue.opacity(0.05) : Color.backgroundTertiary)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.medium)
                            .stroke(isFocused ? Color.primaryBlue : Color.clear, lineWidth: 2)
                    )
            )
            .animation(.spring(response: 0.3), value: isFocused)
            
            if !amount.isEmpty && !isFocused {
                Text(formattedAmount)
                    .font(Typography.caption1)
                    .foregroundColor(.primaryBlue)
                    .transition(.scale.combined(with: .opacity))
            }
        }
    }
}

// MARK: - Compact Amount Field for Lists
struct CompactAmountField: View {
    let title: String
    @Binding var amount: String
    var icon: String? = nil
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: Spacing.small) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.primaryBlue)
                    .frame(width: 28)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Typography.caption2)
                    .foregroundColor(.textSecondary)
                
                HStack(spacing: 4) {
                    Text("$")
                        .font(Typography.body)
                        .foregroundColor(.textSecondary)
                    
                    TextField("0", text: $amount)
                        .font(Typography.body)
                        .keyboardType(.numberPad)
                        .focused($isFocused)
                }
            }
            
            Spacer()
            
            if !amount.isEmpty {
                Text(formatAmount(amount))
                    .font(Typography.headline)
                    .foregroundColor(.primaryBlue)
            }
        }
        .padding(Spacing.small)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.small)
                .fill(isFocused ? Color.primaryBlue.opacity(0.05) : Color.backgroundTertiary)
        )
    }
    
    private func formatAmount(_ amount: String) -> String {
        let cleanAmount = amount.replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "$", with: "")
        
        if let value = Double(cleanAmount) {
            return NumberFormatter.currencyWholeNumber.string(from: NSNumber(value: value)) ?? "$0"
        }
        return "$0"
    }
}