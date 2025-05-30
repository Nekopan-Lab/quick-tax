import SwiftUI

struct SummaryView: View {
    @EnvironmentObject var taxStore: TaxStore
    @Environment(\.selectedTab) var selectedTab
    @State private var taxResult: TaxCalculationResult?
    @State private var isCalculating = false
    @State private var expandedSections = Set<String>()
    @State private var expandOrdinaryIncomeTax = false
    @State private var expandCapitalGainsTax = false
    @State private var expandCABaseTax = false
    @State private var expandMentalHealthTax = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                if isCalculating {
                    VStack(spacing: 20) {
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Calculating your taxes...")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(40)
                } else if let result = taxResult {
                    VStack(spacing: 20) {
                        // Tax Breakdown Section
                        taxBreakdownSection(result: result)
                        
                        // Estimated Tax Payments Section
                        estimatedPaymentsSection(result: result)
                        
                        // Navigation buttons
                        NavigationButtons(currentTab: 4)
                    }
                    .padding()
                } else {
                    VStack(spacing: 20) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.warning)
                        
                        Text("Complete Setup Required")
                            .font(.headline)
                        
                        Text("Please complete the Tax Information and other steps to see your tax calculation summary.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(40)
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarHidden(true)
        }
        .onAppear {
            calculateTaxes()
        }
        .onChange(of: taxStore.filingStatus) { _ in calculateTaxes() }
        .onChange(of: taxStore.includeCaliforniaTax) { _ in calculateTaxes() }
        .onChange(of: taxStore.userIncome) { _ in calculateTaxes() }
        .onChange(of: taxStore.spouseIncome) { _ in calculateTaxes() }
        .onChange(of: taxStore.deductions) { _ in calculateTaxes() }
        .onChange(of: taxStore.estimatedPayments) { _ in calculateTaxes() }
    }
    
    // MARK: - Tax Owed Cards
    func taxOwedCards(result: TaxCalculationResult) -> some View {
        VStack(spacing: 12) {
            // Federal Tax Card
            federalTaxOwedCard(result: result)
            
            // California Tax Card (if selected)
            if taxStore.includeCaliforniaTax, let caTax = result.californiaTax {
                californiaTaxOwedCard(caTax: caTax)
            }
        }
    }
    
    func federalTaxOwedCard(result: TaxCalculationResult) -> some View {
        let federalOwed = result.federalTax.owedOrRefund
        
        return VStack(spacing: 12) {
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.emeraldGreen)
                Text("Federal Tax (IRS)")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if federalOwed > 0 {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: federalOwed)) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.error)
                        Text("Owed")
                            .font(.caption)
                            .foregroundColor(.error)
                    } else {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(federalOwed))) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.success)
                        Text("Overpaid")
                            .font(.caption)
                            .foregroundColor(.success)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Tax Year \(taxStore.taxYear.displayName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(federalOwed > 0 ? Color.error.opacity(0.3) : Color.success.opacity(0.3), lineWidth: 2)
        )
        .cornerRadius(12)
    }
    
    func californiaTaxOwedCard(caTax: CaliforniaTaxResult) -> some View {
        let caOwed = caTax.owedOrRefund
        
        return VStack(spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.goldAccent)
                Text("California Tax (FTB)")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if caOwed > 0 {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caOwed)) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.error)
                        Text("Owed")
                            .font(.caption)
                            .foregroundColor(.error)
                    } else {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(caOwed))) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.success)
                        Text("Overpaid")
                            .font(.caption)
                            .foregroundColor(.success)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Tax Year \(taxStore.taxYear.displayName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(caOwed > 0 ? Color.error.opacity(0.3) : Color.success.opacity(0.3), lineWidth: 2)
        )
        .cornerRadius(12)
    }
    
    // MARK: - Tax Breakdown Section
    func taxBreakdownSection(result: TaxCalculationResult) -> some View {
        VStack(spacing: 16) {
            HStack {
                Text("Tax Calculation Breakdown")
                    .font(.headline)
                Spacer()
            }
            
            // Income and Tax Rate Summary
            VStack(spacing: 12) {
                HStack {
                    Text("Total Income")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.totalIncome)) ?? "$0")
                        .fontWeight(.semibold)
                }
                
                Divider()
                
                // Combined Effective Tax Rate
                HStack {
                    Text("Combined Effective Rate")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    let combinedRate = (result.federalTax.totalTax + (result.californiaTax?.totalTax ?? 0)) / result.totalIncome * 100
                    Text("\(String(format: "%.2f", NSDecimalNumber(decimal: combinedRate).doubleValue))%")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.emeraldGreen)
                }
            }
            .padding()
            .background(Color(UIColor.tertiarySystemFill))
            .cornerRadius(8)
            
            // Federal breakdown card
            federalBreakdownCard(result: result)
            
            // California breakdown card (if selected)
            if taxStore.includeCaliforniaTax, let caTax = result.californiaTax {
                californiaBreakdownCard(caTax: caTax)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    func federalBreakdownCard(result: TaxCalculationResult) -> some View {
        let federalWithholdings = calculateFederalWithholdings()
        let federalQ1 = taxStore.estimatedPayments.federalQ1.toDecimal() ?? 0
        let federalQ2 = taxStore.estimatedPayments.federalQ2.toDecimal() ?? 0
        let federalQ3 = taxStore.estimatedPayments.federalQ3.toDecimal() ?? 0
        let federalQ4 = taxStore.estimatedPayments.federalQ4.toDecimal() ?? 0
        let federalPaid = federalQ1 + federalQ2 + federalQ3 + federalQ4
        let owed = result.federalTax.owedOrRefund
        
        return VStack(alignment: .leading, spacing: 12) {
            federalBreakdownHeader
            federalBreakdownDetails(result: result, withholdings: federalWithholdings, paid: federalPaid, owed: owed)
        }
        .padding()
        .background(Color.emeraldGreen.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.emeraldGreen.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    var federalBreakdownHeader: some View {
        HStack {
            Image(systemName: "flag.fill")
                .foregroundColor(.emeraldGreen)
            Text("Federal Tax Details (IRS)")
                .font(.subheadline)
                .fontWeight(.semibold)
            Spacer()
        }
    }
    
    func federalBreakdownDetails(result: TaxCalculationResult, withholdings: Decimal, paid: Decimal, owed: Decimal) -> some View {
        VStack(spacing: 6) {
            HStack {
                Text("Tax Liability")
                    .font(.subheadline)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.totalTax)) ?? "$0")
                    .fontWeight(.semibold)
            }
            
            HStack {
                Text("Effective Tax Rate")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(String(format: "%.2f", NSDecimalNumber(decimal: result.federalTax.effectiveRate * 100).doubleValue))%")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
            }
            
            // Show tax component breakdowns
            if result.federalTax.ordinaryIncomeTax > 0 {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("• Ordinary Income Tax")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.ordinaryIncomeTax)) ?? "$0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: { expandOrdinaryIncomeTax.toggle() }) {
                        HStack {
                            Text("  View calculation details")
                                .font(.caption)
                                .foregroundColor(.emeraldGreen)
                            Image(systemName: expandOrdinaryIncomeTax ? "chevron.up" : "chevron.down")
                                .font(.caption2)
                                .foregroundColor(.emeraldGreen)
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if expandOrdinaryIncomeTax {
                        ordinaryIncomeTaxDetails(result: result)
                            .padding(.top, 4)
                    }
                }
                .padding(.top, 8)
            }
            
            if result.federalTax.capitalGainsTax > 0 {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("• Long-Term Capital Gains Tax")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.capitalGainsTax)) ?? "$0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: { expandCapitalGainsTax.toggle() }) {
                        HStack {
                            Text("  View calculation details")
                                .font(.caption)
                                .foregroundColor(.emeraldGreen)
                            Image(systemName: expandCapitalGainsTax ? "chevron.up" : "chevron.down")
                                .font(.caption2)
                                .foregroundColor(.emeraldGreen)
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if expandCapitalGainsTax {
                        capitalGainsTaxDetails(result: result)
                            .padding(.top, 4)
                    }
                }
                .padding(.top, 8)
            }
            
            HStack {
                Text("Total Withholdings")
                    .font(.subheadline)
                Spacer()
                Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: withholdings)) ?? "$0")")
                    .fontWeight(.semibold)
            }
            
            HStack {
                Text("Estimated Payments Made")
                    .font(.subheadline)
                Spacer()
                Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: paid)) ?? "$0")")
                    .fontWeight(.semibold)
            }
            
            Divider()
            
            HStack {
                Text(owed > 0 ? "Owed" : "Overpaid")
                    .fontWeight(.semibold)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(owed))) ?? "$0")
                    .fontWeight(.bold)
                    .foregroundColor(owed > 0 ? .red : .green)
            }
        }
    }
    
    func californiaBreakdownCard(caTax: CaliforniaTaxResult) -> some View {
        let californiaWithholdings = calculateCaliforniaWithholdings()
        let caQ1 = taxStore.estimatedPayments.californiaQ1.toDecimal() ?? 0
        let caQ2 = taxStore.estimatedPayments.californiaQ2.toDecimal() ?? 0
        let caQ4 = taxStore.estimatedPayments.californiaQ4.toDecimal() ?? 0
        let californiaPaid = caQ1 + caQ2 + caQ4
        let owed = caTax.owedOrRefund
        
        return VStack(alignment: .leading, spacing: 12) {
            californiaBreakdownHeader
            californiaBreakdownDetails(caTax: caTax, withholdings: californiaWithholdings, paid: californiaPaid, owed: owed)
        }
        .padding()
        .background(Color.goldAccent.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.goldAccent.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    var californiaBreakdownHeader: some View {
        HStack {
            Image(systemName: "star.fill")
                .foregroundColor(.goldAccent)
            Text("California Tax Details (FTB)")
                .font(.subheadline)
                .fontWeight(.semibold)
            Spacer()
        }
    }
    
    func californiaBreakdownDetails(caTax: CaliforniaTaxResult, withholdings: Decimal, paid: Decimal, owed: Decimal) -> some View {
        VStack(spacing: 6) {
            HStack {
                Text("Tax Liability")
                    .font(.subheadline)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.totalTax)) ?? "$0")
                    .fontWeight(.semibold)
            }
            
            HStack {
                Text("Effective Tax Rate")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(String(format: "%.2f", NSDecimalNumber(decimal: caTax.effectiveRate * 100).doubleValue))%")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
            }
            
            // Show tax component breakdowns
            if caTax.baseTax > 0 {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("• Base CA Tax")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.baseTax)) ?? "$0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: { expandCABaseTax.toggle() }) {
                        HStack {
                            Text("  View calculation details")
                                .font(.caption)
                                .foregroundColor(.emeraldGreen)
                            Image(systemName: expandCABaseTax ? "chevron.up" : "chevron.down")
                                .font(.caption2)
                                .foregroundColor(.emeraldGreen)
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if expandCABaseTax, let taxResult = taxResult {
                        californiaBaseTaxDetails(caTax: caTax, totalIncome: taxResult.totalIncome)
                            .padding(.top, 4)
                    }
                }
                .padding(.top, 8)
            }
            
            if caTax.mentalHealthTax > 0 {
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("• Mental Health Tax")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.mentalHealthTax)) ?? "$0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: { expandMentalHealthTax.toggle() }) {
                        HStack {
                            Text("  View calculation details")
                                .font(.caption)
                                .foregroundColor(.emeraldGreen)
                            Image(systemName: expandMentalHealthTax ? "chevron.up" : "chevron.down")
                                .font(.caption2)
                                .foregroundColor(.emeraldGreen)
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if expandMentalHealthTax {
                        mentalHealthTaxDetails(caTax: caTax)
                            .padding(.top, 4)
                    }
                }
                .padding(.top, 8)
            }
            
            HStack {
                Text("Total Withholdings")
                    .font(.subheadline)
                Spacer()
                Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: withholdings)) ?? "$0")")
                    .fontWeight(.semibold)
            }
            
            HStack {
                Text("Estimated Payments Made")
                    .font(.subheadline)
                Spacer()
                Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: paid)) ?? "$0")")
                    .fontWeight(.semibold)
            }
            
            Divider()
            
            HStack {
                Text(owed > 0 ? "Owed" : "Overpaid")
                    .fontWeight(.semibold)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(owed))) ?? "$0")
                    .fontWeight(.bold)
                    .foregroundColor(owed > 0 ? .red : .green)
            }
        }
    }
    
    // MARK: - Estimated Payments Section
    func estimatedPaymentsSection(result: TaxCalculationResult) -> some View {
        VStack(spacing: 16) {
            HStack {
                Text("Estimated Tax Payments")
                    .font(.headline)
                Spacer()
            }
            
            // Federal estimated payments
            federalEstimatedPaymentsCard(result: result)
            
            // California estimated payments (if selected)
            if taxStore.includeCaliforniaTax, let caTax = result.californiaTax {
                californiaEstimatedPaymentsCard(caTax: caTax)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    func federalEstimatedPaymentsCard(result: TaxCalculationResult) -> some View {
        let federalOwed = result.federalTax.owedOrRefund
        let paymentSuggestions = calculateFederalPaymentSuggestions(federalOwed: federalOwed)
        
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.emeraldGreen)
                Text("Federal Estimated Payments (IRS)")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if paymentSuggestions.allSatisfy({ $0.isPaid }) && federalOwed != 0 {
                allPaymentsMadeView(owed: federalOwed)
            } else {
                paymentScheduleView(paymentSuggestions: paymentSuggestions, owed: federalOwed)
            }
        }
        .padding()
        .background(Color.emeraldGreen.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.emeraldGreen.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    func allPaymentsMadeView(owed: Decimal) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("✅ All quarterly payments have been made.")
                .fontWeight(.medium)
            
            Text("Based on current data, you would \(owed > 0 ? "owe \(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: owed)) ?? "$0")" : "be refunded \(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(owed))) ?? "$0")") when filing taxes.")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text("This is an estimation only and not professional tax advice.")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.yellow.opacity(0.1))
        .cornerRadius(8)
    }
    
    func paymentScheduleView(paymentSuggestions: [PaymentSuggestion], owed: Decimal) -> some View {
        VStack(spacing: 8) {
            ForEach(paymentSuggestions, id: \.quarter) { payment in
                PaymentRowView(payment: payment)
            }
            
            if owed <= 0 && !paymentSuggestions.allSatisfy({ $0.isPaid }) {
                Text("No additional payments needed - you're on track for a refund.")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            }
        }
    }
    
    func californiaEstimatedPaymentsCard(caTax: CaliforniaTaxResult) -> some View {
        let caOwed = caTax.owedOrRefund
        let paymentSuggestions = calculateCaliforniaPaymentSuggestions(caOwed: caOwed)
        
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.goldAccent)
                Text("California Estimated Payments (FTB)")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if paymentSuggestions.allSatisfy({ $0.isPaid }) && caOwed != 0 {
                allPaymentsMadeView(owed: caOwed)
            } else {
                VStack(spacing: 8) {
                    paymentScheduleView(paymentSuggestions: paymentSuggestions, owed: caOwed)
                    
                    Text("California requires 3 payments (no Q3 payment)")
                        .font(.caption)
                        .foregroundColor(.goldAccent)
                        .padding(.top, 8)
                }
            }
        }
        .padding()
        .background(Color.goldAccent.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.goldAccent.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    // MARK: - Helper Functions
    func calculateTaxes() {
        isCalculating = true
        
        Task {
            let result = TaxOrchestrator.calculateTaxes(store: taxStore)
            
            await MainActor.run {
                self.taxResult = result
                self.isCalculating = false
            }
        }
    }
    
    func calculateFederalPaymentSuggestions(federalOwed: Decimal) -> [PaymentSuggestion] {
        // Calculate total estimated payments already made
        let fedQ1 = taxStore.estimatedPayments.federalQ1.toDecimal() ?? 0
        let fedQ2 = taxStore.estimatedPayments.federalQ2.toDecimal() ?? 0
        let fedQ3 = taxStore.estimatedPayments.federalQ3.toDecimal() ?? 0
        let fedQ4 = taxStore.estimatedPayments.federalQ4.toDecimal() ?? 0
        let federalPaid = fedQ1 + fedQ2 + fedQ3 + fedQ4
        
        // Total tax that needs to be paid via estimated payments
        let totalTaxForEstimatedPayments = federalOwed + federalPaid
        
        let q1Paid = taxStore.estimatedPayments.federalQ1.toDecimal() ?? 0
        let q2Paid = taxStore.estimatedPayments.federalQ2.toDecimal() ?? 0
        let q3Paid = taxStore.estimatedPayments.federalQ3.toDecimal() ?? 0
        let q4Paid = taxStore.estimatedPayments.federalQ4.toDecimal() ?? 0
        
        var cumulativePaid: Decimal = 0
        var suggestions: [PaymentSuggestion] = []
        
        // Q1 Payment
        let q1DueDate = dateFromString("April 15, 2025")
        let q1IsPastDue = q1DueDate <= Date()
        if q1Paid > 0 {
            cumulativePaid += q1Paid
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: q1Paid, isPaid: true, isPastDue: false))
        } else if q1IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let q1Amount = max(0, totalTaxForEstimatedPayments * 0.25 - cumulativePaid)
            cumulativePaid += q1Amount
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: q1Amount, isPaid: false, isPastDue: false))
        }
        
        // Q2 Payment
        let q2DueDate = dateFromString("June 16, 2025")
        let q2IsPastDue = q2DueDate <= Date()
        if q2Paid > 0 {
            cumulativePaid += q2Paid
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: q2Paid, isPaid: true, isPastDue: false))
        } else if q2IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let q2Amount = max(0, totalTaxForEstimatedPayments * 0.50 - cumulativePaid)
            cumulativePaid += q2Amount
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: q2Amount, isPaid: false, isPastDue: false))
        }
        
        // Q3 Payment
        let q3DueDate = dateFromString("September 15, 2025")
        let q3IsPastDue = q3DueDate <= Date()
        if q3Paid > 0 {
            cumulativePaid += q3Paid
            suggestions.append(PaymentSuggestion(quarter: "Q3", dueDate: "September 15, 2025", amount: q3Paid, isPaid: true, isPastDue: false))
        } else if q3IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q3", dueDate: "September 15, 2025", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let q3Amount = max(0, totalTaxForEstimatedPayments * 0.75 - cumulativePaid)
            cumulativePaid += q3Amount
            suggestions.append(PaymentSuggestion(quarter: "Q3", dueDate: "September 15, 2025", amount: q3Amount, isPaid: false, isPastDue: false))
        }
        
        // Q4 Payment
        let q4DueDate = dateFromString("January 15, 2026")
        let q4IsPastDue = q4DueDate <= Date()
        if q4Paid > 0 {
            cumulativePaid += q4Paid
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: q4Paid, isPaid: true, isPastDue: false))
        } else if q4IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let q4Amount = max(0, totalTaxForEstimatedPayments * 1.00 - cumulativePaid)
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: q4Amount, isPaid: false, isPastDue: false))
        }
        
        return suggestions
    }
    
    func calculateCaliforniaPaymentSuggestions(caOwed: Decimal) -> [PaymentSuggestion] {
        // Calculate total estimated payments already made
        let californiaPaid = (taxStore.estimatedPayments.californiaQ1.toDecimal() ?? 0) + 
                            (taxStore.estimatedPayments.californiaQ2.toDecimal() ?? 0) + 
                            (taxStore.estimatedPayments.californiaQ4.toDecimal() ?? 0)
        
        // Total tax that needs to be paid via estimated payments
        let totalTaxForEstimatedPayments = caOwed + californiaPaid
        
        let caQ1Paid = taxStore.estimatedPayments.californiaQ1.toDecimal() ?? 0
        let caQ2Paid = taxStore.estimatedPayments.californiaQ2.toDecimal() ?? 0
        let caQ4Paid = taxStore.estimatedPayments.californiaQ4.toDecimal() ?? 0
        
        var cumulativePaid: Decimal = 0
        var suggestions: [PaymentSuggestion] = []
        
        // Q1 Payment (30%)
        let caQ1DueDate = dateFromString("April 15, 2025")
        let caQ1IsPastDue = caQ1DueDate <= Date()
        if caQ1Paid > 0 {
            cumulativePaid += caQ1Paid
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: caQ1Paid, isPaid: true, isPastDue: false))
        } else if caQ1IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let caQ1Amount = max(0, totalTaxForEstimatedPayments * 0.30 - cumulativePaid)
            cumulativePaid += caQ1Amount
            suggestions.append(PaymentSuggestion(quarter: "Q1", dueDate: "April 15, 2025", amount: caQ1Amount, isPaid: false, isPastDue: false))
        }
        
        // Q2 Payment (70% cumulative)
        let caQ2DueDate = dateFromString("June 16, 2025")
        let caQ2IsPastDue = caQ2DueDate <= Date()
        if caQ2Paid > 0 {
            cumulativePaid += caQ2Paid
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: caQ2Paid, isPaid: true, isPastDue: false))
        } else if caQ2IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let caQ2Amount = max(0, totalTaxForEstimatedPayments * 0.70 - cumulativePaid)
            cumulativePaid += caQ2Amount
            suggestions.append(PaymentSuggestion(quarter: "Q2", dueDate: "June 16, 2025", amount: caQ2Amount, isPaid: false, isPastDue: false))
        }
        
        // Q4 Payment (100% cumulative)
        let caQ4DueDate = dateFromString("January 15, 2026")
        let caQ4IsPastDue = caQ4DueDate <= Date()
        if caQ4Paid > 0 {
            cumulativePaid += caQ4Paid
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: caQ4Paid, isPaid: true, isPastDue: false))
        } else if caQ4IsPastDue {
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: 0, isPaid: false, isPastDue: true))
        } else {
            let caQ4Amount = max(0, totalTaxForEstimatedPayments * 1.00 - cumulativePaid)
            suggestions.append(PaymentSuggestion(quarter: "Q4", dueDate: "January 15, 2026", amount: caQ4Amount, isPaid: false, isPastDue: false))
        }
        
        return suggestions
    }
    
    func isPastDue(_ dueDate: Date) -> Bool {
        return Date() > dueDate
    }
    
    func dateFromString(_ dateString: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.date(from: dateString) ?? Date()
    }
    
    func calculateFederalWithholdings() -> Decimal {
        let userYtdFederal = taxStore.userIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
        let spouseYtdFederal = taxStore.spouseIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
        
        // Calculate future federal withholdings based on income mode
        var userFutureFederal: Decimal = 0
        var spouseFutureFederal: Decimal = 0
        
        if taxStore.userIncome.incomeMode == .simple {
            userFutureFederal = taxStore.userIncome.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            // Calculate detailed mode withholdings for user
            userFutureFederal = calculateDetailedFederalWithholdings(for: taxStore.userIncome)
        }
        
        if taxStore.spouseIncome.incomeMode == .simple {
            spouseFutureFederal = taxStore.spouseIncome.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            // Calculate detailed mode withholdings for spouse
            spouseFutureFederal = calculateDetailedFederalWithholdings(for: taxStore.spouseIncome)
        }
        
        return userYtdFederal + spouseYtdFederal + userFutureFederal + spouseFutureFederal
    }
    
    func calculateCaliforniaWithholdings() -> Decimal {
        let userYtdState = taxStore.userIncome.ytdW2Income.stateWithhold.toDecimal() ?? 0
        let spouseYtdState = taxStore.spouseIncome.ytdW2Income.stateWithhold.toDecimal() ?? 0
        
        // Calculate future state withholdings based on income mode
        var userFutureState: Decimal = 0
        var spouseFutureState: Decimal = 0
        
        if taxStore.userIncome.incomeMode == .simple {
            userFutureState = taxStore.userIncome.futureIncome.stateWithhold.toDecimal() ?? 0
        } else {
            // Calculate detailed mode withholdings for user
            userFutureState = calculateDetailedStateWithholdings(for: taxStore.userIncome)
        }
        
        if taxStore.spouseIncome.incomeMode == .simple {
            spouseFutureState = taxStore.spouseIncome.futureIncome.stateWithhold.toDecimal() ?? 0
        } else {
            // Calculate detailed mode withholdings for spouse
            spouseFutureState = calculateDetailedStateWithholdings(for: taxStore.spouseIncome)
        }
        
        return userYtdState + spouseYtdState + userFutureState + spouseFutureState
    }
    
    // MARK: - Detailed Withholding Calculations
    
    func calculateDetailedFederalWithholdings(for income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        // Calculate paycheck withholdings
        let paycheckFederal = income.paycheckData.federalWithhold.toDecimal() ?? 0
        let paycheckCount = calculateRemainingPaychecks(
            frequency: income.paycheckData.frequency,
            nextDate: income.paycheckData.nextPaymentDate
        )
        total += paycheckFederal * Decimal(paycheckCount)
        
        // NOTE: We do NOT include past RSU vest withholding here
        // The web app only counts future income withholdings
        // total += income.rsuVestData.federalWithhold.toDecimal() ?? 0
        
        // Calculate future RSU vest withholdings
        for vest in income.futureRSUVests {
            if vest.date >= Date() {
                let shares = Decimal(string: vest.shares) ?? 0
                let price = Decimal(string: vest.expectedPrice) ?? 0
                let vestValue = shares * price
                
                if vestValue > 0 {
                    // Calculate withholding rate from most recent RSU vest data
                    let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
                    let rsuVestFederal = income.rsuVestData.federalWithhold.toDecimal() ?? 0
                    
                    if rsuVestWage > 0 {
                        let federalRate = rsuVestFederal / rsuVestWage
                        total += vestValue * federalRate
                    } else {
                        // Default to 24% federal withholding if no historical data
                        total += vestValue * Decimal(0.24)
                    }
                }
            }
        }
        
        return total
    }
    
    func calculateDetailedStateWithholdings(for income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        // Calculate paycheck withholdings
        let paycheckState = income.paycheckData.stateWithhold.toDecimal() ?? 0
        let paycheckCount = calculateRemainingPaychecks(
            frequency: income.paycheckData.frequency,
            nextDate: income.paycheckData.nextPaymentDate
        )
        total += paycheckState * Decimal(paycheckCount)
        
        // NOTE: We do NOT include past RSU vest withholding here
        // The web app only counts future income withholdings
        // total += income.rsuVestData.stateWithhold.toDecimal() ?? 0
        
        // Calculate future RSU vest withholdings
        for vest in income.futureRSUVests {
            if vest.date >= Date() {
                let shares = Decimal(string: vest.shares) ?? 0
                let price = Decimal(string: vest.expectedPrice) ?? 0
                let vestValue = shares * price
                
                if vestValue > 0 {
                    // Calculate withholding rate from most recent RSU vest data
                    let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
                    let rsuVestState = income.rsuVestData.stateWithhold.toDecimal() ?? 0
                    
                    if rsuVestWage > 0 {
                        let stateRate = rsuVestState / rsuVestWage
                        total += vestValue * stateRate
                    } else {
                        // Default to 10% state withholding if no historical data
                        total += vestValue * Decimal(0.10)
                    }
                }
            }
        }
        
        return total
    }
    
    private func calculateRemainingPaychecks(frequency: PayFrequency, nextDate: Date) -> Int {
        let calendar = Calendar.current
        let now = Date()
        let endOfYear = calendar.date(from: DateComponents(year: calendar.component(.year, from: now), month: 12, day: 31))!
        
        if nextDate > endOfYear {
            return 0
        }
        
        // Use proper date iteration logic like the web app and TaxOrchestrator
        var paychecksRemaining = 0
        var payDate = nextDate
        
        while payDate <= endOfYear {
            paychecksRemaining += 1
            
            switch frequency {
            case .biweekly:
                payDate = calendar.date(byAdding: .day, value: 14, to: payDate) ?? payDate
            case .monthly:
                payDate = calendar.date(byAdding: .month, value: 1, to: payDate) ?? payDate
            }
        }
        
        return paychecksRemaining
    }
    
    // MARK: - Tax Detail Views
    
    func ordinaryIncomeTaxDetails(result: TaxCalculationResult) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Income Components
            VStack(alignment: .leading, spacing: 3) {
                Text("Ordinary Income Components:")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                VStack(spacing: 1) {
                    // Render income components
                    ordinaryIncomeComponentRows(components: result.federalTax.incomeComponents)
                    
                    Divider()
                        .padding(.vertical, 2)
                    
                    // Total ordinary income
                    HStack {
                        Text("Total ordinary income")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.incomeComponents.totalOrdinaryIncome)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                    
                    // Less deduction
                    HStack {
                        Text("Less: \(result.federalTax.deduction.type == .standard ? "Standard" : "Itemized") deduction")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.deduction.amount)) ?? "$0")")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    // Ordinary taxable income
                    HStack {
                        Text("Ordinary taxable income")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.incomeComponents.ordinaryTaxableIncome)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(6)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(6)
            }
            
            // Tax Bracket Breakdown
            VStack(alignment: .leading, spacing: 3) {
                Text("Tax Bracket Breakdown:")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                // Tax brackets
                ForEach(Array(result.federalTax.ordinaryTaxBrackets.enumerated()), id: \.offset) { index, bracketDetail in
                    taxBracketRow(bracketDetail: bracketDetail, rateFormat: "%.0f")
                }
            }
        }
        .padding(6)
        .background(Color(UIColor.systemGray6))
        .cornerRadius(6)
    }
    
    func capitalGainsTaxDetails(result: TaxCalculationResult) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            let incomeComponents = result.federalTax.incomeComponents
            let ltcgForPreferentialRate = max(0, incomeComponents.longTermGains)
            let totalPreferentialIncome = ltcgForPreferentialRate + incomeComponents.qualifiedDividends
            
            if totalPreferentialIncome <= 0 {
                Text("No income eligible for preferential capital gains rates")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .italic()
            } else {
                // Income at preferential rates
                VStack(alignment: .leading, spacing: 4) {
                    if incomeComponents.longTermGains < 0 {
                        Text("Long-term capital losses: $\(NSDecimalNumber(decimal: abs(incomeComponents.longTermGains)).intValue.formatted()) (limited to $3,000 deduction)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    } else if incomeComponents.longTermGains > 0 {
                        HStack {
                            Text("Long-term capital gains:")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: incomeComponents.longTermGains)) ?? "$0")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if incomeComponents.qualifiedDividends > 0 {
                        HStack {
                            Text("Qualified dividends:")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: incomeComponents.qualifiedDividends)) ?? "$0")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Divider()
                        .padding(.vertical, 2)
                    
                    HStack {
                        Text("Total at preferential rates:")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: totalPreferentialIncome)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(8)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(6)
                
                // Capital Gains Tax Brackets
                if result.federalTax.capitalGainsBrackets.count > 0 {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Capital Gains Tax Bracket Breakdown:")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        ForEach(Array(result.federalTax.capitalGainsBrackets.enumerated()), id: \.offset) { index, bracketDetail in
                            taxBracketRow(bracketDetail: bracketDetail, rateFormat: "%.0f")
                        }
                    }
                }
                
                // Summary
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("Your total taxable income:")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.taxableIncome)) ?? "$0")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    HStack {
                        Text("Income at preferential rates:")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: totalPreferentialIncome)) ?? "$0")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    Divider()
                        .padding(.vertical, 2)
                    HStack {
                        Text("Tax on capital gains/qualified dividends:")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.capitalGainsTax)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(8)
                .background(Color(UIColor.systemGray5))
                .cornerRadius(6)
                .padding(.top, 4)
            }
        }
        .padding(8)
        .background(Color(UIColor.systemGray6))
        .cornerRadius(6)
    }
    
    func californiaBaseTaxDetails(caTax: CaliforniaTaxResult, totalIncome: Decimal) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // California Taxable Income
            VStack(alignment: .leading, spacing: 4) {
                Text("California Taxable Income:")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                VStack(spacing: 2) {
                    HStack {
                        Text("Total income")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: totalIncome)) ?? "$0")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Less: \(caTax.deduction.type == .standard ? "Standard" : "Itemized") deduction")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("-\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.deduction.amount)) ?? "$0")")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    Divider()
                        .padding(.vertical, 2)
                    
                    HStack {
                        Text("California taxable income")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.taxableIncome)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(8)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(6)
            }
            
            // Tax Bracket Breakdown
            VStack(alignment: .leading, spacing: 4) {
                Text("Tax Bracket Breakdown:")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                ForEach(Array(caTax.taxBrackets.enumerated()), id: \.offset) { index, bracketDetail in
                    taxBracketRow(bracketDetail: bracketDetail, rateFormat: "%.1f")
                }
            }
            
            Text("Note: California taxes all income types (including capital gains) at the same rates.")
                .font(.caption2)
                .foregroundColor(.secondary)
                .italic()
                .padding(.top, 4)
        }
        .padding(8)
        .background(Color(UIColor.systemGray6))
        .cornerRadius(6)
    }
    
    func mentalHealthTaxDetails(caTax: CaliforniaTaxResult) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Mental Health Tax Calculation")
                .font(.caption2)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            
            VStack(spacing: 4) {
                HStack {
                    Text("California taxable income:")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.taxableIncome)) ?? "$0")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Mental health tax threshold:")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$1,000,000")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Amount over threshold:")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: max(0, caTax.taxableIncome - 1_000_000))) ?? "$0")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .padding(.vertical, 2)
                
                HStack {
                    Text("Tax: 1% × $\(NSDecimalNumber(decimal: max(0, caTax.taxableIncome - 1_000_000)).intValue.formatted()) = ")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.mentalHealthTax)) ?? "$0")
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(8)
        .background(Color(UIColor.systemGray6))
        .cornerRadius(6)
    }
    
    // MARK: - Helper Views
    
    @ViewBuilder
    func ordinaryIncomeComponentRows(components: FederalIncomeComponents) -> some View {
        // Wages
        if components.wages > 0 {
            incomeComponentRow(label: "Wages (YTD + Future)", amount: components.wages)
        }
        
        // Non-qualified dividends
        if components.nonQualifiedDividends > 0 {
            incomeComponentRow(label: "Non-qualified dividends", amount: components.nonQualifiedDividends)
        }
        
        // Interest income
        if components.interestIncome > 0 {
            incomeComponentRow(label: "Interest income", amount: components.interestIncome)
        }
        
        // Short-term gains
        if components.shortTermGains > 0 {
            incomeComponentRow(label: "Short-term capital gains", amount: components.shortTermGains)
        }
        
        // Capital loss deduction
        if components.capitalLossDeduction < 0 {
            incomeComponentRow(label: "Capital loss deduction", amount: components.capitalLossDeduction, isNegative: true)
        }
    }
    
    func incomeComponentRow(label: String, amount: Decimal, isNegative: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Spacer()
            Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: amount)) ?? "$0")
                .font(.caption2)
                .foregroundColor(isNegative ? .red : .secondary)
        }
    }
    
    func taxBracketRow(bracketDetail: TaxBracketDetail, rateFormat: String) -> some View {
        let bracket = bracketDetail.bracket
        return VStack(alignment: .leading, spacing: 1) {
            Text("$\(NSDecimalNumber(decimal: bracket.min).intValue.formatted()) - \(bracket.max.map { NSDecimalNumber(decimal: $0).intValue }.map { "$\($0.formatted())" } ?? "∞") (\(String(format: rateFormat, NSDecimalNumber(decimal: bracket.rate * 100).doubleValue))%)")
                .font(.caption2)
                .foregroundColor(.secondary)
            HStack {
                Text("$\(NSDecimalNumber(decimal: bracketDetail.taxableInBracket).intValue.formatted()) × \(String(format: rateFormat, NSDecimalNumber(decimal: bracket.rate * 100).doubleValue))% = $\(NSDecimalNumber(decimal: bracketDetail.taxForBracket).intValue.formatted())")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Spacer()
            }
        }
        .padding(.vertical, 1)
    }
}

struct PaymentSuggestion {
    let quarter: String
    let dueDate: String
    let amount: Decimal
    let isPaid: Bool
    let isPastDue: Bool
}

struct PaymentRowView: View {
    let payment: PaymentSuggestion
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(payment.quarter)
                        .fontWeight(.medium)
                    if payment.isPaid {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.success)
                            .font(.caption)
                    }
                }
                Text(payment.dueDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: payment.amount)) ?? "$0")
                    .fontWeight(.semibold)
                    .foregroundColor(payment.isPaid ? .green : payment.isPastDue ? .secondary : .primary)
                
                if payment.isPaid {
                    Text("(Paid)")
                        .font(.caption)
                        .foregroundColor(.success)
                } else if payment.isPastDue {
                    Text("(Past Due)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SummaryView()
        .environmentObject(TaxStore())
}