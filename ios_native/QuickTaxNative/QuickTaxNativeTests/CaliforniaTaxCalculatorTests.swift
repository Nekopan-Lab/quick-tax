import XCTest
@testable import QuickTaxNative

class CaliforniaTaxCalculatorTests: XCTestCase {
    
    // MARK: - Single Filer Tests
    
    func testSingleFilerIncomeBelowStandardDeduction() {
        // Income below standard deduction should result in $0 tax
        let income = createIncomeData(totalIncome: "5000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 0)
        XCTAssertEqual(result.totalTax, 0)
    }
    
    func testSingleFilerLowIncome() {
        // $20,000 income → $182 tax
        let income = createIncomeData(totalIncome: "20000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 14460) // 20000 - 5540 standard deduction
        XCTAssertEqual(result.totalTax, 182)
    }
    
    func testSingleFilerMiddleIncome() {
        // $75,000 income → $3,017 tax
        let income = createIncomeData(totalIncome: "75000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 69460) // 75000 - 5540
        XCTAssertEqual(result.totalTax, 3017)
    }
    
    func testSingleFilerHighIncome() {
        // $500,000 income → $44,482 tax
        let income = createIncomeData(totalIncome: "500000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 494460) // 500000 - 5540
        XCTAssertEqual(result.totalTax, 44482)
    }
    
    func testSingleFilerMentalHealthTax() {
        // $1,200,000 income → includes mental health tax
        let income = createIncomeData(totalIncome: "1200000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 1194460) // 1200000 - 5540
        XCTAssertEqual(result.mentalHealthTax, 1945) // 1% of (1194460 - 1000000)
        XCTAssertTrue(result.totalTax > result.baseTax)
    }
    
    func testSingleFilerCapitalGainsTaxedAsOrdinary() {
        // California treats all income types the same
        var income = IncomeData()
        income.ytdW2Income.taxableWage = "50000"
        income.investmentIncome.longTermGains = "25000"
        
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.taxableIncome, 69460) // 75000 - 5540
        XCTAssertEqual(result.totalTax, 3017) // Same as $75k ordinary income
    }
    
    // MARK: - Married Filing Jointly Tests
    
    func testMarriedFilingJointlyStandardCase() {
        // $100,000 income → $2,490 tax
        let income = createIncomeData(totalIncome: "100000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .marriedFilingJointly
        )
        
        XCTAssertEqual(result.taxableIncome, 88920) // 100000 - 11080 standard deduction
        XCTAssertEqual(result.totalTax, 2490)
    }
    
    func testMarriedFilingJointlyHighIncome() {
        // $800,000 income → $67,130 tax
        let income = createIncomeData(totalIncome: "800000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .marriedFilingJointly
        )
        
        XCTAssertEqual(result.taxableIncome, 788920) // 800000 - 11080
        XCTAssertEqual(result.totalTax, 67130)
    }
    
    func testMarriedFilingJointlyMentalHealthTax() {
        // $2,000,000 income → includes significant mental health tax
        let income = createIncomeData(totalIncome: "2000000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .marriedFilingJointly
        )
        
        XCTAssertEqual(result.taxableIncome, 1988920) // 2000000 - 11080
        XCTAssertEqual(result.mentalHealthTax, 9889) // 1% of (1988920 - 1000000)
        XCTAssertEqual(result.baseTax, 207427)
        XCTAssertEqual(result.totalTax, 217316) // baseTax + mentalHealthTax
    }
    
    // MARK: - Deduction Tests
    
    func testItemizedDeductionsNoSaltCap() {
        // California has no SALT cap
        let income = createIncomeData(totalIncome: "200000")
        var deductions = DeductionsData()
        deductions.propertyTax = "25000" // Would be capped at $10k federally
        deductions.donations = "5000"
        
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        // Itemized (30000) > Standard (5540)
        XCTAssertEqual(result.deduction.type, .itemized)
        XCTAssertEqual(result.deduction.amount, 30000)
        XCTAssertEqual(result.taxableIncome, 170000) // 200000 - 30000
    }
    
    func testMortgageInterestAlwaysMillionDollarLimit() {
        // California always uses $1M limit regardless of loan date
        let income = createIncomeData(totalIncome: "300000")
        var deductions = DeductionsData()
        deductions.mortgageInterest = "50000"
        deductions.mortgageBalance = "1500000"
        deductions.mortgageLoanDate = .afterDec152017 // Doesn't matter for CA
        
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        // Mortgage interest limited: 50000 * (1000000/1500000) = 33333
        XCTAssertEqual(result.deduction.type, .itemized)
        XCTAssertEqual(result.deduction.amount, 33333)
    }
    
    // MARK: - Edge Cases
    
    func testZeroIncome() {
        let income = createIncomeData()
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.totalTax, 0)
        XCTAssertEqual(result.taxableIncome, 0)
    }
    
    func testWithholdingAndRefund() {
        var income = IncomeData()
        income.ytdW2Income.taxableWage = "75000"
        income.ytdW2Income.stateWithhold = "5000"
        
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = CaliforniaTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single
        )
        
        XCTAssertEqual(result.totalTax, 3017)
        XCTAssertEqual(result.owedOrRefund, -1983) // Negative means refund (5000 - 3017)
    }
    
    // MARK: - Helper Methods
    
    private func createIncomeData(totalIncome: String = "0") -> IncomeData {
        var income = IncomeData()
        income.ytdW2Income.taxableWage = totalIncome
        return income
    }
}