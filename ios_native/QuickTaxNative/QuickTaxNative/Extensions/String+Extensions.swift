import Foundation

extension String {
    func toDecimal() -> Decimal? {
        // Remove any currency symbols and whitespace
        let cleanedString = self.replacingOccurrences(of: "$", with: "")
            .replacingOccurrences(of: ",", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Return nil for empty strings
        if cleanedString.isEmpty {
            return nil
        }
        
        // Try to convert to Decimal
        return Decimal(string: cleanedString)
    }
}