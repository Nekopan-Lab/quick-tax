import SwiftUI

struct SummaryView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var taxResult: TaxCalculationResult?
    @State private var isCalculating = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                if isCalculating {
                    ProgressView("Calculating...")
                        .padding()
                } else if let result = taxResult {
                    VStack(spacing: 20) {
                        // Tax Overview Cards
                        HStack(spacing: 16) {
                            TaxOverviewCard(
                                title: "Federal Tax",
                                amount: result.federalTax.owedOrRefund,
                                isRefund: result.federalTax.owedOrRefund < 0,
                                effectiveRate: result.federalTax.effectiveRate
                            )
                            
                            if let californiaTax = result.californiaTax {
                                TaxOverviewCard(
                                    title: "California Tax",
                                    amount: californiaTax.owedOrRefund,
                                    isRefund: californiaTax.owedOrRefund < 0,
                                    effectiveRate: californiaTax.effectiveRate
                                )
                            }
                        }
                        .padding(.horizontal)
                        
                        // Income Summary
                        SummarySection(title: "Income Summary") {
                            SummaryRow(label: "Total Income", value: result.displayTotalIncome)
                        }
                        
                        // Federal Tax Details
                        FederalTaxDetailsView(federalTax: result.federalTax)
                        
                        // California Tax Details
                        if let californiaTax = result.californiaTax {
                            CaliforniaTaxDetailsView(californiaTax: californiaTax)
                        }
                        
                        // Estimated Payment Suggestions
                        EstimatedPaymentSuggestionsView(taxResult: result)
                    }
                    .padding(.vertical)
                } else {
                    VStack(spacing: 16) {
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 60))
                            .foregroundColor(.secondary)
                        
                        Text("Enter your income and deduction information to see your tax calculation")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                            .padding(.horizontal)
                    }
                    .padding(.top, 100)
                }
            }
            .navigationTitle("Tax Summary")
            .onAppear {
                calculateTaxes()
            }
            .onChange(of: taxStore.userIncome) { _ in calculateTaxes() }
            .onChange(of: taxStore.spouseIncome) { _ in calculateTaxes() }
            .onChange(of: taxStore.deductions) { _ in calculateTaxes() }
            .onChange(of: taxStore.estimatedPayments) { _ in calculateTaxes() }
            .onChange(of: taxStore.filingStatus) { _ in calculateTaxes() }
            .onChange(of: taxStore.includeCaliforniaTax) { _ in calculateTaxes() }
        }
    }
    
    func calculateTaxes() {
        isCalculating = true
        
        // Simulate async calculation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.taxResult = TaxOrchestrator.calculateTaxes(store: taxStore)
            self.isCalculating = false
        }
    }
}

struct TaxOverviewCard: View {
    let title: String
    let amount: Decimal
    let isRefund: Bool
    let effectiveRate: Decimal
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(isRefund ? "Refund" : "Owed")
                .font(.headline)
                .foregroundColor(isRefund ? .green : .orange)
            
            Text(NumberFormatter.currencyWholeNumber.string(from: abs(amount) as NSNumber) ?? "$0")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Effective Rate: \(NumberFormatter.percentage.string(from: (effectiveRate * 100) as NSNumber) ?? "0%")")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct SummarySection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .padding(.horizontal)
            
            VStack(spacing: 8) {
                content
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
            .padding(.horizontal)
        }
    }
}

struct SummaryRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

struct FederalTaxDetailsView: View {
    let federalTax: FederalTaxResult
    @State private var showBrackets = false
    
    var body: some View {
        SummarySection(title: "Federal Tax Details") {
            SummaryRow(label: "Adjusted Gross Income", value: federalTax.displayTaxableIncome)
            SummaryRow(label: "Deduction (\(federalTax.deduction.type.displayName))", value: federalTax.deduction.displayAmount)
            SummaryRow(label: "Taxable Income", value: federalTax.displayTaxableIncome)
            
            Divider()
            
            SummaryRow(label: "Ordinary Income Tax", value: NumberFormatter.currencyWholeNumber.string(from: federalTax.ordinaryIncomeTax as NSNumber) ?? "$0")
            SummaryRow(label: "Capital Gains Tax", value: NumberFormatter.currencyWholeNumber.string(from: federalTax.capitalGainsTax as NSNumber) ?? "$0")
            SummaryRow(label: "Total Tax", value: federalTax.displayTotalTax)
            
            Button(action: { showBrackets.toggle() }) {
                HStack {
                    Text("View Tax Brackets")
                    Spacer()
                    Image(systemName: showBrackets ? "chevron.up" : "chevron.down")
                }
                .foregroundColor(.accentColor)
            }
            
            if showBrackets {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ordinary Income Brackets")
                        .font(.caption)
                        .fontWeight(.semibold)
                    
                    ForEach(federalTax.ordinaryTaxBrackets, id: \.bracket.min) { detail in
                        HStack {
                            Text("\(detail.bracket.displayRate) on \(detail.displayTaxableAmount)")
                                .font(.caption)
                            Spacer()
                            Text(detail.displayTax)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                    }
                    
                    if !federalTax.capitalGainsBrackets.isEmpty {
                        Text("Capital Gains Brackets")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .padding(.top, 8)
                        
                        ForEach(federalTax.capitalGainsBrackets, id: \.bracket.min) { detail in
                            HStack {
                                Text("\(detail.bracket.displayRate) on \(detail.displayTaxableAmount)")
                                    .font(.caption)
                                Spacer()
                                Text(detail.displayTax)
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                }
                .padding(.top, 8)
            }
        }
    }
}

struct CaliforniaTaxDetailsView: View {
    let californiaTax: CaliforniaTaxResult
    @State private var showBrackets = false
    
    var body: some View {
        SummarySection(title: "California Tax Details") {
            SummaryRow(label: "Adjusted Gross Income", value: californiaTax.displayTaxableIncome)
            SummaryRow(label: "Deduction (\(californiaTax.deduction.type.displayName))", value: californiaTax.deduction.displayAmount)
            SummaryRow(label: "Taxable Income", value: californiaTax.displayTaxableIncome)
            
            Divider()
            
            SummaryRow(label: "Base Tax", value: NumberFormatter.currencyWholeNumber.string(from: californiaTax.baseTax as NSNumber) ?? "$0")
            if californiaTax.mentalHealthTax > 0 {
                SummaryRow(label: "Mental Health Tax", value: NumberFormatter.currencyWholeNumber.string(from: californiaTax.mentalHealthTax as NSNumber) ?? "$0")
            }
            SummaryRow(label: "Total Tax", value: californiaTax.displayTotalTax)
            
            Button(action: { showBrackets.toggle() }) {
                HStack {
                    Text("View Tax Brackets")
                    Spacer()
                    Image(systemName: showBrackets ? "chevron.up" : "chevron.down")
                }
                .foregroundColor(.accentColor)
            }
            
            if showBrackets {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(californiaTax.taxBrackets, id: \.bracket.min) { detail in
                        HStack {
                            Text("\(detail.bracket.displayRate) on \(detail.displayTaxableAmount)")
                                .font(.caption)
                            Spacer()
                            Text(detail.displayTax)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                    }
                }
                .padding(.top, 8)
            }
        }
    }
}

struct EstimatedPaymentSuggestionsView: View {
    let taxResult: TaxCalculationResult
    @EnvironmentObject var taxStore: TaxStore
    
    var suggestions: (federal: [EstimatedPaymentSuggestion], california: [EstimatedPaymentSuggestion]) {
        TaxOrchestrator.calculateEstimatedPaymentSuggestions(
            taxResult: taxResult,
            estimatedPayments: taxStore.estimatedPayments,
            includeCaliforniaTax: taxStore.includeCaliforniaTax
        )
    }
    
    var body: some View {
        VStack(spacing: 16) {
            if !suggestions.federal.isEmpty {
                EstimatedPaymentSectionView(
                    title: "Federal Estimated Payment Schedule",
                    suggestions: suggestions.federal,
                    showAllPaid: taxResult.federalTax.owedOrRefund <= 0
                )
            }
            
            if !suggestions.california.isEmpty {
                EstimatedPaymentSectionView(
                    title: "California Estimated Payment Schedule",
                    suggestions: suggestions.california,
                    showAllPaid: taxResult.californiaTax?.owedOrRefund ?? 0 <= 0
                )
            }
        }
    }
}

struct EstimatedPaymentSectionView: View {
    let title: String
    let suggestions: [EstimatedPaymentSuggestion]
    let showAllPaid: Bool
    
    var body: some View {
        SummarySection(title: title) {
            if showAllPaid {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("All payments made or you have a refund")
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 8)
            } else {
                ForEach(suggestions) { suggestion in
                    EstimatedPaymentRow(suggestion: suggestion)
                }
            }
        }
    }
}

struct EstimatedPaymentRow: View {
    let suggestion: EstimatedPaymentSuggestion
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(suggestion.quarter)
                    .fontWeight(.medium)
                Text(suggestion.displayDueDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if suggestion.isPaid {
                Label("Paid", systemImage: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.caption)
            } else if suggestion.isPastDue {
                Text("Past Due")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                Text(suggestion.displayAmount)
                    .fontWeight(.medium)
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
        .background(backgroundColor)
    }
    
    var backgroundColor: Color {
        if suggestion.isPaid {
            return Color.green.opacity(0.1)
        } else if suggestion.isPastDue {
            return Color.gray.opacity(0.1)
        } else {
            return Color.blue.opacity(0.1)
        }
    }
}

#Preview {
    SummaryView()
        .environmentObject(TaxStore())
}