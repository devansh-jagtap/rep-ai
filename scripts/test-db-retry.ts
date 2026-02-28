import { withRetry } from "../lib/db/index";

async function testRetry() {
    let attempts = 0;

    console.log("Starting test-db-retry...");

    try {
        const result = await withRetry(async () => {
            attempts++;
            console.log(`Attempt ${attempts}...`);

            if (attempts < 3) {
                console.log("Mocking ECONNRESET error");
                const error = new Error("read ECONNRESET");
                (error as any).code = "ECONNRESET";
                throw error;
            }

            return "Success after retries!";
        }, 5, 50);

        console.log("Final Result:", result);
        if (attempts === 3 && result === "Success after retries!") {
            console.log("TEST PASSED: Correctly retried 2 times and succeeded on the 3rd.");
        } else {
            console.log("TEST FAILED: Unexpected outcome.", { attempts, result });
            process.exit(1);
        }
    } catch (error) {
        console.error("TEST FAILED: Caught error", error);
        process.exit(1);
    }
}

testRetry();
