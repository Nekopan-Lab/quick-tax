import SwiftUI

struct IncomeView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var selectedTab = 0
    @State private var showSpouseIncome = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if taxStore.filingStatus == .marriedFilingJointly {
                    Picker("Income", selection: $selectedTab) {
                        Text("Your Income").tag(0)
                        if showSpouseIncome {
                            Text("Spouse Income").tag(1)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding()
                }
                
                Form {
                    if selectedTab == 0 {
                        IncomeFormView(income: $taxStore.userIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                    } else {
                        IncomeFormView(income: $taxStore.spouseIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                    }
                    
                    if taxStore.filingStatus == .marriedFilingJointly && !showSpouseIncome && selectedTab == 0 {
                        Section {
                            Button(action: {
                                showSpouseIncome = true
                                selectedTab = 1
                            }) {
                                Label("Add Spouse Income (Optional)", systemImage: "person.badge.plus")
                            }
                        }
                    }
                }
            }
            .navigationTitle("Income")
            .onChange(of: taxStore.userIncome) { _ in
                taxStore.saveData()
            }
            .onChange(of: taxStore.spouseIncome) { _ in
                taxStore.saveData()
            }
        }
    }
}

struct IncomeFormView: View {
    @Binding var income: IncomeData
    let includeCaliforniaTax: Bool
    
    var body: some View {
        Group {
            // Investment Income Section
            Section(header: Text("Investment Income (Full Year Estimates)")) {
                CurrencyTextField("Ordinary Dividends", value: $income.investmentIncome.ordinaryDividends)
                CurrencyTextField("Qualified Dividends", value: $income.investmentIncome.qualifiedDividends)
                CurrencyTextField("Interest Income", value: $income.investmentIncome.interestIncome)
                CurrencyTextField("Short-Term Capital Gains/Losses", value: $income.investmentIncome.shortTermGains)
                CurrencyTextField("Long-Term Capital Gains/Losses", value: $income.investmentIncome.longTermGains)
            }
            
            // YTD W2 Income Section
            Section(header: Text("YTD W2 Income")) {
                CurrencyTextField("Taxable Wage (YTD)", value: $income.ytdW2Income.taxableWage)
                CurrencyTextField("Federal Withhold (YTD)", value: $income.ytdW2Income.federalWithhold)
                if includeCaliforniaTax {
                    CurrencyTextField("State Withhold (YTD)", value: $income.ytdW2Income.stateWithhold)
                }
            }
            
            // Future Income Section
            Section(header: Text("Future Income")) {
                Picker("Income Mode", selection: $income.incomeMode) {
                    Text("Simple Estimation").tag(IncomeMode.simple)
                    Text("Detailed (Paycheck/RSU)").tag(IncomeMode.detailed)
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            
            if income.incomeMode == .simple {
                SimpleIncomeView(income: $income, includeCaliforniaTax: includeCaliforniaTax)
            } else {
                DetailedIncomeView(income: $income, includeCaliforniaTax: includeCaliforniaTax)
            }
        }
    }
}

struct SimpleIncomeView: View {
    @Binding var income: IncomeData
    let includeCaliforniaTax: Bool
    
    var body: some View {
        Section(header: Text("Future Income Estimates")) {
            CurrencyTextField("Estimated Future Taxable Wage", value: $income.futureIncome.taxableWage)
            CurrencyTextField("Estimated Future Federal Withhold", value: $income.futureIncome.federalWithhold)
            if includeCaliforniaTax {
                CurrencyTextField("Estimated Future State Withhold", value: $income.futureIncome.stateWithhold)
            }
        }
    }
}

struct DetailedIncomeView: View {
    @Binding var income: IncomeData
    let includeCaliforniaTax: Bool
    
    var body: some View {
        Group {
            // Paycheck Data
            Section(header: Text("Most Recent Paycheck Data")) {
                CurrencyTextField("Taxable Wage (per paycheck)", value: $income.paycheckData.taxableWage)
                CurrencyTextField("Federal Withhold (per paycheck)", value: $income.paycheckData.federalWithhold)
                if includeCaliforniaTax {
                    CurrencyTextField("State Withhold (per paycheck)", value: $income.paycheckData.stateWithhold)
                }
                
                Picker("Payment Frequency", selection: $income.paycheckData.frequency) {
                    ForEach(PayFrequency.allCases, id: \.self) { frequency in
                        Text(frequency.displayName).tag(frequency)
                    }
                }
                
                DatePicker("Next Payment Date", selection: $income.paycheckData.nextPaymentDate, displayedComponents: .date)
            }
            
            // RSU Vest Data
            Section(header: Text("Most Recent RSU Vest Data")) {
                CurrencyTextField("Taxable Wage (per vest)", value: $income.rsuVestData.taxableWage)
                CurrencyTextField("Federal Withhold (per vest)", value: $income.rsuVestData.federalWithhold)
                if includeCaliforniaTax {
                    CurrencyTextField("State Withhold (per vest)", value: $income.rsuVestData.stateWithhold)
                }
                CurrencyTextField("Vest Price (per share)", value: $income.rsuVestData.vestPrice)
            }
            
            // Future RSU Vests
            Section(header: HStack {
                Text("Future RSU Vests")
                Spacer()
                Button(action: {
                    let newVest = FutureRSUVest()
                    if let lastVestPrice = income.rsuVestData.vestPrice.toDecimal() {
                        newVest.expectedPrice = String(describing: lastVestPrice)
                    }
                    income.futureRSUVests.append(newVest)
                }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.accentColor)
                }
            }) {
                ForEach(income.futureRSUVests) { vest in
                    FutureRSUVestRow(vest: vest, vests: $income.futureRSUVests)
                }
            }
        }
    }
}

struct FutureRSUVestRow: View {
    let vest: FutureRSUVest
    @Binding var vests: [FutureRSUVest]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                DatePicker("Vest Date", selection: Binding(
                    get: { vest.date },
                    set: { newDate in
                        if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                            vests[index].date = newDate
                        }
                    }
                ), displayedComponents: .date)
                
                Button(action: {
                    vests.removeAll { $0.id == vest.id }
                }) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
            }
            
            CurrencyTextField("Number of Shares", value: Binding(
                get: { vest.shares },
                set: { newValue in
                    if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                        vests[index].shares = newValue
                    }
                }
            ))
            
            CurrencyTextField("Expected Price per Share", value: Binding(
                get: { vest.expectedPrice },
                set: { newValue in
                    if let index = vests.firstIndex(where: { $0.id == vest.id }) {
                        vests[index].expectedPrice = newValue
                    }
                }
            ))
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    IncomeView()
        .environmentObject(TaxStore())
}