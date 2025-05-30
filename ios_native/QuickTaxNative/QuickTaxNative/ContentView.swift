import SwiftUI

struct ContentView: View {
    @EnvironmentObject var taxStore: TaxStore
    
    var body: some View {
        TabView(selection: $taxStore.currentStep) {
            SetupView()
                .tabItem {
                    Label("Setup", systemImage: "gear")
                }
                .tag(0)
            
            IncomeView()
                .tabItem {
                    Label("Income", systemImage: "dollarsign.circle")
                }
                .tag(1)
            
            DeductionsView()
                .tabItem {
                    Label("Deductions", systemImage: "minus.circle")
                }
                .tag(2)
            
            EstimatedPaymentsView()
                .tabItem {
                    Label("Payments", systemImage: "calendar.badge.plus")
                }
                .tag(3)
            
            SummaryView()
                .tabItem {
                    Label("Summary", systemImage: "doc.text")
                }
                .tag(4)
        }
        .onAppear {
            // Save data when view appears
            taxStore.saveData()
        }
        .onChange(of: taxStore.currentStep) { _ in
            // Save data when step changes
            taxStore.saveData()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(TaxStore())
}