import { enrichLeadData } from "./lib/ai/enrichment";
import { sendLeadNotificationEmail } from "./lib/mail";

async function runTest() {
    console.log("Testing Lead Enrichment (The Spy)...");
    const leadEmail = "sam@openai.com";
    const leadName = "Sam Altman";

    console.log(`Enriching data for: ${leadName} <${leadEmail}>`);
    const enrichment = await enrichLeadData(leadEmail, leadName);
    console.log("Enrichment Result:", JSON.stringify(enrichment, null, 2));

    console.log("\nTesting Mail Sending...");
    await sendLeadNotificationEmail(
        "rep.ai.ai1010@gmail.com", // sending to the test email
        {
            name: leadName,
            email: leadEmail,
            projectDetails: "Looking to build a large language model.",
            budget: "$1B+",
        },
        "Test Script",
        enrichment
    );
    console.log("Mail sent successfully.");
}

runTest().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
