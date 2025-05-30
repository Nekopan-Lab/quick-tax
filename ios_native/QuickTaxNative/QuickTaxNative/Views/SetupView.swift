import SwiftUI

struct SetupView: View {
    @EnvironmentObject var taxStore: TaxStore
    @State private var showDeleteAlert = false
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                            .font(.title2)
                        
                        Text("Important Disclaimer")
                            .font(.headline)
                        
                        Text("This tool is for estimation purposes only and does not constitute professional tax advice or licensed tax preparation. Please consult a qualified tax professional for definitive guidance.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 8)
                }
                
                Section(header: Text("Tax Year")) {
                    Picker("Tax Year", selection: $taxStore.taxYear) {
                        ForEach(TaxYear.allCases, id: \.self) { year in
                            Text(year.displayName).tag(year)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section(header: Text("Filing Status")) {
                    Picker("Filing Status", selection: $taxStore.filingStatus) {
                        ForEach(FilingStatus.allCases, id: \.self) { status in
                            Text(status.displayName).tag(status)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("Tax Scope")) {
                    Toggle("Include California State Tax", isOn: $taxStore.includeCaliforniaTax)
                }
                
                Section(header: Text("Data Management")) {
                    Button(action: {
                        showDeleteAlert = true
                    }) {
                        Label("Delete All Data", systemImage: "trash")
                            .foregroundColor(.red)
                    }
                }
                
                Section(footer: privacyFooter) {
                    EmptyView()
                }
            }
            .navigationTitle("Setup")
            .alert("Delete All Data?", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    taxStore.clearAllData()
                }
            } message: {
                Text("This will permanently delete all your saved tax data. This action cannot be undone.")
            }
            .onChange(of: taxStore.filingStatus) { _ in
                taxStore.saveData()
            }
            .onChange(of: taxStore.taxYear) { _ in
                taxStore.saveData()
            }
            .onChange(of: taxStore.includeCaliforniaTax) { _ in
                taxStore.saveData()
            }
        }
    }
    
    var privacyFooter: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Privacy Notice", systemImage: "lock.fill")
                .font(.footnote)
                .fontWeight(.semibold)
            
            Text("Your privacy is paramount. All data entered into Quick Tax is stored only on your local device and is never sent to our servers. This allows you to pick up where you left off or update your estimates throughout the year.")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SetupView()
        .environmentObject(TaxStore())
}