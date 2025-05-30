import Foundation

struct TaxBracket: Codable {
    let min: Decimal
    let max: Decimal?
    let rate: Decimal
    
    var displayRange: String {
        let minStr = NumberFormatter.currencyWholeNumber.string(from: min as NSNumber) ?? "$0"
        if let max = max {
            let maxStr = NumberFormatter.currencyWholeNumber.string(from: max as NSNumber) ?? "$0"
            return "\(minStr) - \(maxStr)"
        } else {
            return "Over \(minStr)"
        }
    }
    
    var displayRate: String {
        let percentage = rate * 100
        return NumberFormatter.percentage.string(from: percentage as NSNumber) ?? "0%"
    }
}

struct TaxBracketDetail: Codable {
    let bracket: TaxBracket
    let taxableInBracket: Decimal
    let taxForBracket: Decimal
    
    var displayTaxableAmount: String {
        return NumberFormatter.currencyWholeNumber.string(from: taxableInBracket as NSNumber) ?? "$0"
    }
    
    var displayTax: String {
        return NumberFormatter.currencyWholeNumber.string(from: taxForBracket as NSNumber) ?? "$0"
    }
}

struct FederalIncomeComponents: Codable {
    let wages: Decimal
    let nonQualifiedDividends: Decimal
    let interestIncome: Decimal
    let shortTermGains: Decimal
    let longTermGains: Decimal
    let qualifiedDividends: Decimal
    let capitalLossDeduction: Decimal
    let totalOrdinaryIncome: Decimal
    let ordinaryTaxableIncome: Decimal
}

struct FederalTaxResult: Codable {
    let taxableIncome: Decimal
    let ordinaryIncomeTax: Decimal
    let capitalGainsTax: Decimal
    let totalTax: Decimal
    let deduction: DeductionInfo
    let owedOrRefund: Decimal
    let effectiveRate: Decimal
    let incomeComponents: FederalIncomeComponents
    let ordinaryTaxBrackets: [TaxBracketDetail]
    let capitalGainsBrackets: [TaxBracketDetail]
    
    var displayTaxableIncome: String {
        return NumberFormatter.currencyWholeNumber.string(from: taxableIncome as NSNumber) ?? "$0"
    }
    
    var displayTotalTax: String {
        return NumberFormatter.currencyWholeNumber.string(from: totalTax as NSNumber) ?? "$0"
    }
    
    var displayOwedOrRefund: String {
        let formatter = NumberFormatter.currencyWholeNumber
        if owedOrRefund < 0 {
            return "Refund: \(formatter.string(from: (-owedOrRefund) as NSNumber) ?? "$0")"
        } else {
            return "Owed: \(formatter.string(from: owedOrRefund as NSNumber) ?? "$0")"
        }
    }
    
    var displayEffectiveRate: String {
        let percentage = effectiveRate * 100
        return NumberFormatter.percentage.string(from: percentage as NSNumber) ?? "0%"
    }
}

struct CaliforniaTaxResult: Codable {
    let taxableIncome: Decimal
    let baseTax: Decimal
    let mentalHealthTax: Decimal
    let totalTax: Decimal
    let deduction: DeductionInfo
    let owedOrRefund: Decimal
    let effectiveRate: Decimal
    let taxBrackets: [TaxBracketDetail]
    
    var displayTaxableIncome: String {
        return NumberFormatter.currencyWholeNumber.string(from: taxableIncome as NSNumber) ?? "$0"
    }
    
    var displayTotalTax: String {
        return NumberFormatter.currencyWholeNumber.string(from: totalTax as NSNumber) ?? "$0"
    }
    
    var displayOwedOrRefund: String {
        let formatter = NumberFormatter.currencyWholeNumber
        if owedOrRefund < 0 {
            return "Refund: \(formatter.string(from: (-owedOrRefund) as NSNumber) ?? "$0")"
        } else {
            return "Owed: \(formatter.string(from: owedOrRefund as NSNumber) ?? "$0")"
        }
    }
    
    var displayEffectiveRate: String {
        let percentage = effectiveRate * 100
        return NumberFormatter.percentage.string(from: percentage as NSNumber) ?? "0%"
    }
}

struct TaxCalculationResult: Codable {
    let totalIncome: Decimal
    let federalTax: FederalTaxResult
    let californiaTax: CaliforniaTaxResult?
    
    var displayTotalIncome: String {
        return NumberFormatter.currencyWholeNumber.string(from: totalIncome as NSNumber) ?? "$0"
    }
}