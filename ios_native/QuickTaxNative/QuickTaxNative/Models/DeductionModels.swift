import Foundation

struct DeductionsData: Codable, Equatable {
    var propertyTax: String = ""
    var mortgageInterest: String = ""
    var donations: String = ""
    var mortgageLoanDate: MortgageLoanDate = .beforeDec162017
    var mortgageBalance: String = ""
    var otherStateIncomeTax: String = ""
}

struct DeductionInfo: Codable {
    let type: DeductionType
    let amount: Decimal
    
    var displayAmount: String {
        return NumberFormatter.currencyWholeNumber.string(from: amount as NSNumber) ?? "$0"
    }
}