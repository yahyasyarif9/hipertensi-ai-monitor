import { checkDataMaturity } from "./src/modules/ai/data-maturity.js";

const testCases = [
    { hari: 6, expected: "umum" },
    { hari: 8, expected: "umum" },
    { hari: 13, expected: "umum" },
    { hari: 14, expected: "tren" },
    { hari: 28, expected: "tren" },
    { hari: 30, expected: "tren" },
    { hari: 31, expected: "personal" }
];

console.log("=== TEST DATA MATURITY ===");

for (const test of testCases) {
    const readings = Array.from(
        { length: test.hari },
        (_, index) => ({
            waktu: new Date(
                Date.UTC(2026, 0, 1 + index)
            )
        })
    );

    const result = checkDataMaturity(readings);

    const passed = result.fase === test.expected;

    console.log({
        rentang_hari: test.hari,
        expected: test.expected,
        actual: result.fase,
        status: passed ? "PASS" : "FAIL"
    });
}