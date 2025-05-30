import Foundation

class TaxOrchestrator {
    
    @MainActor
    static func calculateTaxes(store: TaxStore) -> TaxCalculationResult {
        
        // First calculate California tax if needed (for federal SALT deduction)
        var californiaTaxResult: CaliforniaTaxResult?
        var estimatedCaliforniaTax: Decimal = 0
        
        if store.includeCaliforniaTax {
            californiaTaxResult = CaliforniaTaxCalculator.calculate(
                income: store.userIncome,
                spouseIncome: store.showSpouseIncome ? store.spouseIncome : nil,
                deductions: store.deductions,
                estimatedPayments: store.estimatedPayments,
                filingStatus: store.filingStatus
            )
            estimatedCaliforniaTax = californiaTaxResult?.totalTax ?? 0
        }
        
        // Calculate federal tax
        let federalTaxResult = FederalTaxCalculator.calculate(
            income: store.userIncome,
            spouseIncome: store.showSpouseIncome ? store.spouseIncome : nil,
            deductions: store.deductions,
            estimatedPayments: store.estimatedPayments,
            filingStatus: store.filingStatus,
            includeCaliforniaTax: store.includeCaliforniaTax,
            estimatedCaliforniaTax: estimatedCaliforniaTax
        )
        
        // Calculate total income
        let totalIncome = calculateTotalIncome(
            userIncome: store.userIncome,
            spouseIncome: store.showSpouseIncome ? store.spouseIncome : nil
        )
        
        return TaxCalculationResult(
            totalIncome: totalIncome,
            federalTax: federalTaxResult,
            californiaTax: californiaTaxResult
        )
    }
    
    @MainActor
    static func calculateEstimatedPaymentSuggestions(
        taxResult: TaxCalculationResult,
        estimatedPayments: EstimatedPaymentsData,
        includeCaliforniaTax: Bool
    ) -> (federal: [EstimatedPaymentSuggestion], california: [EstimatedPaymentSuggestion]) {
        
        var federalSuggestions: [EstimatedPaymentSuggestion] = []
        var californiaSuggestions: [EstimatedPaymentSuggestion] = []
        
        // Federal suggestions
        if taxResult.federalTax.owedOrRefund > 0 {
            federalSuggestions = calculateFederalSuggestions(
                totalOwed: taxResult.federalTax.owedOrRefund,
                payments: estimatedPayments
            )
        }
        
        // California suggestions
        if includeCaliforniaTax,
           let californiaTax = taxResult.californiaTax,
           californiaTax.owedOrRefund > 0 {
            californiaSuggestions = calculateCaliforniaSuggestions(
                totalOwed: californiaTax.owedOrRefund,
                payments: estimatedPayments
            )
        }
        
        return (federalSuggestions, californiaSuggestions)
    }
    
    private static func calculateTotalIncome(
        userIncome: IncomeData,
        spouseIncome: IncomeData?
    ) -> Decimal {
        var total: Decimal = 0
        
        // Process user income
        total += processIncomeTotal(userIncome)
        
        // Process spouse income if applicable
        if let spouseIncome = spouseIncome {
            total += processIncomeTotal(spouseIncome)
        }
        
        return total
    }
    
    private static func processIncomeTotal(_ income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        // Investment income
        total += income.investmentIncome.ordinaryDividends.toDecimal() ?? 0
        total += income.investmentIncome.interestIncome.toDecimal() ?? 0
        total += income.investmentIncome.shortTermGains.toDecimal() ?? 0
        total += income.investmentIncome.longTermGains.toDecimal() ?? 0
        
        // W2 income
        total += income.ytdW2Income.taxableWage.toDecimal() ?? 0
        
        // Future income
        if income.incomeMode == .simple {
            total += income.futureIncome.taxableWage.toDecimal() ?? 0
        } else {
            // Calculate paycheck income
            let paycheckWage = income.paycheckData.taxableWage.toDecimal() ?? 0
            let paycheckCount = calculateRemainingPaychecks(
                frequency: income.paycheckData.frequency,
                nextDate: income.paycheckData.nextPaymentDate
            )
            total += paycheckWage * Decimal(paycheckCount)
            
            // RSU income
            total += income.rsuVestData.taxableWage.toDecimal() ?? 0
            
            // Future RSU vests
            for vest in income.futureRSUVests {
                if vest.date >= Date() {
                    let shares = Decimal(string: vest.shares) ?? 0
                    let price = Decimal(string: vest.expectedPrice) ?? 0
                    total += shares * price
                }
            }
        }
        
        return total
    }
    
    private static func calculateRemainingPaychecks(frequency: PayFrequency, nextDate: Date) -> Int {
        let calendar = Calendar.current
        let now = Date()
        let endOfYear = calendar.date(from: DateComponents(year: calendar.component(.year, from: now), month: 12, day: 31))!
        
        if nextDate > endOfYear {
            return 0
        }
        
        let daysUntilEnd = calendar.dateComponents([.day], from: nextDate, to: endOfYear).day ?? 0
        
        switch frequency {
        case .biweekly:
            return max(0, (daysUntilEnd / 14) + 1)
        case .monthly:
            return max(0, (daysUntilEnd / 30) + 1)
        }
    }
    
    private static func calculateFederalSuggestions(
        totalOwed: Decimal,
        payments: EstimatedPaymentsData
    ) -> [EstimatedPaymentSuggestion] {
        
        let paidAmounts: [Decimal] = [
            payments.federalQ1.toDecimal() ?? 0,
            payments.federalQ2.toDecimal() ?? 0,
            payments.federalQ3.toDecimal() ?? 0,
            payments.federalQ4.toDecimal() ?? 0
        ]
        
        let totalPaid = paidAmounts.reduce(0, +)
        let remainingOwed = totalOwed - totalPaid
        
        var suggestions: [EstimatedPaymentSuggestion] = []
        let now = Date()
        
        for (index, quarterInfo) in FederalTaxConstants.EstimatedPaymentDates.quarters.enumerated() {
            let dueDate = dateFromString(quarterInfo.dueDate)
            let isPaid = paidAmounts[index] > 0
            let isPastDue = dueDate < now && !isPaid
            
            var amount: Decimal = 0
            if !isPaid && !isPastDue && remainingOwed > 0 {
                // Calculate cumulative amount needed by this quarter
                let cumulativeNeeded = totalOwed * Decimal(quarterInfo.percentage)
                let cumulativePaidSoFar = paidAmounts.prefix(index).reduce(0, +)
                amount = max(0, cumulativeNeeded - cumulativePaidSoFar)
            }
            
            suggestions.append(EstimatedPaymentSuggestion(
                quarter: quarterInfo.quarter,
                dueDate: dueDate,
                amount: amount,
                isPaid: isPaid,
                isPastDue: isPastDue
            ))
        }
        
        return suggestions
    }
    
    private static func calculateCaliforniaSuggestions(
        totalOwed: Decimal,
        payments: EstimatedPaymentsData
    ) -> [EstimatedPaymentSuggestion] {
        
        let paidAmounts: [Decimal] = [
            payments.californiaQ1.toDecimal() ?? 0,
            payments.californiaQ2.toDecimal() ?? 0,
            payments.californiaQ4.toDecimal() ?? 0
        ]
        
        let totalPaid = paidAmounts.reduce(0, +)
        let remainingOwed = totalOwed - totalPaid
        
        var suggestions: [EstimatedPaymentSuggestion] = []
        let now = Date()
        
        for (index, quarterInfo) in CaliforniaTaxConstants.EstimatedPaymentDates.quarters.enumerated() {
            let dueDate = dateFromString(quarterInfo.dueDate)
            let isPaid = paidAmounts[index] > 0
            let isPastDue = dueDate < now && !isPaid
            
            var amount: Decimal = 0
            if !isPaid && !isPastDue && remainingOwed > 0 {
                // Calculate cumulative amount needed by this quarter
                let cumulativeNeeded = totalOwed * Decimal(quarterInfo.percentage)
                let cumulativePaidSoFar = paidAmounts.prefix(index).reduce(0, +)
                amount = max(0, cumulativeNeeded - cumulativePaidSoFar)
            }
            
            suggestions.append(EstimatedPaymentSuggestion(
                quarter: quarterInfo.quarter,
                dueDate: dueDate,
                amount: amount,
                isPaid: isPaid,
                isPastDue: isPastDue
            ))
        }
        
        return suggestions
    }
    
    private static func dateFromString(_ dateString: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.date(from: dateString) ?? Date()
    }
}