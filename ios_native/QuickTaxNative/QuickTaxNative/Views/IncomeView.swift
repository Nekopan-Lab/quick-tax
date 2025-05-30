import SwiftUI

struct IncomeView: View {
    @EnvironmentObject var taxStore: TaxStore
    @Environment(\.selectedTab) var mainSelectedTab
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab selector for married filing jointly
                if taxStore.filingStatus == .marriedFilingJointly {
                    HStack(spacing: 0) {
                        Button(action: { 
                            selectedTab = 0
                        }) {
                            VStack(spacing: 4) {
                                Text("You")
                                    .font(.system(size: 15, weight: selectedTab == 0 ? .semibold : .regular))
                                    .foregroundColor(selectedTab == 0 ? .blue : .secondary)
                                
                                Rectangle()
                                    .fill(selectedTab == 0 ? Color.blue : Color.clear)
                                    .frame(height: 2)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(PlainButtonStyle())
                        
                        Button(action: { 
                            selectedTab = 1
                        }) {
                            VStack(spacing: 4) {
                                Text("Spouse")
                                    .font(.system(size: 15, weight: selectedTab == 1 ? .semibold : .regular))
                                    .foregroundColor(selectedTab == 1 ? .blue : .secondary)
                                
                                Rectangle()
                                    .fill(selectedTab == 1 ? Color.blue : Color.clear)
                                    .frame(height: 2)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                    .background(Color(UIColor.systemGroupedBackground))
                }
                
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(spacing: 20) {
                            if selectedTab == 0 {
                                ModernIncomeFormView(income: $taxStore.userIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                                    .id("top")
                            } else {
                                ModernIncomeFormView(income: $taxStore.spouseIncome, includeCaliforniaTax: taxStore.includeCaliforniaTax)
                                    .id("top")
                            }
                            
                            if taxStore.filingStatus == .marriedFilingJointly && selectedTab == 0 {
                                Button(action: {
                                    selectedTab = 1
                                    withAnimation {
                                        proxy.scrollTo("top", anchor: .top)
                                    }
                                }) {
                                    HStack {
                                        Image(systemName: "person.2.fill")
                                            .font(.title3)
                                        Text("Switch to Spouse Income")
                                            .fontWeight(.medium)
                                        Spacer()
                                        Image(systemName: "arrow.right.circle.fill")
                                            .font(.title3)
                                    }
                                    .foregroundColor(.blue)
                                    .padding()
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(12)
                                }
                                .padding(.horizontal)
                            }
                            
                            // Navigation buttons
                            NavigationButtons(currentTab: 1)
                        }
                        .padding(.bottom, 20)
                    }
                    .onTapGesture {
                        // Dismiss keyboard when tapping outside text fields
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                }
                .background(Color(UIColor.systemGroupedBackground))
            }
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
                    ModernCurrencyField("Short-Term Capital Gains/Losses", value: $income.investmentIncome.shortTermGains, allowNegative: true)
                    ModernCurrencyField("Long-Term Capital Gains/Losses", value: $income.investmentIncome.longTermGains, allowNegative: true)
                }
                
                // Capital loss carryover note
                HStack {
                    Image(systemName: "info.circle")
                        .foregroundColor(.blue)
                        .font(.caption)
                    Text("If your total capital losses exceed your capital gains, you can deduct up to $3,000 against ordinary income. Any remaining losses carry forward to future years.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(10)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
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
    var allowNegative: Bool = false
    @FocusState private var isFocused: Bool
    @State private var isNegative: Bool = false
    
    init(_ label: String, value: Binding<String>, allowNegative: Bool = false) {
        self.label = label
        self._value = value
        self.allowNegative = allowNegative
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                if allowNegative {
                    Button(action: {
                        isNegative.toggle()
                        updateValueSign()
                    }) {
                        Image(systemName: isNegative ? "minus.circle.fill" : "plus.circle.fill")
                            .foregroundColor(isNegative ? .red : .green)
                            .font(.title3)
                    }
                }
                
                Text("$")
                    .foregroundColor(.secondary)
                
                TextField("0", text: Binding(
                    get: { 
                        // Remove negative sign for display
                        value.replacingOccurrences(of: "-", with: "")
                    },
                    set: { newValue in
                        // Only allow numbers
                        let filtered = newValue.filter { $0.isNumber || $0 == "." }
                        value = isNegative ? "-\(filtered)" : filtered
                    }
                ))
                    .keyboardType(.numberPad)
                    .focused($isFocused)
                    .onChange(of: value) { newValue in
                        // Update isNegative state based on value
                        if !newValue.isEmpty {
                            isNegative = newValue.hasPrefix("-")
                        }
                    }
            }
            .padding(12)
            .background(Color(UIColor.tertiarySystemFill))
            .cornerRadius(8)
        }
        .onAppear {
            // Set initial negative state based on existing value
            isNegative = value.hasPrefix("-")
        }
    }
    
    private func updateValueSign() {
        if isNegative {
            if !value.hasPrefix("-") && !value.isEmpty && value != "0" {
                value = "-" + value
            }
        } else {
            value = value.replacingOccurrences(of: "-", with: "")
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
            
            // RSU Section
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    HStack {
                        Image(systemName: "chart.bar.fill")
                        Text("RSU Income")
                            .fontWeight(.semibold)
                    }
                    .font(.subheadline)
                    Spacer()
                }
                
                // Last Vest Event (Optional)
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Most Recent RSU Vest")
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("(Optional - helps estimate future vests)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack(spacing: 12) {
                        ModernCurrencyField("Taxable Wage (per vest)", value: $income.rsuVestData.taxableWage)
                        ModernCurrencyField("Federal Withhold (per vest)", value: $income.rsuVestData.federalWithhold)
                        if includeCaliforniaTax {
                            ModernCurrencyField("State Withhold (per vest)", value: $income.rsuVestData.stateWithhold)
                        }
                        ModernCurrencyField("Vest Price (per share)", value: $income.rsuVestData.vestPrice)
                    }
                }
                
                Divider()
                
                // Future RSU Vests
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Future RSU Vests")
                            .font(.caption)
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
                        ModernRSUVestRow(vest: vest, vests: $income.futureRSUVests, income: income, includeCaliforniaTax: includeCaliforniaTax)
                    }
                    
                    if income.futureRSUVests.isEmpty {
                        Text("No future RSU vests added")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                    }
                }
            }
            .padding()
            .background(Color(UIColor.systemBackground))
            .cornerRadius(10)
        }
    }
}

struct ModernRSUVestRow: View {
    let vest: FutureRSUVest
    @Binding var vests: [FutureRSUVest]
    let income: IncomeData
    let includeCaliforniaTax: Bool
    
    var vestValue: Decimal {
        let shares = Decimal(string: vest.shares) ?? 0
        let price = Decimal(string: vest.expectedPrice) ?? 0
        return shares * price
    }
    
    var federalWithholding: (amount: Decimal, rate: Decimal) {
        let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
        let rsuVestFederal = income.rsuVestData.federalWithhold.toDecimal() ?? 0
        
        let rate = rsuVestWage > 0 ? rsuVestFederal / rsuVestWage : Decimal(0.24)
        return (vestValue * rate, rate)
    }
    
    var stateWithholding: (amount: Decimal, rate: Decimal) {
        let rsuVestWage = income.rsuVestData.taxableWage.toDecimal() ?? 0
        let rsuVestState = income.rsuVestData.stateWithhold.toDecimal() ?? 0
        
        let rate = rsuVestWage > 0 ? rsuVestState / rsuVestWage : Decimal(0.10)
        return (vestValue * rate, rate)
    }
    
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
            
            // Show calculated values
            if vestValue > 0 {
                VStack(spacing: 6) {
                    HStack {
                        Text("Estimated Value:")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: vestValue)) ?? "$0")
                            .font(.caption2)
                            .fontWeight(.medium)
                    }
                    
                    HStack {
                        Text("Fed Withhold:")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: federalWithholding.amount)) ?? "$0") (\(String(format: "%.1f", NSDecimalNumber(decimal: federalWithholding.rate * 100).doubleValue))%)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    if includeCaliforniaTax {
                        HStack {
                            Text("CA Withhold:")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text("\(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: stateWithholding.amount)) ?? "$0") (\(String(format: "%.1f", NSDecimalNumber(decimal: stateWithholding.rate * 100).doubleValue))%)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
                .background(Color(UIColor.tertiarySystemFill).opacity(0.5))
                .cornerRadius(6)
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