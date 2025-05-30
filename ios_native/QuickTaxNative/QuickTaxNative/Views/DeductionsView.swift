import SwiftUI

struct DeductionsView: View {
    @EnvironmentObject var taxStore: TaxStore
    @Environment(\.selectedTab) var selectedTab
    @State private var showMortgageInfo = false
    @State private var expandFederalDetails = false
    @State private var expandCaliforniaDetails = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Itemized deductions card
                    itemizedDeductionsCard
                    
                    // Federal breakdown card
                    federalBreakdownCard
                    
                    // California breakdown card (if CA tax is selected)
                    if taxStore.includeCaliforniaTax {
                        californiaBreakdownCard
                    }
                    
                    // Navigation buttons
                    NavigationButtons(currentTab: 2)
                }
                .padding()
            }
            .onTapGesture {
                // Dismiss keyboard when tapping outside text fields
                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarHidden(true)
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") {
                        // Dismiss keyboard
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                    .font(.system(size: 16, weight: .medium))
                }
            }
        }
        .onChange(of: taxStore.deductions) { _ in 
            taxStore.saveData()
            // Update mortgage visibility
            showMortgageInfo = (taxStore.deductions.mortgageInterest.toDecimal() ?? 0) > 0
        }
        .onAppear {
            showMortgageInfo = (taxStore.deductions.mortgageInterest.toDecimal() ?? 0) > 0
        }
    }
    
    var itemizedDeductionsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Label("Itemized Deductions", systemImage: "doc.text.magnifyingglass")
                    .font(.headline)
                Spacer()
                Text("Full Year Estimates")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            VStack(spacing: 12) {
                ModernDeductionField("Property Tax", value: $taxStore.deductions.propertyTax, icon: "house")
                
                ModernDeductionField("Mortgage Interest", value: $taxStore.deductions.mortgageInterest, icon: "percent")
                
                // Mortgage details (shown when mortgage interest > 0)
                if showMortgageInfo {
                    VStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Loan Origination Date")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            VStack(spacing: 10) {
                                Button(action: {
                                    taxStore.deductions.mortgageLoanDate = .beforeDec162017
                                }) {
                                    HStack {
                                        Image(systemName: taxStore.deductions.mortgageLoanDate == .beforeDec162017 ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(.blue)
                                        Text("Before Dec 16, 2017")
                                            .foregroundColor(.primary)
                                        Spacer()
                                    }
                                    .font(.subheadline)
                                }
                                
                                Button(action: {
                                    taxStore.deductions.mortgageLoanDate = .afterDec152017
                                }) {
                                    HStack {
                                        Image(systemName: taxStore.deductions.mortgageLoanDate == .afterDec152017 ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(.blue)
                                        Text("After Dec 15, 2017")
                                            .foregroundColor(.primary)
                                        Spacer()
                                    }
                                    .font(.subheadline)
                                }
                            }
                        }
                        
                        ModernDeductionField("Mortgage Balance", value: $taxStore.deductions.mortgageBalance, icon: "dollarsign.circle")
                        
                        // Show limit info
                        if let balance = taxStore.deductions.mortgageBalance.toDecimal(), balance > 0 {
                            HStack {
                                Image(systemName: "info.circle")
                                    .foregroundColor(.blue)
                                Text(taxStore.deductions.mortgageLoanDate == .beforeDec162017 ? 
                                     "Interest deductible on up to $1M" : 
                                     "Interest deductible on up to $750K")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(10)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(10)
                }
                
                ModernDeductionField("Charitable Donations", value: $taxStore.deductions.donations, icon: "heart")
                
                if !taxStore.includeCaliforniaTax {
                    ModernDeductionField("Other State Income Tax", value: $taxStore.deductions.otherStateIncomeTax, icon: "building.columns")
                }
            }
            
            // SALT cap warning for federal deductions
            if calculateFederalSALT() > 10000 {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Federal SALT Cap Applied")
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("State and local taxes are limited to $10,000 for federal deductions")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(10)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    var standardDeductionCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Standard Deduction", systemImage: "checkmark.shield")
                .font(.headline)
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Federal")
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: standardDeductionAmount())) ?? "$0")
                        .font(.title3)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                if taxStore.includeCaliforniaTax {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("California")
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: californiaStandardDeduction())) ?? "$0")
                            .font(.title3)
                            .fontWeight(.semibold)
                    }
                }
            }
            
            Text("Automatically applied if higher than itemized deductions")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
    
    var federalBreakdownCard: some View {
        let federalItemized = calculateFederalItemizedTotal()
        let federalStandard = standardDeductionAmount()
        let federalUseStandard = federalStandard > federalItemized
        
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.blue)
                Text("Federal (IRS)")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                Spacer()
            }
            
            // Deduction amount being used
            HStack {
                Text("Deduction Amount")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: federalUseStandard ? federalStandard : federalItemized)) ?? "$0")
                    .font(.headline)
                    .fontWeight(.semibold)
                Text(federalUseStandard ? "STANDARD" : "ITEMIZED")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(federalUseStandard ? Color.blue.opacity(0.1) : Color.green.opacity(0.1))
                    .foregroundColor(federalUseStandard ? .blue : .green)
                    .cornerRadius(4)
            }
            
            Button(action: { expandFederalDetails.toggle() }) {
                HStack {
                    Text("View Calculation Details")
                        .font(.caption)
                        .foregroundColor(.blue)
                    Image(systemName: expandFederalDetails ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            .buttonStyle(PlainButtonStyle())
            
            if expandFederalDetails {
                VStack(spacing: 8) {
                // Property Tax
                let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
                HStack {
                    Text("Property Tax:")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: propertyTax)) ?? "$0")
                        .fontWeight(.medium)
                }
                
                // Estimated CA State Tax (for SALT)
                if taxStore.includeCaliforniaTax {
                    HStack {
                        Text("Est. CA State Tax:")
                        Spacer()
                        Text("$0") // Simplified for now
                            .fontWeight(.medium)
                    }
                }
                
                // SALT Cap Applied
                let federalSALT = calculateFederalSALT()
                if federalSALT > 0 {
                    HStack {
                        Text("SALT Cap Applied:")
                            .foregroundColor(.orange)
                        Spacer()
                        Text("$\(min(NSDecimalNumber(decimal: federalSALT).intValue, 10000).formatted()) (max $10,000)")
                            .foregroundColor(.orange)
                            .fontWeight(.medium)
                    }
                }
                
                // Mortgage Interest
                let mortgageInterest = taxStore.deductions.mortgageInterest.toDecimal() ?? 0
                if mortgageInterest > 0 {
                    HStack {
                        Text("Mortgage Interest:")
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: mortgageInterest)) ?? "$0")
                            .fontWeight(.medium)
                    }
                    
                    // Show mortgage limitation if applicable
                    if let balance = taxStore.deductions.mortgageBalance.toDecimal(), balance > 0 {
                        let federalLimit: Decimal = taxStore.deductions.mortgageLoanDate == .beforeDec162017 ? 1_000_000 : 750_000
                        if balance > federalLimit {
                            let limitedInterest = mortgageInterest * (federalLimit / balance)
                            HStack {
                                HStack(spacing: 4) {
                                    Text("→")
                                        .foregroundColor(.orange)
                                    Text("Limited to $\(NSDecimalNumber(decimal: federalLimit).intValue.formatted()) loan:")
                                        .foregroundColor(.orange)
                                }
                                Spacer()
                                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: limitedInterest)) ?? "$0")
                                    .foregroundColor(.orange)
                                    .fontWeight(.medium)
                            }
                            .font(.subheadline)
                        }
                    }
                }
                
                // Donations
                let donations = taxStore.deductions.donations.toDecimal() ?? 0
                HStack {
                    Text("Donations:")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: donations)) ?? "$0")
                        .fontWeight(.medium)
                }
                
                Divider()
                
                // Total Federal Itemized
                HStack {
                    Text("Total Federal Itemized:")
                        .fontWeight(.semibold)
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: federalItemized)) ?? "$0")
                        .fontWeight(.semibold)
                }
                
                // Explanation
                Text("Itemized ($\(NSDecimalNumber(decimal: federalItemized).intValue.formatted())) is \(federalUseStandard ? "less than" : "greater than") standard ($\(NSDecimalNumber(decimal: federalStandard).intValue.formatted()))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.blue.opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(12)
    }
    
    var californiaBreakdownCard: some View {
        let californiaItemized = calculateCaliforniaItemizedTotal()
        let californiaStandard = californiaStandardDeduction()
        let californiaUseStandard = californiaStandard > californiaItemized
        
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.orange)
                Text("California (FTB)")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                Spacer()
            }
            
            // Deduction amount being used
            HStack {
                Text("Deduction Amount")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: californiaUseStandard ? californiaStandard : californiaItemized)) ?? "$0")
                    .font(.headline)
                    .fontWeight(.semibold)
                Text(californiaUseStandard ? "STANDARD" : "ITEMIZED")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(californiaUseStandard ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
                    .foregroundColor(californiaUseStandard ? .orange : .green)
                    .cornerRadius(4)
            }
            
            Button(action: { expandCaliforniaDetails.toggle() }) {
                HStack {
                    Text("View Calculation Details")
                        .font(.caption)
                        .foregroundColor(.orange)
                    Image(systemName: expandCaliforniaDetails ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
            .buttonStyle(PlainButtonStyle())
            
            if expandCaliforniaDetails {
                VStack(spacing: 8) {
                // Property Tax
                let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
                HStack {
                    Text("Property Tax:")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: propertyTax)) ?? "$0")
                        .fontWeight(.medium)
                }
                
                // Mortgage Interest (no limitations shown for CA)
                let mortgageInterest = taxStore.deductions.mortgageInterest.toDecimal() ?? 0
                HStack {
                    Text("Mortgage Interest:")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: mortgageInterest)) ?? "$0")
                        .fontWeight(.medium)
                }
                
                // Donations
                let donations = taxStore.deductions.donations.toDecimal() ?? 0
                HStack {
                    Text("Donations:")
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: donations)) ?? "$0")
                        .fontWeight(.medium)
                }
                
                Divider()
                
                // Total CA Itemized
                HStack {
                    Text("Total CA Itemized:")
                        .fontWeight(.semibold)
                    Spacer()
                    Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: californiaItemized)) ?? "$0")
                        .fontWeight(.semibold)
                }
                
                // Explanation
                Text("Itemized ($\(NSDecimalNumber(decimal: californiaItemized).intValue.formatted())) is \(californiaUseStandard ? "less than" : "greater than") standard ($\(NSDecimalNumber(decimal: californiaStandard).intValue.formatted()))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.orange.opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(12)
    }
    
    func calculateFederalItemizedTotal() -> Decimal {
        let _ = taxStore.deductions.propertyTax.toDecimal() ?? 0
        let mortgageInterest = taxStore.deductions.mortgageInterest.toDecimal() ?? 0
        let donations = taxStore.deductions.donations.toDecimal() ?? 0
        
        // Apply federal mortgage interest limit
        var deductibleMortgageInterest = mortgageInterest
        if let balance = taxStore.deductions.mortgageBalance.toDecimal(), balance > 0 && mortgageInterest > 0 {
            let federalLimit: Decimal = taxStore.deductions.mortgageLoanDate == .beforeDec162017 ? 1_000_000 : 750_000
            if balance > federalLimit {
                deductibleMortgageInterest = mortgageInterest * (federalLimit / balance)
            }
        }
        
        // Federal SALT calculation with $10,000 cap
        let federalSALT = min(calculateFederalSALT(), 10000)
        
        return federalSALT + deductibleMortgageInterest + donations
    }
    
    func calculateCaliforniaItemizedTotal() -> Decimal {
        let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
        let mortgageInterest = taxStore.deductions.mortgageInterest.toDecimal() ?? 0
        let donations = taxStore.deductions.donations.toDecimal() ?? 0
        
        // Apply California mortgage interest limit (always $1M regardless of loan date)
        var deductibleMortgageInterest = mortgageInterest
        if let balance = taxStore.deductions.mortgageBalance.toDecimal(), balance > 0 && mortgageInterest > 0 {
            let californiaLimit: Decimal = 1_000_000
            if balance > californiaLimit {
                deductibleMortgageInterest = mortgageInterest * (californiaLimit / balance)
            }
        }
        
        // California has no SALT cap, but can't deduct CA state tax on CA return
        // So only property tax is deductible (no state income tax)
        return propertyTax + deductibleMortgageInterest + donations
    }
    
    func calculateFederalSALT() -> Decimal {
        let propertyTax = taxStore.deductions.propertyTax.toDecimal() ?? 0
        
        if taxStore.includeCaliforniaTax {
            // For federal SALT, include estimated CA state tax (simplified calculation)
            // In a real implementation, this would be calculated based on total income
            return propertyTax // For now, just property tax
        } else {
            let otherStateTax = taxStore.deductions.otherStateIncomeTax.toDecimal() ?? 0
            return propertyTax + otherStateTax
        }
    }
    
    func standardDeductionAmount() -> Decimal {
        switch taxStore.filingStatus {
        case .single:
            return 15000
        case .marriedFilingJointly:
            return 30000
        }
    }
    
    func californiaStandardDeduction() -> Decimal {
        switch taxStore.filingStatus {
        case .single:
            return 5540
        case .marriedFilingJointly:
            return 11080
        }
    }
}

struct ModernDeductionField: View {
    let label: String
    @Binding var value: String
    let icon: String
    
    init(_ label: String, value: Binding<String>, icon: String) {
        self.label = label
        self._value = value
        self.icon = icon
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.secondary)
                    .font(.caption)
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                Text("$")
                    .foregroundColor(.secondary)
                TextField("0", text: $value)
                    .keyboardType(.numberPad)
            }
            .padding(12)
            .background(Color(UIColor.tertiarySystemFill))
            .cornerRadius(8)
        }
    }
}

#Preview {
    DeductionsView()
        .environmentObject(TaxStore())
}