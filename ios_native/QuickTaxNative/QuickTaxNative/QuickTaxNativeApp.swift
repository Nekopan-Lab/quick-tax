import SwiftUI

@main
struct QuickTaxNativeApp: App {
    @StateObject private var taxStore = TaxStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(taxStore)
        }
    }
}