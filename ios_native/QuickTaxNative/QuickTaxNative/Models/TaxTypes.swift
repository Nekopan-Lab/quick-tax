import Foundation

enum FilingStatus: String, CaseIterable, Codable {
    case single = "single"
    case marriedFilingJointly = "marriedFilingJointly"
    
    var displayName: String {
        switch self {
        case .single:
            return "Single"
        case .marriedFilingJointly:
            return "Married Filing Jointly"
        }
    }
}

enum TaxYear: Int, CaseIterable, Codable {
    case year2025 = 2025
    
    var displayName: String {
        return String(self.rawValue)
    }
}

enum DeductionType: String, CaseIterable, Codable {
    case standard = "standard"
    case itemized = "itemized"
    
    var displayName: String {
        switch self {
        case .standard:
            return "Standard"
        case .itemized:
            return "Itemized"
        }
    }
}

enum IncomeMode: String, CaseIterable, Codable {
    case simple = "simple"
    case detailed = "detailed"
    
    var displayName: String {
        switch self {
        case .simple:
            return "Simple Estimation"
        case .detailed:
            return "Detailed (Paycheck/RSU)"
        }
    }
}

enum PayFrequency: String, CaseIterable, Codable {
    case biweekly = "biweekly"
    case monthly = "monthly"
    
    var displayName: String {
        switch self {
        case .biweekly:
            return "Bi-weekly"
        case .monthly:
            return "Monthly"
        }
    }
}

enum MortgageLoanDate: String, CaseIterable, Codable {
    case beforeDec162017 = "before-dec-16-2017"
    case afterDec152017 = "after-dec-15-2017"
    
    var displayName: String {
        switch self {
        case .beforeDec162017:
            return "Before Dec 16, 2017"
        case .afterDec152017:
            return "After Dec 15, 2017"
        }
    }
}