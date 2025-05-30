import Foundation

struct InvestmentIncome: Codable {
    var ordinaryDividends: String = ""
    var qualifiedDividends: String = ""
    var interestIncome: String = ""
    var shortTermGains: String = ""
    var longTermGains: String = ""
}

struct W2Income: Codable {
    var taxableWage: String = ""
    var federalWithhold: String = ""
    var stateWithhold: String = ""
}

struct FutureRSUVest: Identifiable, Codable {
    let id: UUID
    var date: Date
    var shares: String = ""
    var expectedPrice: String = ""
    
    init(id: UUID = UUID(), date: Date = Date(), shares: String = "", expectedPrice: String = "") {
        self.id = id
        self.date = date
        self.shares = shares
        self.expectedPrice = expectedPrice
    }
}

struct PaycheckData: Codable {
    var taxableWage: String = ""
    var federalWithhold: String = ""
    var stateWithhold: String = ""
    var frequency: PayFrequency = .biweekly
    var nextPaymentDate: Date = Date()
}

struct RSUVestData: Codable {
    var taxableWage: String = ""
    var federalWithhold: String = ""
    var stateWithhold: String = ""
    var vestPrice: String = ""
}

struct IncomeData: Codable {
    // Investment Income (Full Year Estimations)
    var investmentIncome: InvestmentIncome = InvestmentIncome()
    
    // YTD W2 Income
    var ytdW2Income: W2Income = W2Income()
    
    // Future Income Mode
    var incomeMode: IncomeMode = .detailed
    
    // Simple Mode - Future Income Estimations
    var futureIncome: W2Income = W2Income()
    
    // Detailed Mode - Paycheck Data
    var paycheckData: PaycheckData = PaycheckData()
    
    // Detailed Mode - RSU Data
    var rsuVestData: RSUVestData = RSUVestData()
    var futureRSUVests: [FutureRSUVest] = []
}