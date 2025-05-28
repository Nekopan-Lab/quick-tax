import UIKit
import WebKit

class ViewController: UIViewController {
    
    private var webView: WKWebView!
    private var progressView: UIProgressView!
    
    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        // Add user script to intercept window.print()
        let printScript = """
            window.print = function() {
                window.webkit.messageHandlers.printHandler.postMessage('print');
            }
        """
        let userScript = WKUserScript(source: printScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webConfiguration.userContentController.addUserScript(userScript)
        
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        
        // Add message handler for print
        webConfiguration.userContentController.add(self, name: "printHandler")
        
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupProgressView()
        loadLocalHTML()
        
        // Observe loading progress
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)
    }
    
    private func setupProgressView() {
        progressView = UIProgressView(progressViewStyle: .default)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(progressView)
        
        NSLayoutConstraint.activate([
            progressView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progressView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            progressView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progressView.heightAnchor.constraint(equalToConstant: 2.0)
        ])
    }
    
    private func loadLocalHTML() {
        guard let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "WebResources") else {
            showError("Could not find index.html in app bundle")
            return
        }
        
        let htmlUrl = URL(fileURLWithPath: htmlPath)
        let baseUrl = htmlUrl.deletingLastPathComponent()
        
        print("Loading HTML from: \(htmlUrl)")
        print("Base URL: \(baseUrl)")
        
        // Enable JavaScript
        webView.configuration.preferences.javaScriptEnabled = true
        
        // For debugging
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        
        webView.loadFileURL(htmlUrl, allowingReadAccessTo: baseUrl)
    }
    
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == "estimatedProgress" {
            progressView.progress = Float(webView.estimatedProgress)
            progressView.isHidden = webView.estimatedProgress >= 1.0
        }
    }
    
    deinit {
        webView.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
    }
}

// MARK: - WKNavigationDelegate
extension ViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        progressView.isHidden = true
        
        // Log any console messages for debugging
        webView.evaluateJavaScript("console.log('WebView loaded successfully')") { _, _ in }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        showError("Failed to load: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        showError("Failed to start loading: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Allow all navigation
        decisionHandler(.allow)
    }
}

// MARK: - WKUIDelegate
extension ViewController: WKUIDelegate {
}

// MARK: - WKScriptMessageHandler
extension ViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "printHandler" {
            printWebView()
        }
    }
    
    private func printWebView() {
        let printController = UIPrintInteractionController.shared
        
        let printInfo = UIPrintInfo(dictionary: nil)
        printInfo.outputType = .general
        printInfo.jobName = "QuickTax Report"
        
        printController.printInfo = printInfo
        printController.printFormatter = webView.viewPrintFormatter()
        
        printController.present(animated: true) { (controller, completed, error) in
            if completed {
                print("Print completed")
            } else if let error = error {
                print("Print failed: \(error.localizedDescription)")
            } else {
                print("Print cancelled")
            }
        }
    }
}