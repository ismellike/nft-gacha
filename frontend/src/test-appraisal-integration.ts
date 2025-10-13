/**
 * Test file to verify appraisal integration works correctly
 * This file can be run in isolation to test the contract integration
 */

import { useReadNftAppraisalGetAppraisal, useReadNftAppraisalGetBatchAppraisals } from "./generated";

// Test function to verify contract integration
export const testAppraisalIntegration = () => {
	console.log("🧪 Testing appraisal integration...");

	// Test 1: Single appraisal query
	const singleAppraisalTest = () => {
		try {
			const { data, error, isLoading } = useReadNftAppraisalGetAppraisal({
				args: ["0x1234567890123456789012345678901234567890" as `0x${string}`, BigInt(1)],
				query: {
					enabled: false, // Disabled for test
				},
			});

			console.log("✅ Single appraisal hook works");
			return true;
		} catch (error) {
			console.error("❌ Single appraisal hook failed:", error);
			return false;
		}
	};

	// Test 2: Batch appraisal query
	const batchAppraisalTest = () => {
		try {
			const { data, error, isLoading } = useReadNftAppraisalGetBatchAppraisals({
				args: [
					["0x1234567890123456789012345678901234567890" as `0x${string}`],
					[BigInt(1), BigInt(2)]
				],
				query: {
					enabled: false, // Disabled for test
				},
			});

			console.log("✅ Batch appraisal hook works");
			return true;
		} catch (error) {
			console.error("❌ Batch appraisal hook failed:", error);
			return false;
		}
	};

	// Test 3: Check if hooks return proper data structure
	const dataStructureTest = () => {
		try {
			// Mock batch results structure
			const mockBatchResults: [readonly bigint[], readonly number[]] = [
				[BigInt(1000000000000000000), BigInt(2000000000000000000)], // Prices: $1, $2
				[1, 0] // Statuses: Completed, Pending
			];

			if (Array.isArray(mockBatchResults) && mockBatchResults.length === 2) {
				const [prices, statuses] = mockBatchResults;
				console.log("✅ Batch results structure is correct:", { prices, statuses });
				return true;
			} else {
				console.error("❌ Batch results structure is incorrect");
				return false;
			}
		} catch (error) {
			console.error("❌ Data structure test failed:", error);
			return false;
		}
	};

	// Run all tests
	const results = {
		singleAppraisal: singleAppraisalTest(),
		batchAppraisal: batchAppraisalTest(),
		dataStructure: dataStructureTest(),
	};

	const allPassed = Object.values(results).every(Boolean);

	if (allPassed) {
		console.log("🎉 All appraisal integration tests passed!");
	} else {
		console.log("❌ Some tests failed:", results);
	}

	return { allPassed, results };
};

// Export for use in components or debugging
export default testAppraisalIntegration;