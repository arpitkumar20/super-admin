// src/services/email.ts
// Client-side email sender that relies on a backend endpoint to actually dispatch emails.
// It uses the credentials email template builder to generate HTML + text bodies.

import { buildCredentialsEmail, buildCredentialsText, type CredentialsEmailParams } from './emailTemplates';
import { BASE_URL } from './api';

export type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  // Optional metadata you might want to pass along
  tags?: string[];
};

// Configurable path in case the backend uses a different route
const EMAIL_SEND_PATH = '/email/send';

export async function sendCredentialsEmail(
  to: string,
  params: Omit<CredentialsEmailParams, 'identifier'> & { identifier: string },
  options?: { subject?: string; sendPath?: string }
): Promise<{ ok: boolean; status: number; detail?: unknown }> {
  const subject = options?.subject ?? `Your ${params.appName ?? 'NISAA Admin'} credentials`;
  const html = buildCredentialsEmail(params);
  const text = buildCredentialsText(params);

  const payload: SendEmailPayload = { to, subject, html, text };

  const url = `${BASE_URL}${options?.sendPath ?? EMAIL_SEND_PATH}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => undefined);
      return { ok: false, status: res.status, detail: errText };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, detail: err };
  }
}

// Convenience helper for one-off sends. Useful for dev testing.
export async function sendCredentialsTo(
  to: string,
  identifier: string,
  overrides?: Partial<CredentialsEmailParams> & { subject?: string; sendPath?: string }
) {
  return sendCredentialsEmail(
    to,
    {
      recipientName: overrides?.recipientName ?? 'there',
      identifier,
      defaultPassword: overrides?.defaultPassword,
      appName: overrides?.appName ?? 'NISAA Admin',
      portalUrl: overrides?.portalUrl ?? 'https://portal.nisaa.com',
      supportEmail: overrides?.supportEmail ?? 'support@nisaa.com',
      companyName: overrides?.companyName ?? 'NISAA',
      logoUrl: overrides?.logoUrl,
    },
    { subject: overrides?.subject, sendPath: overrides?.sendPath }
  );
}
