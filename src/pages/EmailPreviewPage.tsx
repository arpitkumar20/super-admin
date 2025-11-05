import React, { useMemo, useState } from 'react';
import { buildCredentialsEmail, sampleCredentials } from '../services/emailTemplates';

const defaultState = {
  recipientName: sampleCredentials.recipientName,
  identifier: sampleCredentials.identifier,
  defaultPassword: sampleCredentials.defaultPassword,
  appName: sampleCredentials.appName,
  portalUrl: sampleCredentials.portalUrl,
  supportEmail: sampleCredentials.supportEmail,
  companyName: sampleCredentials.companyName,
  logoUrl: sampleCredentials.logoUrl as string | undefined,
};

const fieldClass = 'w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const EmailPreviewPage: React.FC = () => {
  const [form, setForm] = useState(defaultState);

  const html = useMemo(() => buildCredentialsEmail(form), [form]);

  const openNewTab = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credentials-email.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      alert('HTML copied to clipboard');
    } catch {
      alert('Failed to copy. Your browser may block clipboard access.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Email Template Preview</h1>
          <div className="flex gap-2">
            <button onClick={openNewTab} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Open in new tab</button>
            <button onClick={downloadHtml} className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800">Download HTML</button>
            <button onClick={copyHtml} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Copy HTML</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <div>
              <label className="block text-sm mb-1">Recipient Name</label>
              <input className={fieldClass} value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Identifier (email or username)</label>
              <input className={fieldClass} value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Temporary Password</label>
              <input className={fieldClass} value={form.defaultPassword}
                onChange={(e) => setForm({ ...form, defaultPassword: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">App Name</label>
              <input className={fieldClass} value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Portal URL</label>
              <input className={fieldClass} value={form.portalUrl}
                onChange={(e) => setForm({ ...form, portalUrl: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Support Email</label>
              <input className={fieldClass} value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <input className={fieldClass} value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Logo URL (optional)</label>
              <input className={fieldClass} value={form.logoUrl || ''}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value || undefined })} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <iframe title="Email Preview" className="w-full h-[75vh]" srcDoc={html} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewPage;
