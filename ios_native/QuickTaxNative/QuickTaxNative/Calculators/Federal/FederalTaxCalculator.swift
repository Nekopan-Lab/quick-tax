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
            shortTermGains: totalIncome.shortTermGains,
            longTermGains: totalIncome.longTermGains,
            deductionAmount: deductionInfo.amount
        )
        
        // Step 4: Calculate ordinary income tax
        let ordinaryTaxBrackets = calculateProgressiveTax(
            income: incomeComponents.ordinaryTaxableIncome,
            brackets: FederalTaxConstants.TaxBrackets.brackets(for: filingStatus)
        )
        var ordinaryIncomeTax = ordinaryTaxBrackets.reduce(0) { $0 + $1.taxForBracket }
        
        // Step 5: Calculate capital gains tax
        let capitalGainsIncome = incomeComponents.qualifiedDividends + incomeComponents.longTermGains
        let capitalGainsBrackets = calculateCapitalGainsTax(
            capitalGainsIncome: capitalGainsIncome,
            ordinaryTaxableIncome: incomeComponents.ordinaryTaxableIncome,
            filingStatus: filingStatus
        )
        var capitalGainsTax = capitalGainsBrackets.reduce(0) { $0 + $1.taxForBracket }
        
        // Step 6: Calculate total tax and amounts owed/refunded
        var totalTax = ordinaryIncomeTax + capitalGainsTax
        var roundedTotalTax = Decimal()
        NSDecimalRound(&roundedTotalTax, &totalTax, 0, .plain)
        
        let totalWithholding = calculateTotalWithholding(
            userIncome: income,
            spouseIncome: spouseIncome
        )
        let totalEstimatedPayments = calculateTotalEstimatedPayments(estimatedPayments)
        let owedOrRefund = roundedTotalTax - totalWithholding - totalEstimatedPayments
        
        // Step 7: Calculate effective rate
        // Taxable income should reflect the income after capital loss adjustment
        let adjustedTotalIncome = incomeComponents.totalOrdinaryIncome + incomeComponents.qualifiedDividends + incomeComponents.longTermGains
        let taxableIncome = max(adjustedTotalIncome - deductionInfo.amount, 0)
        let effectiveRate = totalIncome.total > 0 ? roundedTotalTax / totalIncome.total : 0
        
        // Round individual tax components for display
        var roundedOrdinaryTax = Decimal()
        NSDecimalRound(&roundedOrdinaryTax, &ordinaryIncomeTax, 0, .plain)
        var roundedCapitalGainsTax = Decimal()
        NSDecimalRound(&roundedCapitalGainsTax, &capitalGainsTax, 0, .plain)
        
        return FederalTaxResult(
            taxableIncome: taxableIncome,
            ordinaryIncomeTax: roundedOrdinaryTax,
            capitalGainsTax: roundedCapitalGainsTax,
            totalTax: roundedTotalTax,
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
    ) -> (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal, total: Decimal, shortTermGains: Decimal, longTermGains: Decimal) {
        
        var ordinaryIncome: Decimal = 0
        var capitalGains: Decimal = 0
        var qualifiedDividends: Decimal = 0
        var shortTermGains: Decimal = 0
        var longTermGains: Decimal = 0
        
        // Process user income
        let userAmounts = processIncomeWithDetails(userIncome)
        ordinaryIncome += userAmounts.ordinary
        capitalGains += userAmounts.capitalGains
        qualifiedDividends += userAmounts.qualifiedDividends
        shortTermGains += userAmounts.shortTermGains
        longTermGains += userAmounts.longTermGains
        
        // Process spouse income if applicable
        if let spouseIncome = spouseIncome {
            let spouseAmounts = processIncomeWithDetails(spouseIncome)
            ordinaryIncome += spouseAmounts.ordinary
            capitalGains += spouseAmounts.capitalGains
            qualifiedDividends += spouseAmounts.qualifiedDividends
            shortTermGains += spouseAmounts.shortTermGains
            longTermGains += spouseAmounts.longTermGains
        }
        
        let total = ordinaryIncome + capitalGains + qualifiedDividends
        
        return (ordinaryIncome, capitalGains, qualifiedDividends, total, shortTermGains, longTermGains)
    }
    
    private static func processIncome(_ income: IncomeData) -> (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal) {
        let detailed = processIncomeWithDetails(income)
        return (detailed.ordinary, detailed.capitalGains, detailed.qualifiedDividends)
    }
    
    private static func processIncomeWithDetails(_ income: IncomeData) -> (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal, shortTermGains: Decimal, longTermGains: Decimal) {
        var ordinary: Decimal = 0
        var capitalGains: Decimal = 0
        var qualifiedDividends: Decimal = 0
        
        // Investment income
        let ordinaryDividends = income.investmentIncome.ordinaryDividends.toDecimal() ?? 0
        qualifiedDividends = min(income.investmentIncome.qualifiedDividends.toDecimal() ?? 0, ordinaryDividends)
        let nonQualifiedDividends = ordinaryDividends - qualifiedDividends
        
        ordinary += nonQualifiedDividends
        ordinary += income.investmentIncome.interestIncome.toDecimal() ?? 0
        
        let shortTermGains = income.investmentIncome.shortTermGains.toDecimal() ?? 0
        let longTermGains = income.investmentIncome.longTermGains.toDecimal() ?? 0
        
        ordinary += shortTermGains
        capitalGains += longTermGains
        
        // W2 income
        ordinary += income.ytdW2Income.taxableWage.toDecimal() ?? 0
        
        // Future income
        ordinary += calculateFutureWages(income)
        
        return (ordinary, capitalGains, qualifiedDividends, shortTermGains, longTermGains)
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
            
            // NOTE: We do NOT include past RSU vest wage here
            // The web app only counts future income
            // let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
            var futureRSUTotal: Decimal = 0
            
            for vest in income.futureRSUVests {
                if vest.date >= Date() {
                    let shares = Decimal(string: vest.shares) ?? 0
                    let price = Decimal(string: vest.expectedPrice) ?? 0
                    futureRSUTotal += shares * price
                }
            }
            
            return paycheckTotal + futureRSUTotal
        }
    }
    
    private static func calculateRemainingPaychecks(frequency: PayFrequency, nextDate: Date) -> Int {
        let calendar = Calendar.current
        let now = Date()
        let endOfYear = calendar.date(from: DateComponents(year: calendar.component(.year, from: now), month: 12, day: 31))!
        
        if nextDate > endOfYear {
            return 0
        }
        
        // Use proper date iteration logic like the web app
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
        var totalItemized = saltDeduction + allowedMortgageInterest + donations
        
        // Round the total itemized deductions
        var roundedTotalItemized = Decimal()
        NSDecimalRound(&roundedTotalItemized, &totalItemized, 0, .plain)
        
        // Return the higher deduction
        if roundedTotalItemized > standardDeduction {
            return DeductionInfo(type: .itemized, amount: roundedTotalItemized)
        } else {
            return DeductionInfo(type: .standard, amount: standardDeduction)
        }
    }
    
    // MARK: - Income Components
    
    private static func calculateIncomeComponents(
        totalIncome: (ordinary: Decimal, capitalGains: Decimal, qualifiedDividends: Decimal, total: Decimal, shortTermGains: Decimal, longTermGains: Decimal),
        shortTermGains: Decimal,
        longTermGains: Decimal,
        deductionAmount: Decimal
    ) -> FederalIncomeComponents {
        
        // Apply capital loss limit
        // Net capital gains includes both short-term and long-term gains/losses
        let netCapitalGains = shortTermGains + longTermGains
        
        // Capital losses can offset ordinary income up to $3,000
        let capitalLossDeduction = min(max(-netCapitalGains, 0), FederalTaxConstants.Limits.capitalLossDeductionLimit)
        
        // Calculate ordinary income components
        // Ordinary income is reduced by capital loss deduction (up to $3,000)
        // Note: Short-term gains are already included in ordinary income
        let totalOrdinaryIncome = totalIncome.ordinary - capitalLossDeduction
        let ordinaryTaxableIncome = max(totalOrdinaryIncome - deductionAmount, 0)
        
        // For capital gains tax calculation, only positive long-term gains are taxed
        // This matches the web app behavior: Math.max(0, longTermGains)
        // Important: Capital losses are NOT double-deducted here. They are already applied
        // to ordinary income above (up to $3,000 limit). This ensures we don't incorrectly
        // reduce the capital gains tax rate by applying losses twice.
        let taxableLongTermGains = max(longTermGains, 0)
        
        // Note: In this simplified version, we're not breaking down all components
        // For full parity with web app, we'd need to track each income type separately
        
        return FederalIncomeComponents(
            wages: totalIncome.ordinary - shortTermGains, // Wages excluding short-term gains
            nonQualifiedDividends: 0, // Would need to track separately
            interestIncome: 0, // Would need to track separately
            shortTermGains: shortTermGains,
            longTermGains: taxableLongTermGains, // Only positive long-term gains are subject to capital gains tax
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
                    taxForBracket: taxForBracket
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
                    taxForBracket: taxForBracket
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
        total += calculateIndividualWithholding(userIncome)
        
        // Spouse withholding
        if let spouseIncome = spouseIncome {
            total += calculateIndividualWithholding(spouseIncome)
        }
        
        return total
    }
    
    private static func calculateIndividualWithholding(_ income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        // YTD withholding
        total += income.ytdW2Income.federalWithhold.toDecimal() ?? 0
        
        if income.incomeMode == .simple {
            total += income.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            // Paycheck withholding
            let paycheckWithhold = income.paycheckData.federalWithhold.toDecimal() ?? 0
            let paycheckCount = calculateRemainingPaychecks(
                frequency: income.paycheckData.frequency,
                nextDate: income.paycheckData.nextPaymentDate
            )
            total += paycheckWithhold * Decimal(paycheckCount)
            
            // NOTE: We do NOT include past RSU vest withholding here
            // The web app only counts future income withholdings
            // total += income.rsuVestData.federalWithhold.toDecimal() ?? 0
            
            // Future RSU vest withholdings
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

