import SwiftUI

struct DeductionsView: View {
    @EnvironmentObject var taxStore: TaxStore
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Itemized Deductions (Full Year Estimates)")) {
                    CurrencyTextField("Property Tax", value: $taxStore.deductions.propertyTax)
                    
                    CurrencyTextField("Mortgage Interest", value: $taxStore.deductions.mortgageInterest)
                    
                    // Show mortgage-related fields only if mortgage interest > 0
                    if (taxStore.deductions.mortgageInterest.toDecimal() ?? 0) > 0 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Mortgage Loan Date")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Picker("Loan Date", selection: $taxStore.deductions.mortgageLoanDate) {
                                ForEach(MortgageLoanDate.allCases, id: \.self) { date in
                                    Text(date.displayName).tag(date)
                                }
                            }
                            .pickerStyle(SegmentedPickerStyle())
                        }
                        
                        CurrencyTextField("Mortgage Balance", value: $taxStore.deductions.mortgageBalance)
                    }
                    
                    CurrencyTextField("Charitable Donations", value: $taxStore.deductions.donations)
                    
                    // Show other state income tax only if California tax is not selected
                    if !taxStore.includeCaliforniaTax {
                        CurrencyTextField("Other State Income Tax", value: $taxStore.deductions.otherStateIncomeTax)
                    }
                }
                
                Section(header: Text("Deduction Comparison"), footer: deductionExplanation) {
                    DeductionComparisonView()
                }
            }
            .navigationTitle("Deductions")
            .onChange(of: taxStore.deductions) { _ in
                taxStore.saveData()
            }
        }
    }
    
    var deductionExplanation: some View {
        Text("The calculator will automatically use whichever deduction method (Standard or Itemized) gives you the greater benefit for both Federal and California taxes separately.")
            .font(.caption)
            .foregroundColor(.secondary)
    }
}

struct DeductionComparisonView: View {
    @EnvironmentObject var taxStore: TaxStore
    
    var federalStandardDeduction: Decimal {
        FederalTaxConstants.StandardDeductions.amount(for: taxStore.filingStatus)
    }
    
    var californiaStandardDeduction: Decimal {
        CaliforniaTaxConstants.StandardDeductions.amount(for: taxStore.filingStatus)
    }
    
    var federalItemizedDeduction: Decimal {
        calculateFederalItemized()
    }
    
    var californiaItemizedDeduction: Decimal {
        calculateCaliforniaItemized()
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // Federal Comparison
            VStack(alignment: .leading, spacing: 8) {
                Text("Federal")
                    .font(.headline)
                
                HStack {
                    Label("Standard", systemImage: "doc.plaintext")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: federalStandardDeduction as NSNumber) ?? "$0")
                        .foregroundColor(federalStandardDeduction > federalItemizedDeduction ? .green : .secondary)
                }
                
                HStack {
                    Label("Itemized", systemImage: "doc.text")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: federalItemizedDeduction as NSNumber) ?? "$0")
                        .foregroundColor(federalItemizedDeduction > federalStandardDeduction ? .green : .secondary)
                }
                
                if federalItemizedDeduction > 0 {
                    DisclosureGroup("Itemized Breakdown") {
                        ItemizedBreakdownView(
                            propertyTax: taxStore.deductions.propertyTax.toDecimal() ?? 0,
                            stateIncomeTax: taxStore.includeCaliforniaTax ? 0 : (taxStore.deductions.otherStateIncomeTax.toDecimal() ?? 0),
                            saltCap: FederalTaxConstants.Limits.saltDeductionCap,
                            mortgageInterest: calculateAllowedMortgageInterest(for: .federal),
                            donations: taxStore.deductions.donations.toDecimal() ?? 0,
                            showSaltCap: true
                        )
                    }
                    .font(.caption)
                }
            }
            
            if taxStore.includeCaliforniaTax {
                Divider()
                
                // California Comparison
                VStack(alignment: .leading, spacing: 8) {
                    Text("California")
                        .font(.headline)
                    
                    HStack {
                        Label("Standard", systemImage: "doc.plaintext")
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: californiaStandardDeduction as NSNumber) ?? "$0")
                            .foregroundColor(californiaStandardDeduction > californiaItemizedDeduction ? .green : .secondary)
                    }
                    
                    HStack {
                        Label("Itemized", systemImage: "doc.text")
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: californiaItemizedDeduction as NSNumber) ?? "$0")
                            .foregroundColor(californiaItemizedDeduction > californiaStandardDeduction ? .green : .secondary)
                    }
                    
                    if californiaItemizedDeduction > 0 {
                        DisclosureGroup("Itemized Breakdown") {
                            ItemizedBreakdownView(
                                propertyTax: taxStore.deductions.propertyTax.toDecimal() ?? 0,
                                stateIncomeTax: 0,
                                saltCap: 0,
                                mortgageInterest: calculateAllowedMortgageInterest(for: .california),
                                donations: taxStore.deductions.donations.toDecimal() ?? 0,
                                showSaltCap: false
                            )
                        }
                        .font(.caption)
                    }
                }
            }
        }
    }
    
    func calculateFederalItemized() -> Decimal {
        let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
        let stateIncomeTax = taxStore.includeCaliforniaTax ? 0 : (taxStore.deductions.otherStateIncomeTax.toDecimal() ?? 0)
        let saltDeduction = min(propertyTax + stateIncomeTax, FederalTaxConstants.Limits.saltDeductionCap)
        let mortgageInterest = calculateAllowedMortgageInterest(for: .federal)
        let donations = taxStore.deductions.donations.toDecimal() ?? 0
        
        return saltDeduction + mortgageInterest + donations
    }
    
    func calculateCaliforniaItemized() -> Decimal {
        let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
        let mortgageInterest = calculateAllowedMortgageInterest(for: .california)
        let donations = taxStore.deductions.donations.toDecimal() ?? 0
        
        return propertyTax + mortgageInterest + donations
    }
    
    enum TaxType {
        case federal, california
    }
    
    func calculateAllowedMortgageInterest(for taxType: TaxType) -> Decimal {
        let mortgageInterest = taxStore.deductions.mortgageInterest.toDecimal() ?? 0
        let mortgageBalance = taxStore.deductions.mortgageBalance.toDecimal() ?? 0
        
        guard mortgageInterest > 0 else { return 0 }
        
        let limit: Decimal
        switch taxType {
        case .federal:
            switch taxStore.deductions.mortgageLoanDate {
            case .beforeDec162017:
                limit = FederalTaxConstants.Limits.mortgageInterestLimitBefore2017
            case .afterDec152017:
                limit = FederalTaxConstants.Limits.mortgageInterestLimitAfter2017
            }
        case .california:
            limit = CaliforniaTaxConstants.Limits.mortgageInterestLimit
        }
        
        if mortgageBalance > 0 && mortgageBalance > limit {
            return mortgageInterest * (limit / mortgageBalance)
        } else {
            return mortgageInterest
        }
    }
}

struct ItemizedBreakdownView: View {
    let propertyTax: Decimal
    let stateIncomeTax: Decimal
    let saltCap: Decimal
    let mortgageInterest: Decimal
    let donations: Decimal
    let showSaltCap: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if showSaltCap {
                HStack {
                    Text("Property Tax")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: propertyTax as NSNumber) ?? "$0")
                }
                
                if stateIncomeTax > 0 {
                    HStack {
                        Text("State Income Tax")
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: stateIncomeTax as NSNumber) ?? "$0")
                    }
                }
                
                if propertyTax + stateIncomeTax > saltCap {
                    HStack {
                        Text("SALT Cap Applied")
                            .foregroundColor(.orange)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: saltCap as NSNumber) ?? "$0")
                            .foregroundColor(.orange)
                    }
                }
            } else {
                HStack {
                    Text("Property Tax")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: propertyTax as NSNumber) ?? "$0")
                }
            }
            
            if mortgageInterest > 0 {
                HStack {
                    Text("Mortgage Interest")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: mortgageInterest as NSNumber) ?? "$0")
                }
            }
            
            if donations > 0 {
                HStack {
                    Text("Donations")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: donations as NSNumber) ?? "$0")
                }
            }
        }
        .foregroundColor(.secondary)
    }
}

#Preview {
    DeductionsView()
        .environmentObject(TaxStore())
}