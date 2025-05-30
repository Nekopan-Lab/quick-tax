import XCTest

func XCTAssertEqualWithDiff<T: Equatable>(_ expression1: @autoclosure () throws -> T, _ expression2: @autoclosure () throws -> T, _ message: @autoclosure () -> String = "", file: StaticString = #filePath, line: UInt = #line) {
    do {
        let value1 = try expression1()
        let value2 = try expression2()
        if value1 != value2 {
            XCTFail("XCTAssertEqual failed: (\"\(value1)\") is not equal to (\"\(value2)\") - \(message())", file: file, line: line)
        }
    } catch {
        XCTFail("XCTAssertEqual threw error: \(error)", file: file, line: line)
    }
}