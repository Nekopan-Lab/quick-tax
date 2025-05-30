import SwiftUI

struct CurrencyTextField: View {
    let title: String
    @Binding var value: String
    let placeholder: String
    
    init(_ title: String, value: Binding<String>, placeholder: String = "$0") {
        self.title = title
        self._value = value
        self.placeholder = placeholder
    }
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(.primary)
            
            Spacer()
            
            TextField(placeholder, text: $value)
                .multilineTextAlignment(.trailing)
                .keyboardType(.numberPad)
                .onChange(of: value) { newValue in
                    // Remove non-numeric characters except decimal point
                    let filtered = newValue.filter { $0.isNumber || $0 == "." }
                    
                    // Ensure only one decimal point
                    let parts = filtered.split(separator: ".")
                    if parts.count > 2 {
                        value = String(parts[0]) + "." + String(parts[1])
                    } else {
                        value = filtered
                    }
                }
        }
    }
}

struct CurrencyTextField_Previews: PreviewProvider {
    @State static var value = ""
    
    static var previews: some View {
        Form {
            CurrencyTextField("Salary", value: $value)
        }
    }
}