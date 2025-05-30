import SwiftUI

struct IncomeView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var selectedTab = 0
    @State private var showSpouseIncome = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab selector for married filing jointly
                if taxStore.filingStatus == .marriedFilingJointly {
                    Picker("", selection: $selectedTab) {
                        Text("Your Income").tag(0)
                        if showSpouseIncome {
                            Text("Spouse Income").tag(1)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding()
                }
                
                ScrollView {
                    VStack(spacing: 20) {
                        if selectedTab == 0 {
                            ModernIncomeFormView(income: $taxStore.userIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                        } else {
                            ModernIncomeFormView(income: $taxStore.spouseIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                        }
                        
                        if taxStore.filingStatus == .marriedFilingJointly && !showSpouseIncome && selectedTab == 0 {
                            Button(action: {
                                showSpouseIncome = true
                                selectedTab = 1
                            }) {
                                HStack {
                                    Image(systemName: "person.badge.plus")
                                        .font(.title3)
                                    Text("Add Spouse Income")
                                        .fontWeight(.medium)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(12)
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.bottom, 20)
                }
                .background(Color(UIColor.systemGroupedBackground))
            }
            .navigationTitle("Income")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onChange(of: taxStore.userIncome) { _ in taxStore.saveData() }
        .onChange(of: taxStore.spouseIncome) { _ in taxStore.saveData() }
    }
}

struct ModernIncomeFormView: View {
    @Binding var income: IncomeData
    let includeCaliforniaTax: Bool
    
    var body: some View {
        VStack(spacing: 20) {
            // Investment Income Section
            incomeSection(
                title: "Investment Income",
                subtitle: "Full Year Estimates",
                icon: "chart.line.uptrend.xyaxis"
            ) {
                VStack(spacing: 12) {
                    ModernCurrencyField("Ordinary Dividends", value: $income.investmentIncome.ordinaryDividends)
                    ModernCurrencyField("Qualified Dividends", value: $income.investmentIncome.qualifiedDividends)
                    ModernCurrencyField("Interest Income", value: $income.investmentIncome.interestIncome)
                    ModernCurrencyField("Short-Term Capital Gains/Losses", value: $income.investmentIncome.shortTermGains)
                    ModernCurrencyField("Long-Term Capital Gains/Losses", value: $income.investmentIncome.longTermGains)
                }
            }
            
            // YTD W2 Income Section
            incomeSection(
                title: "YTD W2 Income",
                subtitle: "Year-to-Date Values",
                icon: "doc.text"
            ) {
                VStack(spacing: 12) {
                    ModernCurrencyField("Taxable Wage", value: $income.ytdW2Income.taxableWage)
                    ModernCurrencyField("Federal Withhold", value: $income.ytdW2Income.federalWithhold)
                    if includeCaliforniaTax {
                        ModernCurrencyField("State Withhold", value: $income.ytdW2Income.stateWithhold)
                    }
                }
            }
            
            // Future Income Section
            VStack(spacing: 16) {
                HStack {
                    Label("Future Income", systemImage: "calendar.badge.plus")
                        .font(.headline)
                    Spacer()
                }
                
                Picker("", selection: $income.incomeMode) {
                    Text("Simple Estimation").tag(IncomeMode.simple)
                    Text("Detailed (Paycheck/RSU)").tag(IncomeMode.detailed)
                }
                .pickerStyle(SegmentedPickerStyle())
                
                if income.incomeMode == .simple {
                    VStack(spacing: 12) {
                        ModernCurrencyField("Future Taxable Wage", value: $income.futureIncome.taxableWage)
                        ModernCurrencyField("Future Federal Withhold", value: $income.futureIncome.federalWithhold)
                        if includeCaliforniaTax {
                            ModernCurrencyField("Future State Withhold", value: $income.futureIncome.stateWithhold)
                        }
                    }
                } else {
                    DetailedIncomeSection(income: $income, includeCaliforniaTax: includeCaliforniaTax)
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .cornerRadius(12)
            
            // Total Income Display
            HStack {
                Text("Total Income")
                    .font(.headline)
                Spacer()
                Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: calculateTotalIncome())) ?? "$0")
                    .font(.headline)
                    .foregroundColor(.primary)
            }
            .padding()
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .cornerRadius(12)
        }
        .padding(.horizontal)
    }
    
    func calculateTotalIncome() -> Decimal {
        var total: Decimal = 0
        
        // Investment income
        total += income.investmentIncome.ordinaryDividends.toDecimal() ?? 0
        total += income.investmentIncome.interestIncome.toDecimal() ?? 0
        total += income.investmentIncome.shortTermGains.toDecimal() ?? 0
        total += income.investmentIncome.longTermGains.toDecimal() ?? 0
        
        // W2 income
        total += income.ytdW2Income.taxableWage.toDecimal() ?? 0
        
        // Future income
        if income.incomeMode == .simple {
            total += income.futureIncome.taxableWage.toDecimal() ?? 0
        } else {
            // Paycheck income
            let paycheckWage = income.paycheckData.taxableWage.toDecimal() ?? 0
            let paycheckCount = TaxOrchestrator.calculateRemainingPaychecks(
                frequency: income.paycheckData.frequency,
                nextDate: income.paycheckData.nextPaymentDate
            )
            total += paycheckWage * Decimal(paycheckCount)
            
            // Future RSU vests
            for vest in income.futureRSUVests {
                if vest.date >= Date() {
                    let shares = Decimal(string: vest.shares) ?? 0
                    let price = Decimal(string: vest.expectedPrice) ?? 0
                    total += shares * price
                }
            }
        }
        
        return total
    }
    
    func incomeSection<Content: View>(
        title: String,
        subtitle: String,
        icon: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(spacing: 16) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.headline)
                Spacer()
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            content()
        }
        .padding()
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
    }
}

struct ModernCurrencyField: View {
    let label: String
    @Binding var value: String
    
    init(_ label: String, value: Binding<String>) {
        self.label = label
        self._value = value
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
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

struct DetailedIncomeSection: View {
    @Binding var income: IncomeData
    let includeCaliforniaTax: Bool
    
    var body: some View {
        VStack(spacing: 20) {
            // Paycheck Data
            VStack(alignment: .leading, spacing: 12) {
                Text("Most Recent Paycheck")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                VStack(spacing: 12) {
                    ModernCurrencyField("Taxable Wage (per paycheck)", value: $income.paycheckData.taxableWage)
                    ModernCurrencyField("Federal Withhold (per paycheck)", value: $income.paycheckData.federalWithhold)
                    if includeCaliforniaTax {
                        ModernCurrencyField("State Withhold (per paycheck)", value: $income.paycheckData.stateWithhold)
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Payment Frequency")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Menu {
                            ForEach(PayFrequency.allCases, id: \.self) { frequency in
                                Button(frequency.displayName) {
                                    income.paycheckData.frequency = frequency
                                }
                            }
                        } label: {
                            HStack {
                                Text(income.paycheckData.frequency.displayName)
                                    .foregroundColor(.primary)
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(12)
                            .background(Color(UIColor.tertiarySystemFill))
                            .cornerRadius(8)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Next Payment Date")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        DatePicker("", selection: $income.paycheckData.nextPaymentDate, displayedComponents: .date)
                            .datePickerStyle(CompactDatePickerStyle())
                            .labelsHidden()
                    }
                }
            }
            .padding()
            .background(Color(UIColor.systemBackground))
            .cornerRadius(10)
            
            // RSU Data
            VStack(alignment: .leading, spacing: 12) {
                Text("Last Vest Event")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                VStack(spacing: 12) {
                    ModernCurrencyField("Taxable Wage (per vest)", value: $income.rsuVestData.taxableWage)
                    ModernCurrencyField("Federal Withhold (per vest)", value: $income.rsuVestData.federalWithhold)
                    if includeCaliforniaTax {
                        ModernCurrencyField("State Withhold (per vest)", value: $income.rsuVestData.stateWithhold)
                    }
                    ModernCurrencyField("Vest Price (per share)", value: $income.rsuVestData.vestPrice)
                }
            }
            .padding()
            .background(Color(UIColor.systemBackground))
            .cornerRadius(10)
            
            // Future RSU Vests
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Future RSU Vests")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Button(action: {
                        var newVest = FutureRSUVest()
                        if let lastVestPrice = income.rsuVestData.vestPrice.toDecimal() {
                            newVest.expectedPrice = String(describing: lastVestPrice)
                        }
                        income.futureRSUVests.append(newVest)
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                }
                
                ForEach(income.futureRSUVests) { vest in
                    ModernRSUVestRow(vest: vest, vests: $income.futureRSUVests)
                }
            }
        }
    }
}

struct ModernRSUVestRow: View {
    let vest: FutureRSUVest
    @Binding var vests: [FutureRSUVest]
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                DatePicker("Vest Date", selection: Binding(
                    get: { vest.date },
                    set: { newDate in
                        if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                            vests[index].date = newDate
                        }
                    }
                ), displayedComponents: .date)
                .font(.caption)
                
                Button(action: {
                    vests.removeAll { $0.id == vest.id }
                }) {
                    Image(systemName: "trash.circle.fill")
                        .foregroundColor(.red)
                        .font(.title3)
                }
            }
            
            HStack(spacing: 12) {
                ModernCurrencyField("Shares", value: Binding(
                    get: { vest.shares },
                    set: { newValue in
                        if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                            vests[index].shares = newValue
                        }
                    }
                ))
                
                ModernCurrencyField("Price/Share", value: Binding(
                    get: { vest.expectedPrice },
                    set: { newValue in
                        if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                            vests[index].expectedPrice = newValue
                        }
                    }
                ))
            }
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .cornerRadius(10)
    }
}

#Preview {
    IncomeView()
        .environmentObject(TaxStore())
}