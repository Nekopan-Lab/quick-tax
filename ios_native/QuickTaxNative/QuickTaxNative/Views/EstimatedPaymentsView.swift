import SwiftUI

struct EstimatedPaymentsView: View {
    @EnvironmentObject var taxStore: TaxStore
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Federal Estimated Tax Payments (YTD)"), footer: federalPaymentSchedule) {
                    CurrencyTextField("Q1 Payment (Due April 15)", value: $taxStore.estimatedPayments.federalQ1)
                    CurrencyTextField("Q2 Payment (Due June 16)", value: $taxStore.estimatedPayments.federalQ2)
                    CurrencyTextField("Q3 Payment (Due September 15)", value: $taxStore.estimatedPayments.federalQ3)
                    CurrencyTextField("Q4 Payment (Due January 15, 2026)", value: $taxStore.estimatedPayments.federalQ4)
                }
                
                if taxStore.includeCaliforniaTax {
                    Section(header: Text("California Estimated Tax Payments (YTD)"), footer: californiaPaymentSchedule) {
                        CurrencyTextField("Q1 Payment (Due April 15)", value: $taxStore.estimatedPayments.californiaQ1)
                        CurrencyTextField("Q2 Payment (Due June 16)", value: $taxStore.estimatedPayments.californiaQ2)
                        CurrencyTextField("Q4 Payment (Due January 15, 2026)", value: $taxStore.estimatedPayments.californiaQ4)
                    }
                }
                
                Section(header: Text("Total Payments Made")) {
                    HStack {
                        Text("Federal Total")
                        Spacer()
                        Text(formatTotal(federalTotal))
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                    }
                    
                    if taxStore.includeCaliforniaTax {
                        HStack {
                            Text("California Total")
                            Spacer()
                            Text(formatTotal(californiaTotal))
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                        }
                    }
                }
            }
            .navigationTitle("Estimated Payments")
            .onChange(of: taxStore.estimatedPayments) { _ in
                taxStore.saveData()
            }
        }
    }
    
    var federalTotal: Decimal {
        let q1 = taxStore.estimatedPayments.federalQ1.toDecimal() ?? 0
        let q2 = taxStore.estimatedPayments.federalQ2.toDecimal() ?? 0
        let q3 = taxStore.estimatedPayments.federalQ3.toDecimal() ?? 0
        let q4 = taxStore.estimatedPayments.federalQ4.toDecimal() ?? 0
        return q1 + q2 + q3 + q4
    }
    
    var californiaTotal: Decimal {
        let q1 = taxStore.estimatedPayments.californiaQ1.toDecimal() ?? 0
        let q2 = taxStore.estimatedPayments.californiaQ2.toDecimal() ?? 0
        let q4 = taxStore.estimatedPayments.californiaQ4.toDecimal() ?? 0
        return q1 + q2 + q4
    }
    
    func formatTotal(_ amount: Decimal) -> String {
        return NumberFormatter.currencyWholeNumber.string(from: amount as NSNumber) ?? "$0"
    }
    
    var federalPaymentSchedule: some View {
        Text("Federal estimated tax payments are due quarterly throughout the year.")
            .font(.caption)
            .foregroundColor(.secondary)
    }
    
    var californiaPaymentSchedule: some View {
        Text("California has 3 payment dates (no Q3 payment). The payments should be: Q1 (30%), Q2 (40%), Q4 (30%) of your total estimated tax.")
            .font(.caption)
            .foregroundColor(.secondary)
    }
}

#Preview {
    EstimatedPaymentsView()
        .environmentObject(TaxStore())
}