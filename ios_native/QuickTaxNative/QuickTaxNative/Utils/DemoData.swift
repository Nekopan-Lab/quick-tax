import Foundation

struct DemoData {
    
    static let description = """
This demo shows a moderate income household:

• Combined household income: ~$300,000
• User has $130k base salary + RSUs, Spouse has $100k base salary
• Modest home with $22,000 total itemized deductions
• Uses federal standard deduction ($30,000) but CA itemized ($22,000)
• Low withholding rates (15% federal, 5% state) result in taxes owed
• Made minimal Q1 federal payment ($500), no CA payments yet
• Demonstrates need for estimated tax payments

You can modify any of these values to match your situation, or clear all data to start fresh.
"""
    
    static func loadDemoData(into store: TaxStore) {
        // Set filing status and tax preferences
        store.filingStatus = .marriedFilingJointly
        store.includeCaliforniaTax = true
        store.showSpouseIncome = true
        
        // Calculate next biweekly paydate (assuming Friday paydays)
        let nextBiweeklyPaydate = getNextBiweeklyPaydate()
        
        // User Income
        store.userIncome = IncomeData(
            // Investment Income
            investmentIncome: InvestmentIncomeData(
                ordinaryDividends: "1500",
                qualifiedDividends: "1200",
                interestIncome: "800",
                shortTermGains: "500",
                longTermGains: "3000"
            ),
            // YTD W2 Income
            ytdW2Income: YTDIncomeData(
                taxableWage: "50000",
                federalWithhold: "7500",
                stateWithhold: "2500"
            ),
            // Future Income Mode
            incomeMode: .detailed,
            // Future Income (Simple mode - not used)
            futureIncome: FutureIncomeData(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            // Paycheck Data
            paycheckData: PaycheckData(
                taxableWage: "5000",
                federalWithhold: "750",
                stateWithhold: "250",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            // RSU Vest Data
            rsuVestData: RSUVestData(
                taxableWage: "15000",
                federalWithhold: "2250",
                stateWithhold: "750",
                vestPrice: "150"
            ),
            // Future RSU Vests
            futureRSUVests: [
                FutureRSUVest(
                    id: UUID().uuidString,
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 8, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                ),
                FutureRSUVest(
                    id: UUID().uuidString,
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 11, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                )
            ]
        )
        
        // Spouse Income
        store.spouseIncome = IncomeData(
            // Investment Income
            investmentIncome: InvestmentIncomeData(
                ordinaryDividends: "1000",
                qualifiedDividends: "800",
                interestIncome: "600",
                shortTermGains: "0",
                longTermGains: "2000"
            ),
            // YTD W2 Income
            ytdW2Income: YTDIncomeData(
                taxableWage: "40000",
                federalWithhold: "6000",
                stateWithhold: "2000"
            ),
            // Future Income Mode
            incomeMode: .detailed,
            // Future Income (Simple mode - not used)
            futureIncome: FutureIncomeData(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            // Paycheck Data
            paycheckData: PaycheckData(
                taxableWage: "3846",
                federalWithhold: "577",
                stateWithhold: "192",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            // RSU Vest Data
            rsuVestData: RSUVestData(
                taxableWage: "0",
                federalWithhold: "0",
                stateWithhold: "0",
                vestPrice: ""
            ),
            // Future RSU Vests
            futureRSUVests: []
        )
        
        // Deductions
        store.deductions = DeductionsData(
            propertyTax: "8000",
            mortgageInterest: "12000",
            mortgageLoanDate: .afterDec152017,
            mortgageBalance: "400000",
            donations: "2000",
            otherStateIncomeTax: "0"
        )
        
        // Estimated Payments
        store.estimatedPayments = EstimatedPaymentsData(
            federalQ1: "500",
            federalQ2: "0",
            federalQ3: "0",
            federalQ4: "0",
            californiaQ1: "0",
            californiaQ2: "0",
            californiaQ4: "0"
        )
        
        // Save the demo data
        store.saveData()
    }
    
    private static func getNextBiweeklyPaydate() -> Date {
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
}