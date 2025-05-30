import SwiftUI

struct ContentView: View {
    @StateObject private var taxStore = TaxStore()
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            SetupView()
                .tabItem {
                    Label("Tax Info", systemImage: "info.circle.fill")
                }
                .tag(0)
            
            IncomeView()
                .tabItem {
                    Label("Income", systemImage: "dollarsign.circle")
                }
                .tag(1)
            
            DeductionsView()
                .tabItem {
                    Label("Deductions", systemImage: "doc.text")
                }
                .tag(2)
            
            EstimatedPaymentsView()
                .tabItem {
                    Label("Payments", systemImage: "calendar")
                }
                .tag(3)
            
            SummaryView()
                .tabItem {
                    Label("Summary", systemImage: "chart.pie")
                }
                .tag(4)
        }
        .environmentObject(taxStore)
        .accentColor(.blue)
    }
}

#Preview {
    ContentView()
}