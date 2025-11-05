// src/services/emailTemplates.ts
// Email-safe HTML template generator for sending credentials
// Uses inline CSS and table-based layout for broad client support.

export type CredentialsEmailParams = {
  recipientName?: string;
  identifier: string; // email or username
  defaultPassword?: string; // defaults to hardcoded value
  appName?: string;
  portalUrl?: string;
  supportEmail?: string;
  companyName?: string;
  logoUrl?: string; // optional hosted logo URL for emails
};

const DEFAULT_PASSWORD = "Nisaa@123"; // Hardcoded as requested

export function buildCredentialsEmail({
  recipientName = "there",
  identifier,
  defaultPassword = DEFAULT_PASSWORD,
  appName = "NISAA Admin",
  portalUrl = "https://portal.example.com",
  supportEmail = "support@example.com",
  companyName = "NISAA",
  logoUrl,
}: CredentialsEmailParams): string {
  const preheader = `Your ${appName} access details`;

  const safe = (v: string) => String(v ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${safe(appName)} Credentials</title>
    <style>
      /* Fallback styles for some clients */
      @media (prefers-color-scheme: dark) {
        .card { background: #0b1220 !important; }
        .text { color: #e5e7eb !important; }
        .muted { color: #9ca3af !important; }
        .kbd { background: #111827 !important; border-color: #374151 !important; color: #f3f4f6 !important; }
        .btn { background: #2563eb !important; }
      }
      a { color: #2563eb; text-decoration: none; }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f3f4f6; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,'Noto Sans','Helvetica Neue',sans-serif;">
    <span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">${safe(preheader)}</span>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6; padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;">
            <tr>
              <td style="padding: 16px 0; text-align:center;">
                ${logoUrl ? `<img src="${safe(logoUrl)}" alt="${safe(companyName)}" width="56" height="56" style="border-radius:12px; display:inline-block;"/>` : `<div style="display:inline-block;width:56px;height:56px;border-radius:12px;background:#2563eb;color:#fff;font-weight:700;line-height:56px;text-align:center;">${safe(companyName)[0] ?? 'N'}</div>`}
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
                  <tr>
                    <td style="padding:24px 24px 8px 24px;">
                      <h1 class="text" style="margin:0;font-size:20px;line-height:28px;color:#111827;">Welcome to ${safe(appName)}, ${safe(recipientName)} 👋</h1>
                      <p class="muted" style="margin:8px 0 0 0;font-size:14px;line-height:20px;color:#6b7280;">Here are your sign-in details. For security, please change your password after your first login.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 24px 0 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                        <tr>
                          <td style="padding:16px 16px 8px 16px;">
                            <p class="muted" style="margin:0 0 4px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">Login Identifier</p>
                            <div class="kbd" style="display:inline-block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${safe(identifier)}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 16px 16px 16px;">
                            <p class="muted" style="margin:0 0 4px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">Temporary Password</p>
                            <div class="kbd" style="display:inline-block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${safe(defaultPassword)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding-top:8px;">
                            <a href="${safe(portalUrl)}" class="btn" style="display:inline-block;background:#2563eb;color:#ffffff;border-radius:10px;padding:12px 18px;font-weight:600;font-size:14px;">Sign in to ${safe(appName)}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 24px 20px 24px;">
                      <p class="muted" style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">Tip: If you didn’t request this, please contact us at <a href="mailto:${safe(supportEmail)}">${safe(supportEmail)}</a>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0; text-align:center;">
                <p class="muted" style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${safe(companyName)}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildCredentialsText({
  recipientName = "there",
  identifier,
  defaultPassword = DEFAULT_PASSWORD,
  appName = "NISAA Admin",
  portalUrl = "https://portal.example.com",
  supportEmail = "support@example.com",
  companyName = "NISAA",
}: CredentialsEmailParams): string {
  return [
    `Hi ${recipientName},`,
    ``,
    `Welcome to ${appName}. Here are your credentials:`,
    `- Identifier: ${identifier}`,
    `- Temporary Password: ${defaultPassword}`,
    ``,
    `Sign in: ${portalUrl}`,
    `If you didn’t request this, contact ${supportEmail}.`,
    `\n© ${new Date().getFullYear()} ${companyName}`,
  ].join('\n');
}

// Example usage (to be integrated with your email API later):
export const sampleCredentials = {
  recipientName: 'John Doe',
  identifier: 'B56847314A', // or 'john@example.com'
  defaultPassword: DEFAULT_PASSWORD,
  appName: 'NISAA Admin',
  portalUrl: 'https://portal.nisaa.com',
  supportEmail: 'support@nisaa.com',
  companyName: 'NISAA',
  logoUrl: undefined,
};
