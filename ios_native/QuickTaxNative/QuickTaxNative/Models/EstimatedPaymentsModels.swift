import Foundation

struct EstimatedPaymentsData: Codable, Equatable {
    // Federal quarterly payments
    var federalQ1: String = ""
    var federalQ2: String = ""
    var federalQ3: String = ""
    var federalQ4: String = ""
    
    // California payments (no Q3)
    var californiaQ1: String = ""
    var californiaQ2: String = ""
    var californiaQ4: String = ""
}

struct EstimatedPaymentSuggestion: Identifiable {
    let id = UUID()
    let quarter: String
    let dueDate: Date
    let amount: Decimal
    let isPaid: Bool
    let isPastDue: Bool
    
    var displayAmount: String {
        return NumberFormatter.currencyWholeNumber.string(from: amount as NSNumber) ?? "$0"
    }
    
    var displayDueDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: dueDate)
    }
}