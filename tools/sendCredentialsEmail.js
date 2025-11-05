// tools/sendCredentialsEmail.js
// One-off Node script to send a credentials email via backend endpoint
// Uses fetch (Node 18+) and constructs an HTML template inline for portability.

const BASE_URL = 'http://34.238.181.131:5600';
let SEND_PATH = '/email/send';
// Allow override via env var QUICK_SEND_PATH to try alternates like '/send-email' or '/email'
if (process.env.QUICK_SEND_PATH) {
  SEND_PATH = process.env.QUICK_SEND_PATH;
}

const to = 'siddueee44@gmail.com';
const recipientName = 'there';
const identifier = 'siddueee44@gmail.com';
const defaultPassword = 'Nisaa@123';
const appName = 'NISAA Admin';
const portalUrl = 'https://portal.nisaa.com';
const supportEmail = 'support@nisaa.com';
const companyName = 'NISAA';

function safe(v) {
  return String(v ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml() {
  const preheader = `Your ${appName} access details`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${safe(appName)} Credentials</title>
    <style>
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
                <div style="display:inline-block;width:56px;height:56px;border-radius:12px;background:#2563eb;color:#fff;font-weight:700;line-height:56px;text-align:center;">${safe(companyName)[0] ?? 'N'}</div>
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

function buildText() {
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

async function main() {
  const payload = {
    to,
    subject: `Your ${appName} credentials`,
    html: buildHtml(),
    text: buildText(),
  };

  const url = `${BASE_URL}${SEND_PATH}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
    if (!res.ok) process.exit(1);
  } catch (e) {
    console.error('Error sending email:', e);
    process.exit(1);
  }
}

main();
