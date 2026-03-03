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
        website?: string | null;
    },
    sourceName?: string | null
) {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    console.log("[Mail] Preparing lead notification email", {
        toEmail,
        sourceName: sourceName || "N/A",
        hasLeadName: Boolean(leadDetails.name),
        hasLeadEmail: Boolean(leadDetails.email),
        hasProjectDetails: Boolean(leadDetails.projectDetails),
    });

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error("[Mail] Missing SMTP configuration", {
            hasEmailUser: Boolean(EMAIL_USER),
            hasEmailPass: Boolean(EMAIL_PASS),
        });
        throw new Error("SMTP credentials not configured. Set EMAIL_USER and EMAIL_PASS.");
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
Website: ${leadDetails.website || "N/A"}
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
      <li><strong>Website:</strong> ${leadDetails.website ? `<a href="${leadDetails.website.startsWith('http') ? leadDetails.website : `https://${leadDetails.website}`}">${leadDetails.website}</a>` : "N/A"}</li>
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

    console.log("[Mail] Sending email via Nodemailer", {
        service: "gmail",
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
    });

    const sendResult = await transporter.sendMail(mailOptions);
    console.log("[Mail] Lead notification email sent successfully", {
        toEmail,
        messageId: sendResult.messageId,
        accepted: sendResult.accepted,
        rejected: sendResult.rejected,
        response: sendResult.response,
    });
}
