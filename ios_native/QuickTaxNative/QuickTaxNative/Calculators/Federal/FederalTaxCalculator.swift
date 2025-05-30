import Foundation

class FederalTaxCalculator {
    
    static func calculate(
        income: IncomeData,
        spouseIncome: IncomeData?,
        deductions: DeductionsData,
        estimatedPayments: EstimatedPaymentsData,
        filingStatus: FilingStatus,
        includeCaliforniaTax: Bool,
        estimatedCaliforniaTax: Decimal
    ) -> FederalTaxResult {
        
        // Step 1: Aggregate all income
        let totalIncome = calculateTotalIncome(userIncome: income, spouseIncome: spouseIncome)
        
        // Step 2: Calculate deductions
        let deductionInfo = calculateDeduction(
            deductions: deductions,
            filingStatus: filingStatus,
            includeCaliforniaTax: includeCaliforniaTax,
            estimatedCaliforniaTax: estimatedCaliforniaTax
        )
        
        // Step 3: Calculate income components
        let incomeComponents = calculateIncomeComponents(
            totalIncome: totalIncome,
            deductionAmount: deductionInfo.amount
        )
        
        // Step 4: Calculate ordinary income tax
        let ordinaryTaxBrackets = calculateProgressiveTax(
            income: incomeComponents.ordinaryTaxableIncome,
            brackets: FederalTaxConstants.TaxBrackets.brackets(for: filingStatus)
        )
        let ordinaryIncomeTax = ordinaryTaxBrackets.reduce(0) { $0 + $1.taxForBracket }
        
        // Step 5: Calculate capital gains tax
        let capitalGainsIncome = incomeComponents.qualifiedDividends + incomeComponents.longTermGains
        let capitalGainsBrackets = calculateCapitalGainsTax(
            capitalGainsIncome: capitalGainsIncome,
            ordinaryTaxableIncome: incomeComponents.ordinaryTaxableIncome,
            filingStatus: filingStatus
        )
        let capitalGainsTax = capitalGainsBrackets.reduce(0) { $0 + $1.taxForBracket }
        
        // Step 6: Calculate total tax and amounts owed/refunded
        let totalTax = ordinaryIncomeTax + capitalGainsTax
        let totalWithholding = calculateTotalWithholding(
            userIncome: income,
            spouseIncome: spouseIncome
        )
        let totalEstimatedPayments = calculateTotalEstimatedPayments(estimatedPayments)
        let owedOrRefund = totalTax - totalWithholding - totalEstimatedPayments
        
        // Step 7: Calculate effective rate
        let taxableIncome = max(totalIncome.total - deductionInfo.amount, 0)
        let effectiveRate = totalIncome.total > 0 ? totalTax / totalIncome.total : 0
        
        return FederalTaxResult(
            taxableIncome: taxableIncome,
            ordinaryIncomeTax: ordinaryIncomeTax,
            capitalGainsTax: capitalGainsTax,
            totalTax: totalTax,
            deduction: deductionInfo,
            owedOrRefund: owedOrRefund,
            effectiveRate: effectiveRate,
            incomeComponents: incomeComponents,
            ordinaryTaxBrackets: ordinaryTaxBrackets,
            capitalGainsBrackets: capitalGainsBrackets
        )
    }
    
    // MARK: - Income Calculation
    
    private static func calculateTotalIncome(
        userIncome: IncomeData,
        spouseIncome: IncomeData?
    ) -> (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal, total: Decimal) {
        
        var ordinaryIncome: Decimal = 0
        var capitalGains: Decimal = 0
        var qualifiedDividends: Decimal = 0
        
        // Process user income
        let userAmounts = processIncome(userIncome)
        ordinaryIncome += userAmounts.ordinary
        capitalGains += userAmounts.capitalGains
        qualifiedDividends += userAmounts.qualifiedDividends
        
        // Process spouse income if applicable
        if let spouseIncome = spouseIncome {
            let spouseAmounts = processIncome(spouseIncome)
            ordinaryIncome += spouseAmounts.ordinary
            capitalGains += spouseAmounts.capitalGains
            qualifiedDividends += spouseAmounts.qualifiedDividends
        }
        
        let total = ordinaryIncome + capitalGains + qualifiedDividends
        
        return (ordinaryIncome, capitalGains, qualifiedDividends, total)
    }
    
    private static func processIncome(_ income: IncomeData) -> (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal) {
        var ordinary: Decimal = 0
        var capitalGains: Decimal = 0
        var qualifiedDividends: Decimal = 0
        
        // Investment income
        let ordinaryDividends = income.investmentIncome.ordinaryDividends.toDecimal() ?? 0
        qualifiedDividends = min(income.investmentIncome.qualifiedDividends.toDecimal() ?? 0, ordinaryDividends)
        let nonQualifiedDividends = ordinaryDividends - qualifiedDividends
        
        ordinary += nonQualifiedDividends
        ordinary += income.investmentIncome.interestIncome.toDecimal() ?? 0
        ordinary += income.investmentIncome.shortTermGains.toDecimal() ?? 0
        
        capitalGains += income.investmentIncome.longTermGains.toDecimal() ?? 0
        
        // W2 income
        ordinary += income.ytdW2Income.taxableWage.toDecimal() ?? 0
        
        // Future income
        ordinary += calculateFutureWages(income)
        
        return (ordinary, capitalGains, qualifiedDividends)
    }
    
    private static func calculateFutureWages(_ income: IncomeData) -> Decimal {
        if income.incomeMode == .simple {
            return income.futureIncome.taxableWage.toDecimal() ?? 0
        } else {
            // Calculate paycheck income
            let paycheckWage = income.paycheckData.taxableWage.toDecimal() ?? 0
            let paycheckCount = calculateRemainingPaychecks(
                frequency: income.paycheckData.frequency,
                nextDate: income.paycheckData.nextPaymentDate
            )
            let paycheckTotal = paycheckWage * Decimal(paycheckCount)
            
            // Calculate RSU income
            let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
            var futureRSUTotal: Decimal = 0
            
            for vest in income.futureRSUVests {
                if vest.date >= Date() {
                    let shares = Decimal(string: vest.shares) ?? 0
                    let price = Decimal(string: vest.expectedPrice) ?? 0
                    futureRSUTotal += shares * price
                }
            }
            
            return paycheckTotal + rsuVestWage + futureRSUTotal
        }
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
    
    // MARK: - Deduction Calculation
    
    private static func calculateDeduction(
        deductions: DeductionsData,
        filingStatus: FilingStatus,
        includeCaliforniaTax: Bool,
        estimatedCaliforniaTax: Decimal
    ) -> DeductionInfo {
        
        let standardDeduction = FederalTaxConstants.StandardDeductions.amount(for: filingStatus)
        
        // Calculate itemized deductions
        let propertyTax = deductions.propertyTax.toDecimal() ?? 0
        let stateIncomeTax = includeCaliforniaTax ? estimatedCaliforniaTax : (deductions.otherStateIncomeTax.toDecimal() ?? 0)
        let saltDeduction = min(propertyTax + stateIncomeTax, FederalTaxConstants.Limits.saltDeductionCap)
        
        // Calculate mortgage interest with limits
        let mortgageInterest = deductions.mortgageInterest.toDecimal() ?? 0
        let mortgageBalance = deductions.mortgageBalance.toDecimal() ?? 0
        
        let mortgageLimit: Decimal
        switch deductions.mortgageLoanDate {
        case .beforeDec162017:
            mortgageLimit = FederalTaxConstants.Limits.mortgageInterestLimitBefore2017
        case .afterDec152017:
            mortgageLimit = FederalTaxConstants.Limits.mortgageInterestLimitAfter2017
        }
        
        let allowedMortgageInterest: Decimal
        if mortgageBalance > 0 && mortgageBalance > mortgageLimit {
            allowedMortgageInterest = mortgageInterest * (mortgageLimit / mortgageBalance)
        } else {
            allowedMortgageInterest = mortgageInterest
        }
        
        let donations = deductions.donations.toDecimal() ?? 0
        let totalItemized = saltDeduction + allowedMortgageInterest + donations
        
        // Return the higher deduction
        if totalItemized > standardDeduction {
            return DeductionInfo(type: .itemized, amount: totalItemized)
        } else {
            return DeductionInfo(type: .standard, amount: standardDeduction)
        }
    }
    
    // MARK: - Income Components
    
    private static func calculateIncomeComponents(
        totalIncome: (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal, total: Decimal),
        deductionAmount: Decimal
    ) -> FederalIncomeComponents {
        
        // Apply capital loss limit
        let netCapitalGains = totalIncome.capitalGains
        let capitalLossDeduction = min(max(-netCapitalGains, 0), FederalTaxConstants.Limits.capitalLossDeductionLimit)
        
        // Calculate ordinary income components
        let totalOrdinaryIncome = totalIncome.ordinary - capitalLossDeduction
        let ordinaryTaxableIncome = max(totalOrdinaryIncome - deductionAmount, 0)
        
        // Note: In this simplified version, we're not breaking down all components
        // For full parity with web app, we'd need to track each income type separately
        
        return FederalIncomeComponents(
            wages: totalIncome.ordinary, // Simplified - includes all ordinary income
            nonQualifiedDividends: 0, // Would need to track separately
            interestIncome: 0, // Would need to track separately
            shortTermGains: 0, // Would need to track separately
            longTermGains: totalIncome.capitalGains,
            qualifiedDividends: totalIncome.qualifiedDividends,
            capitalLossDeduction: capitalLossDeduction,
            totalOrdinaryIncome: totalOrdinaryIncome,
            ordinaryTaxableIncome: ordinaryTaxableIncome
        )
    }
    
    // MARK: - Tax Calculation
    
    private static func calculateProgressiveTax(
        income: Decimal,
        brackets: [TaxBracket]
    ) -> [TaxBracketDetail] {
        
        var details: [TaxBracketDetail] = []
        var remainingIncome = income
        
        for bracket in brackets {
            if remainingIncome <= 0 {
                break
            }
            
            let bracketMax = bracket.max ?? Decimal.greatestFiniteMagnitude
            let taxableInBracket = min(remainingIncome, bracketMax - bracket.min)
            
            if taxableInBracket > 0 {
                let taxForBracket = taxableInBracket * bracket.rate
                details.append(TaxBracketDetail(
                    bracket: bracket,
                    taxableInBracket: taxableInBracket,
                    taxForBracket: taxForBracket.rounded()
                ))
                remainingIncome -= taxableInBracket
            }
        }
        
        return details
    }
    
    private static func calculateCapitalGainsTax(
        capitalGainsIncome: Decimal,
        ordinaryTaxableIncome: Decimal,
        filingStatus: FilingStatus
    ) -> [TaxBracketDetail] {
        
        let brackets = FederalTaxConstants.CapitalGainsBrackets.brackets(for: filingStatus)
        var details: [TaxBracketDetail] = []
        var remainingGains = capitalGainsIncome
        
        // Capital gains "stack" on top of ordinary income
        let startingPoint = ordinaryTaxableIncome
        
        for bracket in brackets {
            if remainingGains <= 0 {
                break
            }
            
            let bracketMax = bracket.max ?? Decimal.greatestFiniteMagnitude
            
            // Determine how much of this bracket is available
            let bracketStart = max(bracket.min, startingPoint)
            if bracketStart >= bracketMax {
                continue // This bracket is fully consumed by ordinary income
            }
            
            let availableInBracket = bracketMax - bracketStart
            let taxableInBracket = min(remainingGains, availableInBracket)
            
            if taxableInBracket > 0 {
                let taxForBracket = taxableInBracket * bracket.rate
                details.append(TaxBracketDetail(
                    bracket: bracket,
                    taxableInBracket: taxableInBracket,
                    taxForBracket: taxForBracket.rounded()
                ))
                remainingGains -= taxableInBracket
            }
        }
        
        return details
    }
    
    // MARK: - Withholding and Payments
    
    private static func calculateTotalWithholding(
        userIncome: IncomeData,
        spouseIncome: IncomeData?
    ) -> Decimal {
        
        var total: Decimal = 0
        
        // User withholding
        total += userIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
        
        if userIncome.incomeMode == .simple {
            total += userIncome.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            // Paycheck withholding
            let paycheckWithhold = userIncome.paycheckData.federalWithhold.toDecimal() ?? 0
            let paycheckCount = calculateRemainingPaychecks(
                frequency: userIncome.paycheckData.frequency,
                nextDate: userIncome.paycheckData.nextPaymentDate
            )
            total += paycheckWithhold * Decimal(paycheckCount)
            
            // RSU withholding
            total += userIncome.rsuVestData.federalWithhold.toDecimal() ?? 0
            
            // Note: Future RSU vests would need tax withholding calculation
            // This is simplified - actual implementation would calculate withholding
        }
        
        // Spouse withholding
        if let spouseIncome = spouseIncome {
            // Same calculation for spouse
            total += spouseIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
            // ... (repeat future income calculation for spouse)
        }
        
        return total
    }
    
    private static func calculateTotalEstimatedPayments(_ payments: EstimatedPaymentsData) -> Decimal {
        return (payments.federalQ1.toDecimal() ?? 0) +
               (payments.federalQ2.toDecimal() ?? 0) +
               (payments.federalQ3.toDecimal() ?? 0) +
               (payments.federalQ4.toDecimal() ?? 0)
    }
}

// MARK: - Decimal Extension for Rounding

extension Decimal {
    func rounded() -> Decimal {
        var rounded = self
        var result = Decimal()
        NSDecimalRound(&result, &rounded, 0, .plain)
        return result
    }
}