import XCTest
@testable import QuickTaxNative

class FederalTaxCalculatorTests: XCTestCase {
    
    // MARK: - Single Filer Tests
    
    func testSingleFilerIncomeBelowStandardDeduction() {
        // Income below standard deduction should result in $0 tax
        let income = createIncomeData(ordinaryIncome: "10000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 0)
        XCTAssertEqual(result.totalTax, 0)
    }
    
    func testSingleFilerOrdinaryIncomeOnly() {
        // $50,000 ordinary income → $3,962 tax
        let income = createIncomeData(ordinaryIncome: "50000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 35000) // 50000 - 15000 standard deduction
        XCTAssertEqual(result.totalTax, 3962)
    }
    
    func testSingleFilerShortTermCapitalGains() {
        // Short-term capital gains are taxed as ordinary income
        let income = createIncomeData(
            ordinaryIncome: "30000",
            shortTermGains: "20000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 35000) // 50000 - 15000
        XCTAssertEqual(result.totalTax, 3962)
    }
    
    func testSingleFilerZeroPercentCapitalGains() {
        // Income in 0% capital gains bracket
        let income = createIncomeData(
            ordinaryIncome: "20000",
            longTermGains: "10000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 15000) // 30000 - 15000
        XCTAssertEqual(result.ordinaryIncomeTax, 500) // Tax on $5000 ordinary income
        XCTAssertEqual(result.capitalGainsTax, 0) // 0% on capital gains
        XCTAssertEqual(result.totalTax, 500)
    }
    
    func testSingleFilerFifteenPercentCapitalGains() {
        // Income in 15% capital gains bracket
        let income = createIncomeData(
            ordinaryIncome: "60000",
            longTermGains: "20000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 65000) // 80000 - 15000
        XCTAssertEqual(result.ordinaryIncomeTax, 5162) // Tax on $45000 ordinary income
        XCTAssertEqual(result.capitalGainsTax, 2498) // ~15% on $16,650 (portion above $48,350)
        XCTAssertEqual(result.totalTax, 7659)
    }
    
    func testSingleFilerQualifiedDividends() {
        // Qualified dividends are taxed at capital gains rates
        let income = createIncomeData(
            ordinaryIncome: "60000",
            ordinaryDividends: "10000",
            qualifiedDividends: "10000",
            longTermGains: "10000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 65000) // 80000 - 15000
        XCTAssertEqual(result.totalTax, 7659)
    }
    
    // MARK: - Married Filing Jointly Tests
    
    func testMarriedFilingJointlyStandardCase() {
        // $100,000 ordinary income → $7,923 tax
        let income = createIncomeData(ordinaryIncome: "100000")
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .marriedFilingJointly,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 70000) // 100000 - 30000 standard deduction
        XCTAssertEqual(result.totalTax, 7923)
    }
    
    func testMarriedFilingJointlyCapitalGainsZeroPercent() {
        // Capital gains in 0% bracket
        let income = createIncomeData(
            ordinaryIncome: "80000",
            longTermGains: "30000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .marriedFilingJointly,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 80000) // 110000 - 30000
        XCTAssertEqual(result.capitalGainsTax, 0) // All capital gains in 0% bracket
    }
    
    // MARK: - Edge Cases
    
    func testZeroIncome() {
        let income = createIncomeData()
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.totalTax, 0)
        XCTAssertEqual(result.taxableIncome, 0)
    }
    
    func testDeductionsExceedIncome() {
        let income = createIncomeData(ordinaryIncome: "10000")
        var deductions = DeductionsData()
        deductions.donations = "20000" // Force itemized > income
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.taxableIncome, 0)
        XCTAssertEqual(result.totalTax, 0)
    }
    
    func testWithholdingAndRefund() {
        let income = createIncomeData(
            ordinaryIncome: "50000",
            federalWithholding: "10000"
        )
        let deductions = DeductionsData()
        let payments = EstimatedPaymentsData()
        
        let result = FederalTaxCalculator.calculate(
            income: income,
            spouseIncome: nil,
            deductions: deductions,
            estimatedPayments: payments,
            filingStatus: .single,
            includeCaliforniaTax: false,
            estimatedCaliforniaTax: 0
        )
        
        XCTAssertEqual(result.totalTax, 3962)
        XCTAssertEqual(result.owedOrRefund, -6038) // Negative means refund
    }
    
    // MARK: - Helper Methods
    
    private func createIncomeData(
        ordinaryIncome: String = "0",
        ordinaryDividends: String = "0",
        qualifiedDividends: String = "0",
        interestIncome: String = "0",
        shortTermGains: String = "0",
        longTermGains: String = "0",
        federalWithholding: String = "0"
    ) -> IncomeData {
        var income = IncomeData()
        income.ytdW2Income.taxableWage = ordinaryIncome
        income.ytdW2Income.federalWithhold = federalWithholding
        income.investmentIncome.ordinaryDividends = ordinaryDividends
        income.investmentIncome.qualifiedDividends = qualifiedDividends
        income.investmentIncome.interestIncome = interestIncome
        income.investmentIncome.shortTermGains = shortTermGains
        income.investmentIncome.longTermGains = longTermGains
        return income
    }
}