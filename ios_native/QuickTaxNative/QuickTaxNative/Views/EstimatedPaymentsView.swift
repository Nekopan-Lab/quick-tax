import SwiftUI

struct EstimatedPaymentsView: View {
    @EnvironmentObject var taxStore: TaxStore
    @Environment(\.selectedTab) var selectedTab
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Federal Payments Card
                    federalPaymentsCard
                    
                    // California Payments Card
                    if taxStore.includeCaliforniaTax {
                        californiaPaymentsCard
                    }
                    
                    // Payment Summary
                    paymentSummaryCard
                    
                    // Info Card
                    infoCard
                    
                    // Navigation buttons
                    NavigationButtons(currentTab: 3)
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarHidden(true)
        }
        .onChange(of: taxStore.estimatedPayments) { _ in
            taxStore.saveData()
        }
    }
    
    var paymentSummaryCard: some View {
        VStack(spacing: 16) {
            Text("Total Payments Made")
                .font(.headline)
            
            HStack(spacing: 30) {
                VStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "flag.fill")
                            .font(.caption)
                            .foregroundColor(.emeraldGreen)
                        Text("Federal")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: totalFederalPayments())) ?? "$0")
                        .font(.title3)
                        .fontWeight(.semibold)
                }
                
                if taxStore.includeCaliforniaTax {
                    VStack(spacing: 8) {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .font(.caption)
                                .foregroundColor(.goldAccent)
                            Text("California")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: totalCaliforniaPayments())) ?? "$0")
                            .font(.title3)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(16)
    }
    
    var federalPaymentsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Label("Federal Estimated Tax Payments", systemImage: "building.columns")
                    .font(.headline)
                Spacer()
            }
            
            VStack(spacing: 12) {
                PaymentRow(
                    quarter: "Q1",
                    dueDate: "Apr 15, 2025",
                    amount: $taxStore.estimatedPayments.federalQ1,
                    color: .emeraldGreen
                )
                
                PaymentRow(
                    quarter: "Q2",
                    dueDate: "Jun 16, 2025",
                    amount: $taxStore.estimatedPayments.federalQ2,
                    color: .emeraldGreen
                )
                
                PaymentRow(
                    quarter: "Q3",
                    dueDate: "Sep 15, 2025",
                    amount: $taxStore.estimatedPayments.federalQ3,
                    color: .emeraldGreen
                )
                
                PaymentRow(
                    quarter: "Q4",
                    dueDate: "Jan 15, 2026",
                    amount: $taxStore.estimatedPayments.federalQ4,
                    color: .emeraldGreen
                )
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    var californiaPaymentsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Label("California Estimated Tax Payments", systemImage: "star.circle")
                    .font(.headline)
                Spacer()
            }
            
            VStack(spacing: 12) {
                PaymentRow(
                    quarter: "Q1",
                    dueDate: "Apr 15, 2025",
                    percentage: "30%",
                    amount: $taxStore.estimatedPayments.californiaQ1,
                    color: .goldAccent
                )
                
                PaymentRow(
                    quarter: "Q2",
                    dueDate: "Jun 16, 2025",
                    percentage: "40%",
                    amount: $taxStore.estimatedPayments.californiaQ2,
                    color: .goldAccent
                )
                
                PaymentRow(
                    quarter: "Q4",
                    dueDate: "Jan 15, 2026",
                    percentage: "30%",
                    amount: $taxStore.estimatedPayments.californiaQ4,
                    color: .goldAccent
                )
            }
            
            HStack {
                Image(systemName: "info.circle")
                    .foregroundColor(.goldAccent)
                Text("California requires 3 payments (no Q3 payment)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(10)
            .background(Color.goldAccent.opacity(0.1))
            .cornerRadius(8)
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    var infoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Payment Guidelines", systemImage: "lightbulb")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 8) {
                BulletPoint(text: "Enter payments you've already made for the 2025 tax year", icon: "checkmark.circle")
                BulletPoint(text: "Payments reduce your tax liability or increase your refund", icon: "minus.circle")
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    func totalFederalPayments() -> Decimal {
        var total: Decimal = 0
        total += taxStore.estimatedPayments.federalQ1.toDecimal() ?? 0
        total += taxStore.estimatedPayments.federalQ2.toDecimal() ?? 0
        total += taxStore.estimatedPayments.federalQ3.toDecimal() ?? 0
        total += taxStore.estimatedPayments.federalQ4.toDecimal() ?? 0
        return total
    }
    
    func totalCaliforniaPayments() -> Decimal {
        var total: Decimal = 0
        total += taxStore.estimatedPayments.californiaQ1.toDecimal() ?? 0
        total += taxStore.estimatedPayments.californiaQ2.toDecimal() ?? 0
        total += taxStore.estimatedPayments.californiaQ4.toDecimal() ?? 0
        return total
    }
}

struct PaymentRow: View {
    let quarter: String
    let dueDate: String
    var percentage: String? = nil
    @Binding var amount: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(quarter)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        if let percentage = percentage {
                            Text("(\(percentage))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Text(dueDate)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                HStack {
                    Text("$")
                        .foregroundColor(.secondary)
                    TextField("0", text: $amount)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 100)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(UIColor.tertiarySystemFill))
                .cornerRadius(8)
            }
            
            // Visual indicator of payment amount
            if let value = amount.toDecimal(), value > 0 {
                GeometryReader { geometry in
                    Rectangle()
                        .fill(color.opacity(0.2))
                        .frame(width: min(geometry.size.width * CGFloat(truncating: NSDecimalNumber(decimal: value / 10000)), geometry.size.width), height: 4)
                        .cornerRadius(2)
                }
                .frame(height: 4)
            }
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .cornerRadius(10)
    }
}

struct BulletPoint: View {
    let text: String
    let icon: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    EstimatedPaymentsView()
        .environmentObject(TaxStore())
}