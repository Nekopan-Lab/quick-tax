import XCTest
@testable import QuickTaxNative

@MainActor
final class DemoDataCalculationTests: XCTestCase {
    
    var taxStore: TaxStore!
    
    override func setUp() {
        super.setUp()
        taxStore = TaxStore()
        loadDemoDataWithFixedDates()
    }
    
    func testDemoDataCalculations() {
        // Run the calculation
        let result = TaxOrchestrator.calculateTaxes(store: taxStore)
        
        print("\n==== iOS Demo Data Test Results ====")
        print("Total Income: \(result.totalIncome)")
        print("")
        
        print("Federal Tax:")
        print("  Taxable Income: \(result.federalTax.taxableIncome)")
        print("  Ordinary Income Tax: \(result.federalTax.ordinaryIncomeTax)")
        print("  Capital Gains Tax: \(result.federalTax.capitalGainsTax)")
        print("  Total Tax: \(result.federalTax.totalTax)")
        print("  Owed/Refund: \(result.federalTax.owedOrRefund)")
        print("  Effective Rate: \(result.federalTax.effectiveRate)")
        print("  Deduction Type: \(result.federalTax.deduction.type)")
        print("  Deduction Amount: \(result.federalTax.deduction.amount)")
        print("")
        
        if let caTax = result.californiaTax {
            print("California Tax:")
            print("  Taxable Income: \(caTax.taxableIncome)")
            print("  Base Tax: \(caTax.baseTax)")
            print("  Mental Health Tax: \(caTax.mentalHealthTax)")
            print("  Total Tax: \(caTax.totalTax)")
            print("  Owed/Refund: \(caTax.owedOrRefund)")
            print("  Effective Rate: \(caTax.effectiveRate)")
            print("  Deduction Type: \(caTax.deduction.type)")
            print("  Deduction Amount: \(caTax.deduction.amount)")
        }
        
        // Expected values from web app with fixed dates (June 1, 2025)
        // This ensures consistent test results regardless of when the test runs
        XCTAssertEqual(result.totalIncome, 292090, "Total income should match web app with fixed dates")
        
        // Federal Tax (updated for fixed dates)
        XCTAssertEqual(result.federalTax.taxableIncome, 262090, "Federal taxable income should match")
        XCTAssertEqual(result.federalTax.ordinaryIncomeTax, 46916, "Federal ordinary income tax should match")
        XCTAssertEqual(result.federalTax.capitalGainsTax, 1050, "Federal capital gains tax should match")
        XCTAssertEqual(result.federalTax.totalTax, 47966, "Federal total tax should match")
        XCTAssertEqual(result.federalTax.owedOrRefund, 5061, "Federal owed should match web app")
        XCTAssertEqual(result.federalTax.deduction.type, .standard, "Should use standard deduction")
        XCTAssertEqual(result.federalTax.deduction.amount, 30000, "Federal deduction amount should match")
        
        // California Tax (updated for fixed dates)
        XCTAssertNotNil(result.californiaTax, "California tax should be calculated")
        if let caTax = result.californiaTax {
            XCTAssertEqual(caTax.taxableIncome, 270090, "CA taxable income should match")
            XCTAssertEqual(caTax.baseTax, 18203, "CA base tax should match")
            XCTAssertEqual(caTax.mentalHealthTax, 0, "CA mental health tax should be 0")
            XCTAssertEqual(caTax.totalTax, 18203, "CA total tax should match")
            XCTAssertEqual(caTax.owedOrRefund, 4073, "CA owed should match web app")
            XCTAssertEqual(caTax.deduction.type, .itemized, "CA should use itemized deduction")
            XCTAssertEqual(caTax.deduction.amount, 22000, "CA deduction amount should match")
        }
    }
    
    func testWithholdingBreakdown() {
        print("\n==== iOS Withholding Breakdown ====")
        
        // Calculate federal withholdings using the view's method
        let federalWithholdings = calculateFederalWithholdings()
        let stateWithholdings = calculateCaliforniaWithholdings()
        
        print("Total Federal Withholdings: \(federalWithholdings)")
        print("Total State Withholdings: \(stateWithholdings)")
        
        // Expected values from web app calculation with fixed dates
        // Federal: Total tax (47966) - Owed (5061) - Q1 payment (500) = 42405
        // State: Total tax (18203) - Owed (4073) - No CA payments = 14130
        XCTAssertEqual(federalWithholdings, 42405, accuracy: 1, "Federal withholdings should match web app")
        XCTAssertEqual(stateWithholdings, 14130, accuracy: 1, "State withholdings should match web app")
    }
    
    func testDetailedIncomeBreakdown() {
        print("\n==== iOS Detailed Income Breakdown ====")
        
        // Test individual income calculation for user
        let userIncome = TaxOrchestrator.processIncomeTotal(taxStore.userIncome)
        print("User Total Income: \(userIncome)")
        
        // Test individual income calculation for spouse
        let spouseIncome = TaxOrchestrator.processIncomeTotal(taxStore.spouseIncome)
        print("Spouse Total Income: \(spouseIncome)")
        
        print("Combined Total: \(userIncome + spouseIncome)")
        
        // Test paycheck calculations
        let userPaychecks = TaxOrchestrator.calculateRemainingPaychecks(
            frequency: taxStore.userIncome.paycheckData.frequency,
            nextDate: taxStore.userIncome.paycheckData.nextPaymentDate
        )
        let spousePaychecks = TaxOrchestrator.calculateRemainingPaychecks(
            frequency: taxStore.spouseIncome.paycheckData.frequency,
            nextDate: taxStore.spouseIncome.paycheckData.nextPaymentDate
        )
        
        print("\nPaycheck Calculations:")
        print("User remaining paychecks: \(userPaychecks)")
        print("Spouse remaining paychecks: \(spousePaychecks)")
    }
    
    // MARK: - Helper Methods
    
    private func loadDemoDataWithFixedDates() {
        // Set filing status and tax preferences
        taxStore.filingStatus = .marriedFilingJointly
        taxStore.includeCaliforniaTax = true
        
        // Use fixed date for consistent test results (June 1, 2025)
        let fixedDate = Calendar.current.date(from: DateComponents(year: 2025, month: 6, day: 6)) ?? Date() // June 6, 2025 (Friday)
        
        // User Income - exact same as web app demo but with fixed dates
        taxStore.userIncome = IncomeData(
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1500",
                qualifiedDividends: "1200",
                interestIncome: "800",
                shortTermGains: "500",
                longTermGains: "3000"
            ),
            ytdW2Income: W2Income(
                taxableWage: "50000",
                federalWithhold: "7500",
                stateWithhold: "2500"
            ),
            incomeMode: .detailed,
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            paycheckData: PaycheckData(
                taxableWage: "5000",
                federalWithhold: "750",
                stateWithhold: "250",
                frequency: .biweekly,
                nextPaymentDate: fixedDate
            ),
            rsuVestData: RSUVestData(
                taxableWage: "15000",
                federalWithhold: "2250",
                stateWithhold: "750",
                vestPrice: "150"
            ),
            futureRSUVests: [
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 8, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                ),
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 11, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                )
            ]
        )
        
        // Spouse Income - exact same as web app demo but with fixed dates
        taxStore.spouseIncome = IncomeData(
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1000",
                qualifiedDividends: "800",
                interestIncome: "600",
                shortTermGains: "0",
                longTermGains: "2000"
            ),
            ytdW2Income: W2Income(
                taxableWage: "40000",
                federalWithhold: "6000",
                stateWithhold: "2000"
            ),
            incomeMode: .detailed,
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            paycheckData: PaycheckData(
                taxableWage: "3846",
                federalWithhold: "577",
                stateWithhold: "192",
                frequency: .biweekly,
                nextPaymentDate: fixedDate
            ),
            rsuVestData: RSUVestData(
                taxableWage: "0",
                federalWithhold: "0",
                stateWithhold: "0",
                vestPrice: ""
            ),
            futureRSUVests: []
        )
        
        // Deductions - exact same as web app demo
        taxStore.deductions = DeductionsData(
            propertyTax: "8000",
            mortgageInterest: "12000",
            donations: "2000",
            mortgageLoanDate: .afterDec152017,
            mortgageBalance: "400000",
            otherStateIncomeTax: "0"
        )
        
        // Estimated Payments - exact same as web app demo
        taxStore.estimatedPayments = EstimatedPaymentsData(
            federalQ1: "500",
            federalQ2: "0",
            federalQ3: "0",
            federalQ4: "0",
            californiaQ1: "0",
            californiaQ2: "0",
            californiaQ4: "0"
        )
    }
    
    private func loadDemoData() {
        // Set filing status and tax preferences
        taxStore.filingStatus = .marriedFilingJointly
        taxStore.includeCaliforniaTax = true
        // showSpouseIncome is automatically true when marriedFilingJointly
        
        // Calculate next biweekly paydate (assuming Friday paydays)
        let nextBiweeklyPaydate = getNextBiweeklyPaydate()
        
        // User Income - exact same as web app demo
        taxStore.userIncome = IncomeData(
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1500",
                qualifiedDividends: "1200",
                interestIncome: "800",
                shortTermGains: "500",
                longTermGains: "3000"
            ),
            ytdW2Income: W2Income(
                taxableWage: "50000",
                federalWithhold: "7500",
                stateWithhold: "2500"
            ),
            incomeMode: .detailed,
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            paycheckData: PaycheckData(
                taxableWage: "5000",
                federalWithhold: "750",
                stateWithhold: "250",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            rsuVestData: RSUVestData(
                taxableWage: "15000",
                federalWithhold: "2250",
                stateWithhold: "750",
                vestPrice: "150"
            ),
            futureRSUVests: [
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 8, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                ),
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 11, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                )
            ]
        )
        
        // Spouse Income - exact same as web app demo
        taxStore.spouseIncome = IncomeData(
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1000",
                qualifiedDividends: "800",
                interestIncome: "600",
                shortTermGains: "0",
                longTermGains: "2000"
            ),
            ytdW2Income: W2Income(
                taxableWage: "40000",
                federalWithhold: "6000",
                stateWithhold: "2000"
            ),
            incomeMode: .detailed,
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            paycheckData: PaycheckData(
                taxableWage: "3846",
                federalWithhold: "577",
                stateWithhold: "192",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            rsuVestData: RSUVestData(
                taxableWage: "0",
                federalWithhold: "0",
                stateWithhold: "0",
                vestPrice: ""
            ),
            futureRSUVests: []
        )
        
        // Deductions - exact same as web app demo
        taxStore.deductions = DeductionsData(
            propertyTax: "8000",
            mortgageInterest: "12000",
            donations: "2000",
            mortgageLoanDate: .afterDec152017,
            mortgageBalance: "400000",
            otherStateIncomeTax: "0"
        )
        
        // Estimated Payments - exact same as web app demo
        taxStore.estimatedPayments = EstimatedPaymentsData(
            federalQ1: "500",
            federalQ2: "0",
            federalQ3: "0",
            federalQ4: "0",
            californiaQ1: "0",
            californiaQ2: "0",
            californiaQ4: "0"
        )
    }
    
    private func getNextBiweeklyPaydate() -> Date {
        let calendar = Calendar.current
        var date = Date()
        
        // Find next Friday
        while calendar.component(.weekday, from: date) != 6 { // Friday = 6
            date = calendar.date(byAdding: .day, value: 1, to: date) ?? date
        }
        
        // If we're past this Friday, go to next Friday
        if date <= Date() {
            date = calendar.date(byAdding: .day, value: 7, to: date) ?? date
        }
        
        return date
    }
    
    private func calculateFederalWithholdings() -> Decimal {
        let userYtdFederal = taxStore.userIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
        let spouseYtdFederal = taxStore.spouseIncome.ytdW2Income.federalWithhold.toDecimal() ?? 0
        
        var userFutureFederal: Decimal = 0
        var spouseFutureFederal: Decimal = 0
        
        if taxStore.userIncome.incomeMode == .simple {
            userFutureFederal = taxStore.userIncome.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            userFutureFederal = calculateDetailedFederalWithholdings(for: taxStore.userIncome)
        }
        
        if taxStore.spouseIncome.incomeMode == .simple {
            spouseFutureFederal = taxStore.spouseIncome.futureIncome.federalWithhold.toDecimal() ?? 0
        } else {
            spouseFutureFederal = calculateDetailedFederalWithholdings(for: taxStore.spouseIncome)
        }
        
        return userYtdFederal + spouseYtdFederal + userFutureFederal + spouseFutureFederal
    }
    
    private func calculateCaliforniaWithholdings() -> Decimal {
        let userYtdState = taxStore.userIncome.ytdW2Income.stateWithhold.toDecimal() ?? 0
        let spouseYtdState = taxStore.spouseIncome.ytdW2Income.stateWithhold.toDecimal() ?? 0
        
        var userFutureState: Decimal = 0
        var spouseFutureState: Decimal = 0
        
        if taxStore.userIncome.incomeMode == .simple {
            userFutureState = taxStore.userIncome.futureIncome.stateWithhold.toDecimal() ?? 0
        } else {
            userFutureState = calculateDetailedStateWithholdings(for: taxStore.userIncome)
        }
        
        if taxStore.spouseIncome.incomeMode == .simple {
            spouseFutureState = taxStore.spouseIncome.futureIncome.stateWithhold.toDecimal() ?? 0
        } else {
            spouseFutureState = calculateDetailedStateWithholdings(for: taxStore.spouseIncome)
        }
        
        return userYtdState + spouseYtdState + userFutureState + spouseFutureState
    }
    
    private func calculateDetailedFederalWithholdings(for income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        let paycheckFederal = income.paycheckData.federalWithhold.toDecimal() ?? 0
        let paycheckCount = TaxOrchestrator.calculateRemainingPaychecks(
            frequency: income.paycheckData.frequency,
            nextDate: income.paycheckData.nextPaymentDate
        )
        total += paycheckFederal * Decimal(paycheckCount)
        
        // RSU vest data is reference only - not added to total withholdings
        // It's used to calculate withholding rate for future RSU vests
        
        for vest in income.futureRSUVests {
            if vest.date >= Date() {
                let shares = Decimal(string: vest.shares) ?? 0
                let price = Decimal(string: vest.expectedPrice) ?? 0
                let vestValue = shares * price
                
                if vestValue > 0 {
                    let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
                    let rsuVestFederal = income.rsuVestData.federalWithhold.toDecimal() ?? 0
                    
                    if rsuVestWage > 0 {
                        let federalRate = rsuVestFederal / rsuVestWage
                        total += vestValue * federalRate
                    } else {
                        total += vestValue * Decimal(0.24)
                    }
                }
            }
        }
        
        return total
    }
    
    private func calculateDetailedStateWithholdings(for income: IncomeData) -> Decimal {
        var total: Decimal = 0
        
        let paycheckState = income.paycheckData.stateWithhold.toDecimal() ?? 0
        let paycheckCount = TaxOrchestrator.calculateRemainingPaychecks(
            frequency: income.paycheckData.frequency,
            nextDate: income.paycheckData.nextPaymentDate
        )
        total += paycheckState * Decimal(paycheckCount)
        
        // RSU vest data is reference only - not added to total withholdings
        // It's used to calculate withholding rate for future RSU vests
        
        for vest in income.futureRSUVests {
            if vest.date >= Date() {
                let shares = Decimal(string: vest.shares) ?? 0
                let price = Decimal(string: vest.expectedPrice) ?? 0
                let vestValue = shares * price
                
                if vestValue > 0 {
                    let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
                    let rsuVestState = income.rsuVestData.stateWithhold.toDecimal() ?? 0
                    
                    if rsuVestWage > 0 {
                        let stateRate = rsuVestState / rsuVestWage
                        total += vestValue * stateRate
                    } else {
                        total += vestValue * Decimal(0.10)
                    }
                }
            }
        }
        
        return total
    }
}

