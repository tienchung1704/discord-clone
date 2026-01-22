import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendDMNotificationParams {
  toEmail: string;
  toName: string;
  fromName: string;
  fromImageUrl: string;
  conversationUrl: string;
}

export async function sendDMNotification({
  toEmail,
  toName,
  fromName,
  fromImageUrl,
  conversationUrl,
}: SendDMNotificationParams) {
  try {
    await transporter.sendMail({
      from: `"Discord Clone" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `💬 New message from ${fromName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #36393f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #36393f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #2f3136; border-radius: 8px; overflow: hidden; max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #5865F2 0%, #7289da 100%); padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">New Direct Message</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <!-- Sender Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #40444b; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="vertical-align: middle; padding-right: 16px;">
                                  <img src="${fromImageUrl}" alt="${fromName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                                </td>
                                <td style="vertical-align: middle;">
                                  <p style="color: white; margin: 0; font-weight: 600; font-size: 18px;">${fromName}</p>
                                  <p style="color: #b9bbbe; margin: 4px 0 0 0; font-size: 14px;">sent you a message</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #b9bbbe; margin: 0 0 24px 0; font-size: 14px; text-align: center;">
                        Hey <strong style="color: white;">${toName}</strong>, click below to view the conversation.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${conversationUrl}" style="display: inline-block; background: linear-gradient(135deg, #5865F2 0%, #7289da 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-weight: 600; font-size: 16px;">
                              View Conversation
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; border-top: 1px solid #40444b;">
                      <p style="color: #72767d; margin: 0; font-size: 12px; text-align: center;">
                        You received this email because you have DM notifications enabled.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[Email] DM notification sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send DM notification:", error);
    return false;
  }
}
