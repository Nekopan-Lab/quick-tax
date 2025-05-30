import SwiftUI

struct TaxInfoView: View {
    @EnvironmentObject var taxStore: TaxStore
    @Environment(\.selectedTab) var selectedTab
    @State private var showDeleteAlert = false
    @State private var showPrivacySheet = false
    @State private var showDemoSheet = false
    @State private var isAppSettingsExpanded = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Tax Configuration
                    VStack(spacing: 16) {
                        taxYearCard
                        filingStatusCard
                        californiaTaxCard
                    }
                    
                    // Navigation buttons
                    NavigationButtons(currentTab: 0)
                    
                    // App Settings & Info - Collapsible Section
                    appSettingsSection
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarHidden(true)
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
    
    // MARK: - App Settings Section
    var appSettingsSection: some View {
        VStack(spacing: 0) {
            // Collapsible Header
            Button(action: {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    isAppSettingsExpanded.toggle()
                }
            }) {
                HStack {
                    Text("App Settings & Info")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Image(systemName: isAppSettingsExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            
            // Expandable Content
            if isAppSettingsExpanded {
                VStack(spacing: 16) {
                    // Important Notice Banner
                    importantNoticeBanner
                    
                    // Data Management
                    dataManagementCard
                    
                    // Privacy Notice
                    privacyCard
                }
                .padding(.horizontal)
                .padding(.bottom, 16)
                .transition(.asymmetric(
                    insertion: .move(edge: .top).combined(with: .opacity),
                    removal: .move(edge: .top).combined(with: .opacity)
                ))
            }
        }
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
        .padding(.top, 20)
    }
    
    // MARK: - Important Notice Banner
    var importantNoticeBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.title3)
                .foregroundColor(.warning)
            
            Text("This tool provides tax estimates only. Not for professional tax advice or preparation.")
                .font(.caption)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            
            Spacer(minLength: 0)
        }
        .padding()
        .background(Color.warningBackground)
        .cornerRadius(10)
    }
    
    // MARK: - Header Card
    var headerCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.warning)
            
            Text("Important Notice")
                .font(.headline)
            
            Text("This tool provides tax estimates only. It is not a substitute for professional tax advice or preparation.")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.warningBackground)
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
                                    .foregroundColor(.emeraldGreen)
                            }
                        }
                        .padding()
                        .background(
                            taxStore.filingStatus == status ?
                            Color.selectedBackground :
                            Color(UIColor.tertiarySystemFill)
                        )
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(
                                    taxStore.filingStatus == status ? Color.selectedBorder : Color.clear,
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
                    .tint(.toggleOn)
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
                    .font(.system(size: 15, weight: .semibold))
                Spacer()
            }
            
            HStack(spacing: 12) {
                Button(action: { showDemoSheet = true }) {
                    Label("Load Demo", systemImage: "play.circle")
                        .font(.footnote)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.buttonAccent)
                        .cornerRadius(8)
                }
                
                Button(action: { showDeleteAlert = true }) {
                    Label("Delete All Data", systemImage: "trash")
                        .font(.footnote)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.buttonDanger)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(UIColor.tertiarySystemGroupedBackground))
        .cornerRadius(10)
    }
    
    // MARK: - Privacy Card
    var privacyCard: some View {
        Button(action: { showPrivacySheet = true }) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Label("Your Data is Private", systemImage: "lock.shield.fill")
                        .font(.system(size: 15, weight: .semibold))
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
            .padding()
            .background(Color(UIColor.tertiarySystemGroupedBackground))
            .cornerRadius(10)
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
                        .foregroundColor(.emeraldGreen)
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
                .foregroundColor(.emeraldGreen)
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
        DemoData.description
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.goldAccent)
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
                    .foregroundColor(.goldAccent)
                }
            }
        }
    }
    
    func loadDemoData() {
        DemoData.loadDemoData(into: taxStore)
    }
}

#Preview {
    TaxInfoView()
        .environmentObject(TaxStore())
}