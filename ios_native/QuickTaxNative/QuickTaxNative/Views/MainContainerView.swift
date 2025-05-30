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
                .padding(.bottom, 10)
            
            // Tax Status Header
            VStack(spacing: 0) {
                HStack(spacing: 20) {
                    // Federal Tax Status
                    VStack(spacing: 4) {
                        HStack(spacing: 4) {
                            Image(systemName: "flag.fill")
                                .font(.caption)
                                .foregroundColor(.emeraldGreen)
                            Text("Federal")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if let result = taxResult {
                            let federalOwed = result.federalTax.owedOrRefund
                            Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(federalOwed))) ?? "$0")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundColor(federalOwed > 0 ? .error : .success)
                            Text(federalOwed > 0 ? "Owed" : "Overpaid")
                                .font(.caption2)
                                .foregroundColor(federalOwed > 0 ? .error : .success)
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
                                .foregroundColor(.goldAccent)
                            Text("California")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if let result = taxResult, taxStore.includeCaliforniaTax, let caTax = result.californiaTax {
                            let caOwed = caTax.owedOrRefund
                            Text(NumberFormatter.currencyWholeNumber.string(from: NSDecimalNumber(decimal: abs(caOwed))) ?? "$0")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundColor(caOwed > 0 ? .error : .success)
                            Text(caOwed > 0 ? "Owed" : "Overpaid")
                                .font(.caption2)
                                .foregroundColor(caOwed > 0 ? .error : .success)
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
            }
            .background(
                Color(UIColor.secondarySystemGroupedBackground)
                    .shadow(color: .black.opacity(0.08), radius: 3, x: 0, y: 2)
            )
        }
    }
    
    var customNavigationBar: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 0) {
                    ForEach(0..<5) { index in
                        HStack(spacing: 0) {
                            // Step indicator
                            Button(action: { selectedTab = index }) {
                                VStack(spacing: 8) {
                                    // Circle with number or checkmark
                                    ZStack {
                                        Circle()
                                            .fill(
                                                index < selectedTab ? Color.emeraldGreen :
                                                index == selectedTab ? Color.emeraldGreen :
                                                Color.gray.opacity(0.2)
                                            )
                                            .frame(width: 36, height: 36)
                                        
                                        if index == selectedTab {
                                            // Current step - outer ring
                                            Circle()
                                                .stroke(Color.emeraldGreen.opacity(0.3), lineWidth: 3)
                                                .frame(width: 44, height: 44)
                                        }
                                        
                                        if index < selectedTab {
                                            // Completed step - checkmark
                                            Image(systemName: "checkmark")
                                                .font(.system(size: 16, weight: .bold))
                                                .foregroundColor(.white)
                                        } else if index == 4 {
                                            // Summary step - special icon
                                            Image(systemName: "chart.pie.fill")
                                                .font(.system(size: 16, weight: .medium))
                                                .foregroundColor(index == selectedTab ? .white : Color.emeraldGreen)
                                        } else {
                                            // Future step - number
                                            Text("\(index + 1)")
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(
                                                    index == selectedTab ? .white : Color.primary
                                                )
                                        }
                                    }
                                    
                                    // Step label
                                    Text(tabTitle(for: index))
                                        .font(.system(size: 11, weight: index == selectedTab ? .semibold : .regular))
                                        .foregroundColor(
                                            index < selectedTab ? Color.emeraldGreen :
                                            index == selectedTab ? Color.emeraldGreen :
                                            Color.secondary
                                        )
                                        .lineLimit(1)
                                        .frame(width: 70)
                                }
                            }
                            .buttonStyle(PlainButtonStyle())
                            .id(index)
                            
                            // Connecting line (not after Summary)
                            if index < 4 {
                                Rectangle()
                                    .fill(
                                        index < selectedTab ? Color.emeraldGreen : Color.gray.opacity(0.2)
                                    )
                                    .frame(width: 20, height: 2)
                                    .offset(y: -11)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .padding(.bottom, 8)
            }
            .background(Color(UIColor.systemGroupedBackground))
            .onChange(of: selectedTab) { newValue in
                withAnimation(.easeInOut(duration: 0.3)) {
                    proxy.scrollTo(newValue, anchor: .center)
                }
            }
        }
    }
    
    @ViewBuilder
    var contentView: some View {
        switch selectedTab {
        case 0:
            TaxInfoView()
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
            TaxInfoView()
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