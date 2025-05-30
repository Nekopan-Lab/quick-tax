import Foundation
import SwiftUI

@MainActor
class TaxStore: ObservableObject {
    @Published var currentStep: Int = 0
    @Published var taxYear: TaxYear = .year2025
    @Published var filingStatus: FilingStatus = .single
    @Published var includeCaliforniaTax: Bool = true
    @Published var deductions: DeductionsData = DeductionsData()
    @Published var userIncome: IncomeData = IncomeData()
    @Published var spouseIncome: IncomeData = IncomeData()
    @Published var estimatedPayments: EstimatedPaymentsData = EstimatedPaymentsData()
    
    // Computed property to determine if spouse income is relevant
    var showSpouseIncome: Bool {
        return filingStatus == .marriedFilingJointly
    }
    
    // Persistence keys
    private let storageKey = "QuickTaxNativeData"
    
    init() {
        loadData()
    }
    
    // MARK: - Persistence
    
    func saveData() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        let data = TaxStoreData(
            currentStep: currentStep,
            taxYear: taxYear,
            filingStatus: filingStatus,
            includeCaliforniaTax: includeCaliforniaTax,
            deductions: deductions,
            userIncome: userIncome,
            spouseIncome: spouseIncome,
            estimatedPayments: estimatedPayments
        )
        
        if let encoded = try? encoder.encode(data) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }
    
    func loadData() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        if let decoded = try? decoder.decode(TaxStoreData.self, from: data) {
            self.currentStep = decoded.currentStep
            self.taxYear = decoded.taxYear
            self.filingStatus = decoded.filingStatus
            self.includeCaliforniaTax = decoded.includeCaliforniaTax
            self.deductions = decoded.deductions
            self.userIncome = decoded.userIncome
            self.spouseIncome = decoded.spouseIncome
            self.estimatedPayments = decoded.estimatedPayments
        }
    }
    
    func clearAllData() {
        UserDefaults.standard.removeObject(forKey: storageKey)
        
        // Reset to defaults
        currentStep = 0
        taxYear = .year2025
        filingStatus = .single
        includeCaliforniaTax = true
        deductions = DeductionsData()
        userIncome = IncomeData()
        spouseIncome = IncomeData()
        estimatedPayments = EstimatedPaymentsData()
    }
}

// Codable wrapper for persistence
private struct TaxStoreData: Codable {
    let currentStep: Int
    let taxYear: TaxYear
    let filingStatus: FilingStatus
    let includeCaliforniaTax: Bool
    let deductions: DeductionsData
    let userIncome: IncomeData
    let spouseIncome: IncomeData
    let estimatedPayments: EstimatedPaymentsData
}