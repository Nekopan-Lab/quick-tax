// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "QuickTaxNative",
    platforms: [
        .iOS(.v15)
    ],
    dependencies: [
        // Charts for beautiful data visualization
        .package(url: "https://github.com/danielgindi/Charts.git", from: "5.1.0"),
        // Lottie for animations
        .package(url: "https://github.com/airbnb/lottie-ios.git", from: "4.3.4"),
        // SwiftUIX for additional UI components
        .package(url: "https://github.com/SwiftUIX/SwiftUIX.git", from: "0.1.5"),
        // PopupView for modern popups and tooltips
        .package(url: "https://github.com/exyte/PopupView.git", from: "2.8.2")
    ],
    targets: [
        .target(
            name: "QuickTaxNative",
            dependencies: [
                "Charts",
                .product(name: "Lottie", package: "lottie-ios"),
                "SwiftUIX",
                "PopupView"
            ]
        )
    ]
)