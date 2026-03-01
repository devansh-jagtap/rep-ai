import nodemailer from "nodemailer";

export async function sendLeadNotificationEmail(
    toEmail: string,
    leadDetails: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        budget?: string | null;
        meetingTime?: string | null;
        projectDetails?: string | null;
    },
    sourceName?: string | null
) {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.warn("SMTP credentials not configured. Skipping lead notification email.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    const textContent = `
A new lead has been captured by your AI agent!
${sourceName ? `Source: ${sourceName}\n` : ""}
Contact Information:
-----------------------------
Name: ${leadDetails.name || "N/A"}
Email: ${leadDetails.email || "N/A"}
Phone: ${leadDetails.phone || "N/A"}

Additional Details:
-----------------------------
Budget: ${leadDetails.budget || "N/A"}
Meeting Time: ${leadDetails.meetingTime || "N/A"}

Project Details:
-----------------------------
${leadDetails.projectDetails || "N/A"}

Log in to your dashboard to view the full conversation and manage this lead.
`;

    const htmlContent = `
    <h2>New Lead Captured - Rep AI</h2>
    <p>A new lead has been captured by your AI agent!</p>
    ${sourceName ? `<h4>Source: <strong>${sourceName}</strong></h4>` : ""}
    <h3>Contact Information:</h3>
    <ul>
      <li><strong>Name:</strong> ${leadDetails.name || "N/A"}</li>
      <li><strong>Email:</strong> ${leadDetails.email || "N/A"}</li>
      <li><strong>Phone:</strong> ${leadDetails.phone || "N/A"}</li>
    </ul>
    <h3>Additional Details:</h3>
    <ul>
      <li><strong>Budget:</strong> ${leadDetails.budget || "N/A"}</li>
      <li><strong>Meeting Time:</strong> ${leadDetails.meetingTime || "N/A"}</li>
    </ul>
    <h3>Project Details:</h3>
    <p>${leadDetails.projectDetails || "N/A"}</p>
    <p><br><em>Log in to your dashboard to view the full conversation and manage this lead.</em></p>
  `;

    const mailOptions = {
        from: `"Rep AI Notification" <${EMAIL_USER}>`,
        to: toEmail,
        subject: sourceName ? `New Lead Captured from ${sourceName}` : "New Lead Captured - Rep AI",
        text: textContent,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Lead notification email sent successfully to", toEmail);
    } catch (error) {
        console.error("Failed to send lead notification email:", error);
    }
}
