import SwiftUI

struct SetupView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var showDeleteAlert = false
    @State private var showPrivacySheet = false
    @State private var showDemoSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header Card
                    headerCard
                    
                    // Tax Configuration
                    VStack(spacing: 16) {
                        taxYearCard
                        filingStatusCard
                        californiaTaxCard
                    }
                    
                    // Data Management
                    dataManagementCard
                    
                    // Privacy Notice
                    privacyCard
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Tax Information")
            .navigationBarTitleDisplayMode(.large)
            .alert("Delete All Data?", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    taxStore.clearAllData()
                }
            } message: {
                Text("This will permanently delete all your saved tax data. This action cannot be undone.")
            }
            .sheet(isPresented: $showPrivacySheet) {
                PrivacySheetView()
            }
            .sheet(isPresented: $showDemoSheet) {
                DemoSheetView(taxStore: taxStore)
            }
        }
        .onChange(of: taxStore.filingStatus) { _ in taxStore.saveData() }
        .onChange(of: taxStore.taxYear) { _ in taxStore.saveData() }
        .onChange(of: taxStore.includeCaliforniaTax) { _ in taxStore.saveData() }
    }
    
    // MARK: - Header Card
    var headerCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.orange)
            
            Text("Important Notice")
                .font(.headline)
            
            Text("This tool provides tax estimates only. It is not a substitute for professional tax advice or preparation.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.orange.opacity(0.1))
        .cornerRadius(16)
    }
    
    // MARK: - Tax Year Card
    var taxYearCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Tax Year", systemImage: "calendar")
                .font(.headline)
            
            Menu {
                ForEach(TaxYear.allCases, id: \.self) { year in
                    Button(action: { taxStore.taxYear = year }) {
                        Label(year.displayName, systemImage: taxStore.taxYear == year ? "checkmark" : "")
                    }
                }
            } label: {
                HStack {
                    Text(taxStore.taxYear.displayName)
                        .foregroundColor(.primary)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(UIColor.tertiarySystemFill))
                .cornerRadius(10)
            }
        }
        .cardStyle()
    }
    
    // MARK: - Filing Status Card
    var filingStatusCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Filing Status", systemImage: "person.2")
                .font(.headline)
            
            VStack(spacing: 12) {
                ForEach(FilingStatus.allCases, id: \.self) { status in
                    Button(action: { taxStore.filingStatus = status }) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(status.displayName)
                                    .font(.subheadline)
                                    .foregroundColor(.primary)
                                
                                Text(status == .single ? "For unmarried individuals" : "For married couples filing together")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            if taxStore.filingStatus == status {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.accentColor)
                            }
                        }
                        .padding()
                        .background(
                            taxStore.filingStatus == status ?
                            Color.accentColor.opacity(0.1) :
                            Color(UIColor.tertiarySystemFill)
                        )
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(
                                    taxStore.filingStatus == status ? Color.accentColor : Color.clear,
                                    lineWidth: 2
                                )
                        )
                    }
                }
            }
        }
        .cardStyle()
    }
    
    // MARK: - California Tax Card
    var californiaTaxCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("California State Tax", systemImage: "star.circle")
                    .font(.headline)
                Spacer()
                Toggle("", isOn: $taxStore.includeCaliforniaTax)
                    .labelsHidden()
            }
            
            Text("Include California state tax calculations")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .cardStyle()
    }
    
    // MARK: - Data Management Card
    var dataManagementCard: some View {
        VStack(spacing: 12) {
            HStack {
                Label("Data Management", systemImage: "folder")
                    .font(.headline)
                Spacer()
            }
            
            VStack(spacing: 12) {
                Button(action: { showDemoSheet = true }) {
                    Label("Load Demo", systemImage: "play.circle")
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.purple)
                        .cornerRadius(10)
                }
                
                
                Button(action: { showDeleteAlert = true }) {
                    Label("Delete All Data", systemImage: "trash")
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .cornerRadius(10)
                }
            }
        }
        .cardStyle()
    }
    
    // MARK: - Privacy Card
    var privacyCard: some View {
        Button(action: { showPrivacySheet = true }) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Your Data is Private", systemImage: "lock.shield.fill")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text("All data stored locally on your device")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .cardStyle()
        }
    }
}

// MARK: - Card Style Modifier
struct CardStyleModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .cornerRadius(12)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyleModifier())
    }
}

// MARK: - Privacy Sheet
struct PrivacySheetView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.accentColor)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical)
                    
                    Text("Your Privacy is Paramount")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("All data entered into Quick Tax is stored only on your local device and is never sent to our servers.")
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    VStack(spacing: 16) {
                        PrivacyFeature(
                            icon: "iphone",
                            title: "Local Storage Only",
                            description: "Your data never leaves your device"
                        )
                        
                        PrivacyFeature(
                            icon: "arrow.clockwise",
                            title: "Resume Anytime",
                            description: "Pick up where you left off"
                        )
                        
                        PrivacyFeature(
                            icon: "trash",
                            title: "Full Control",
                            description: "Delete all data with one tap"
                        )
                        
                        PrivacyFeature(
                            icon: "wifi.slash",
                            title: "No Internet Required",
                            description: "Works completely offline"
                        )
                    }
                    .padding(.top)
                }
                .padding()
            }
            .navigationTitle("Privacy Policy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct PrivacyFeature: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.accentColor)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Demo Sheet
struct DemoSheetView: View {
    @Environment(\.dismiss) var dismiss
    let taxStore: TaxStore
    
    var demoDescription: String {
        """
This demo shows a moderate income household:

• Combined household income: ~$300,000
• User has $130k base salary + RSUs, Spouse has $100k base salary
• Modest home with $22,000 total itemized deductions
• Uses federal standard deduction ($30,000) but CA itemized ($22,000)
• Low withholding rates (15% federal, 5% state) result in taxes owed
• Made minimal Q1 federal payment ($500), no CA payments yet
• Demonstrates need for estimated tax payments

You can modify any of these values to match your situation, or clear all data to start fresh.
"""
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.purple)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical)
                    
                    Text("Load Demo Data")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(demoDescription)
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Demo Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Load Demo") {
                        loadDemoData()
                        dismiss()
                    }
                    .font(.headline)
                    .foregroundColor(.purple)
                }
            }
        }
    }
    
    func loadDemoData() {
        // Set filing status and tax preferences
        taxStore.filingStatus = .marriedFilingJointly
        taxStore.includeCaliforniaTax = true
        
        // Calculate next biweekly paydate (assuming Friday paydays)
        let nextBiweeklyPaydate = getNextBiweeklyPaydate()
        
        // User Income
        taxStore.userIncome = IncomeData(
            // Investment Income
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1500",
                qualifiedDividends: "1200",
                interestIncome: "800",
                shortTermGains: "500",
                longTermGains: "3000"
            ),
            // YTD W2 Income
            ytdW2Income: W2Income(
                taxableWage: "50000",
                federalWithhold: "7500",
                stateWithhold: "2500"
            ),
            // Future Income Mode
            incomeMode: .detailed,
            // Future Income (Simple mode - not used)
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            // Paycheck Data
            paycheckData: PaycheckData(
                taxableWage: "5000",
                federalWithhold: "750",
                stateWithhold: "250",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            // RSU Vest Data
            rsuVestData: RSUVestData(
                taxableWage: "15000",
                federalWithhold: "2250",
                stateWithhold: "750",
                vestPrice: "150"
            ),
            // Future RSU Vests
            futureRSUVests: [
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 8, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                ),
                FutureRSUVest(
                    date: Calendar.current.date(from: DateComponents(year: 2025, month: 11, day: 15)) ?? Date(),
                    shares: "200",
                    expectedPrice: "150"
                )
            ]
        )
        
        // Spouse Income
        taxStore.spouseIncome = IncomeData(
            // Investment Income
            investmentIncome: InvestmentIncome(
                ordinaryDividends: "1000",
                qualifiedDividends: "800",
                interestIncome: "600",
                shortTermGains: "0",
                longTermGains: "2000"
            ),
            // YTD W2 Income
            ytdW2Income: W2Income(
                taxableWage: "40000",
                federalWithhold: "6000",
                stateWithhold: "2000"
            ),
            // Future Income Mode
            incomeMode: .detailed,
            // Future Income (Simple mode - not used)
            futureIncome: W2Income(
                taxableWage: "",
                federalWithhold: "",
                stateWithhold: ""
            ),
            // Paycheck Data
            paycheckData: PaycheckData(
                taxableWage: "3846",
                federalWithhold: "577",
                stateWithhold: "192",
                frequency: .biweekly,
                nextPaymentDate: nextBiweeklyPaydate
            ),
            // RSU Vest Data
            rsuVestData: RSUVestData(
                taxableWage: "0",
                federalWithhold: "0",
                stateWithhold: "0",
                vestPrice: ""
            ),
            // Future RSU Vests
            futureRSUVests: []
        )
        
        // Deductions
        taxStore.deductions = DeductionsData(
            propertyTax: "8000",
            mortgageInterest: "12000",
            donations: "2000",
            mortgageLoanDate: .afterDec152017,
            mortgageBalance: "400000",
            otherStateIncomeTax: "0"
        )
        
        // Estimated Payments
        taxStore.estimatedPayments = EstimatedPaymentsData(
            federalQ1: "500",
            federalQ2: "0",
            federalQ3: "0",
            federalQ4: "0",
            californiaQ1: "0",
            californiaQ2: "0",
            californiaQ4: "0"
        )
        
        // Save the demo data
        taxStore.saveData()
    }
    
    private func getNextBiweeklyPaydate() -> Date {
        let calendar = Calendar.current
        var date = Date()
        
        // Find next Friday
        while calendar.component(.weekday, from: date) != 6 { // Friday = 6
            date = calendar.date(byAdding: .day, value: 1, to: date) ?? date
        }
        
        // If we're past this Friday, go to next Friday
        if date <= Date() {
            date = calendar.date(byAdding: .day, value: 7, to: date) ?? date
        }
        
        return date
    }
}

#Preview {
    SetupView()
        .environmentObject(TaxStore())
}