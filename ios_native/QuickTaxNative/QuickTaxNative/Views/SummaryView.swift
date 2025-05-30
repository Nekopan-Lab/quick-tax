import SwiftUI

struct SummaryView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var taxResult: TaxCalculationResult?
    @State private var isCalculating = false
    @State private var expandedSections = Set<String>()
    
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
                        // Federal and California Tax Owed/Overpaid Cards
                        taxOwedCards(result: result)
                        
                        // Tax Breakdown Section
                        taxBreakdownSection(result: result)
                        
                        // Estimated Tax Payments Section
                        estimatedPaymentsSection(result: result)
                    }
                    .padding()
                } else {
                    VStack(spacing: 20) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.orange)
                        
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
            .navigationTitle("Summary & Results")
            .navigationBarTitleDisplayMode(.large)
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
                    .foregroundColor(.blue)
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
                            .foregroundColor(.red)
                        Text("Owed")
                            .font(.caption)
                            .foregroundColor(.red)
                    } else {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(federalOwed))) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.green)
                        Text("Overpaid")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Tax Year \(taxStore.taxYear.displayName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(String(format: "%.2f", NSDecimalNumber(decimal: result.federalTax.effectiveRate).doubleValue))% effective rate")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(federalOwed > 0 ? Color.red.opacity(0.3) : Color.green.opacity(0.3), lineWidth: 2)
        )
        .cornerRadius(12)
    }
    
    func californiaTaxOwedCard(caTax: CaliforniaTaxResult) -> some View {
        let caOwed = caTax.owedOrRefund
        
        return VStack(spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.orange)
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
                            .foregroundColor(.red)
                        Text("Owed")
                            .font(.caption)
                            .foregroundColor(.red)
                    } else {
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(caOwed))) ?? "$0")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.green)
                        Text("Overpaid")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Tax Year \(taxStore.taxYear.displayName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(String(format: "%.2f", NSDecimalNumber(decimal: caTax.effectiveRate).doubleValue))% effective rate")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(caOwed > 0 ? Color.red.opacity(0.3) : Color.green.opacity(0.3), lineWidth: 2)
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
            
            // Basic breakdown
            VStack(spacing: 8) {
                HStack {
                    Text("Total Income")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.totalIncome)) ?? "$0")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Text("Combined Effective Tax Rate")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    let combinedRate = (result.federalTax.totalTax + (result.californiaTax?.totalTax ?? 0)) / result.totalIncome * 100
                    Text("\(String(format: "%.2f", NSDecimalNumber(decimal: combinedRate).doubleValue))%")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
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
        .background(Color.blue.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.blue.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    var federalBreakdownHeader: some View {
        HStack {
            Image(systemName: "flag.fill")
                .foregroundColor(.blue)
            Text("Federal Tax Details (IRS)")
                .font(.subheadline)
                .fontWeight(.semibold)
            Spacer()
        }
    }
    
    func federalBreakdownDetails(result: TaxCalculationResult, withholdings: Decimal, paid: Decimal, owed: Decimal) -> some View {
        VStack(spacing: 6) {
            HStack {
                Text("Tax Liability (before withholdings)")
                    .font(.subheadline)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: result.federalTax.totalTax)) ?? "$0")
                    .fontWeight(.semibold)
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
                Text("Net Tax Owed/Overpaid")
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
        .background(Color.orange.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.orange.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
    
    var californiaBreakdownHeader: some View {
        HStack {
            Image(systemName: "star.fill")
                .foregroundColor(.orange)
            Text("California Tax Details (FTB)")
                .font(.subheadline)
                .fontWeight(.semibold)
            Spacer()
        }
    }
    
    func californiaBreakdownDetails(caTax: CaliforniaTaxResult, withholdings: Decimal, paid: Decimal, owed: Decimal) -> some View {
        VStack(spacing: 6) {
            HStack {
                Text("Tax Liability (before withholdings)")
                    .font(.subheadline)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: caTax.totalTax)) ?? "$0")
                    .fontWeight(.semibold)
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
                Text("Net Tax Owed/Overpaid")
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
                    .foregroundColor(.blue)
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
        .background(Color.blue.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.blue.opacity(0.2), lineWidth: 1)
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
                    .foregroundColor(.orange)
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
                    
                    Text("ℹ️ California requires 3 payments (no Q3 payment)")
                        .font(.caption)
                        .foregroundColor(.orange)
                        .padding(.top, 8)
                }
            }
        }
        .padding()
        .background(Color.orange.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.orange.opacity(0.2), lineWidth: 1)
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
                            .foregroundColor(.green)
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
                        .foregroundColor(.green)
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