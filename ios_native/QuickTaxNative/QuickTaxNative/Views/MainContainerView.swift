import SwiftUI

struct MainContainerView: View {
    @StateObject private var taxStore = TaxStore()
    @State private var selectedTab = 0
    @State private var taxResult: TaxCalculationResult?
    
    var body: some View {
        VStack(spacing: 0) {
            // Persistent Header
            persistentHeader
            
            // Custom Navigation Bar
            customNavigationBar
            
            // Content Area
            contentView
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Color(UIColor.systemGroupedBackground))
        .environmentObject(taxStore)
        .environment(\.selectedTab, $selectedTab)
        .onReceive(NotificationCenter.default.publisher(for: .taxDataChanged)) { _ in
            calculateTaxes()
        }
        .onAppear {
            calculateTaxes()
        }
    }
    
    var persistentHeader: some View {
        VStack(spacing: 0) {
            // App Title
            Text("QuickTax")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .padding(.top, 10)
                .padding(.bottom, 5)
            
            // Tax Status Header
            HStack(spacing: 20) {
                // Federal Tax Status
                VStack(spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "flag.fill")
                            .font(.caption)
                            .foregroundColor(.blue)
                        Text("Federal")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    if let result = taxResult {
                        let federalOwed = result.federalTax.owedOrRefund
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(federalOwed))) ?? "$0")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(federalOwed > 0 ? .red : .green)
                        Text(federalOwed > 0 ? "Owed" : "Overpaid")
                            .font(.caption2)
                            .foregroundColor(federalOwed > 0 ? .red : .green)
                    } else {
                        Text("$0")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.secondary)
                        Text("—")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                
                // Divider
                Rectangle()
                    .fill(Color.secondary.opacity(0.3))
                    .frame(width: 1, height: 50)
                
                // California Tax Status
                VStack(spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Text("California")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    if let result = taxResult, taxStore.includeCaliforniaTax, let caTax = result.californiaTax {
                        let caOwed = caTax.owedOrRefund
                        Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(caOwed))) ?? "$0")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(caOwed > 0 ? .red : .green)
                        Text(caOwed > 0 ? "Owed" : "Overpaid")
                            .font(.caption2)
                            .foregroundColor(caOwed > 0 ? .red : .green)
                    } else if taxStore.includeCaliforniaTax {
                        Text("$0")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.secondary)
                        Text("—")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    } else {
                        Text("N/A")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.secondary)
                        Text("Not Selected")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(
                Color(UIColor.secondarySystemBackground)
                    .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
            )
        }
    }
    
    var customNavigationBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(0..<5) { index in
                    Button(action: { selectedTab = index }) {
                        Text(tabTitle(for: index))
                            .font(.system(size: 14, weight: selectedTab == index ? .semibold : .regular))
                            .foregroundColor(selectedTab == index ? .white : .primary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(
                                Capsule()
                                    .fill(selectedTab == index ? Color.blue : Color(UIColor.secondarySystemFill))
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color(UIColor.systemBackground))
    }
    
    @ViewBuilder
    var contentView: some View {
        switch selectedTab {
        case 0:
            SetupView()
                .navigationBarHidden(true)
        case 1:
            IncomeView()
                .navigationBarHidden(true)
        case 2:
            DeductionsView()
                .navigationBarHidden(true)
        case 3:
            EstimatedPaymentsView()
                .navigationBarHidden(true)
        case 4:
            SummaryView()
                .navigationBarHidden(true)
        default:
            SetupView()
                .navigationBarHidden(true)
        }
    }
    
    func tabIcon(for index: Int) -> String {
        switch index {
        case 0: return "info.circle"
        case 1: return "dollarsign.circle"
        case 2: return "doc.text"
        case 3: return "calendar"
        case 4: return "chart.pie"
        default: return "questionmark"
        }
    }
    
    func tabTitle(for index: Int) -> String {
        switch index {
        case 0: return "Tax Info"
        case 1: return "Income"
        case 2: return "Deductions"
        case 3: return "Payments"
        case 4: return "Summary"
        default: return "Unknown"
        }
    }
    
    func calculateTaxes() {
        let result = TaxOrchestrator.calculateTaxes(store: taxStore)
        self.taxResult = result
    }
}

extension Notification.Name {
    static let taxDataChanged = Notification.Name("taxDataChanged")
}

#Preview {
    MainContainerView()
}