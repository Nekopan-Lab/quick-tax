import Foundation

struct FederalTaxConstants {
    struct StandardDeductions {
        static let single: Decimal = 15000
        static let marriedFilingJointly: Decimal = 30000
        
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
            TaxBracket(min: 0, max: 11925, rate: 0.10),
            TaxBracket(min: 11925, max: 48475, rate: 0.12),
            TaxBracket(min: 48475, max: 103350, rate: 0.22),
            TaxBracket(min: 103350, max: 197300, rate: 0.24),
            TaxBracket(min: 197300, max: 250525, rate: 0.32),
            TaxBracket(min: 250525, max: 626350, rate: 0.35),
            TaxBracket(min: 626350, max: nil, rate: 0.37)
        ]
        
        static let marriedFilingJointlyBrackets: [TaxBracket] = [
            TaxBracket(min: 0, max: 23850, rate: 0.10),
            TaxBracket(min: 23850, max: 96950, rate: 0.12),
            TaxBracket(min: 96950, max: 206700, rate: 0.22),
            TaxBracket(min: 206700, max: 394600, rate: 0.24),
            TaxBracket(min: 394600, max: 501050, rate: 0.32),
            TaxBracket(min: 501050, max: 751600, rate: 0.35),
            TaxBracket(min: 751600, max: nil, rate: 0.37)
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
    
    struct CapitalGainsBrackets {
        static let singleBrackets: [TaxBracket] = [
            TaxBracket(min: 0, max: 48350, rate: 0.0),
            TaxBracket(min: 48350, max: 533400, rate: 0.15),
            TaxBracket(min: 533400, max: nil, rate: 0.20)
        ]
        
        static let marriedFilingJointlyBrackets: [TaxBracket] = [
            TaxBracket(min: 0, max: 96700, rate: 0.0),
            TaxBracket(min: 96700, max: 600050, rate: 0.15),
            TaxBracket(min: 600050, max: nil, rate: 0.20)
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
    
    struct Limits {
        static let saltDeductionCap: Decimal = 10000
        static let mortgageInterestLimitBefore2017: Decimal = 1000000
        static let mortgageInterestLimitAfter2017: Decimal = 750000
        static let capitalLossDeductionLimit: Decimal = 3000
    }
    
    struct EstimatedPaymentDates {
        static let quarters = [
            (quarter: "Q1", dueDate: "April 15, 2025", percentage: 0.25),
            (quarter: "Q2", dueDate: "June 16, 2025", percentage: 0.50),
            (quarter: "Q3", dueDate: "September 15, 2025", percentage: 0.75),
            (quarter: "Q4", dueDate: "January 15, 2026", percentage: 1.00)
        ]
    }
}