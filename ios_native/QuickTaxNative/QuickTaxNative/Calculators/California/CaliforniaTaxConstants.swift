import Foundation

struct CaliforniaTaxConstants {
    struct StandardDeductions {
        static let single: Decimal = 5540
        static let marriedFilingJointly: Decimal = 11080
        
        static func amount(for filingStatus: FilingStatus) -> Decimal {
            switch filingStatus {
            case .single:
                return single
            case .marriedFilingJointly:
                return marriedFilingJointly
            }
        }
    }
    
    struct TaxBrackets {
        static let singleBrackets: [TaxBracket] = [
            TaxBracket(min: 0, max: 10756, rate: 0.01),
            TaxBracket(min: 10756, max: 25499, rate: 0.02),
            TaxBracket(min: 25499, max: 40245, rate: 0.04),
            TaxBracket(min: 40245, max: 55866, rate: 0.06),
            TaxBracket(min: 55866, max: 70606, rate: 0.08),
            TaxBracket(min: 70606, max: 360659, rate: 0.093),
            TaxBracket(min: 360659, max: 432787, rate: 0.103),
            TaxBracket(min: 432787, max: 721314, rate: 0.113),
            TaxBracket(min: 721314, max: nil, rate: 0.123)
        ]
        
        static let marriedFilingJointlyBrackets: [TaxBracket] = [
            TaxBracket(min: 0, max: 21512, rate: 0.01),
            TaxBracket(min: 21512, max: 50998, rate: 0.02),
            TaxBracket(min: 50998, max: 80490, rate: 0.04),
            TaxBracket(min: 80490, max: 111732, rate: 0.06),
            TaxBracket(min: 111732, max: 141212, rate: 0.08),
            TaxBracket(min: 141212, max: 721318, rate: 0.093),
            TaxBracket(min: 721318, max: 865574, rate: 0.103),
            TaxBracket(min: 865574, max: 1442628, rate: 0.113),
            TaxBracket(min: 1442628, max: nil, rate: 0.123)
        ]
        
        static func brackets(for filingStatus: FilingStatus) -> [TaxBracket] {
            switch filingStatus {
            case .single:
                return singleBrackets
            case .marriedFilingJointly:
                return marriedFilingJointlyBrackets
            }
        }
    }
    
    struct MentalHealthTax {
        static let threshold: Decimal = 1000000
        static let rate: Decimal = 0.01
    }
    
    struct Limits {
        static let mortgageInterestLimit: Decimal = 1000000
    }
    
    struct EstimatedPaymentDates {
        static let quarters = [
            (quarter: "Q1", dueDate: "April 15, 2025", percentage: 0.30),
            (quarter: "Q2", dueDate: "June 16, 2025", percentage: 0.70),
            (quarter: "Q4", dueDate: "January 15, 2026", percentage: 1.00)
        ]
    }
}