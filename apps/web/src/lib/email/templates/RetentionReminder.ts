import { emailButton, emailButtonSecondary, emailLayout, escapeHtml } from "./EmailLayout";

export interface RetentionReminderProps {
  formTitle: string;
  responseCount: number;
  expiryDate: string;
  days: number;
  dashboardUrl: string;
  storeUrl: string;
}

export function getRetentionReminderSubject({ formTitle, days }: RetentionReminderProps): string {
  return `[KaemForm] Data form "${formTitle}" akan dihapus dalam ${days} hari`;
}

export function renderRetentionReminderEmail({
  formTitle,
  responseCount,
  expiryDate,
  days,
  dashboardUrl,
  storeUrl,
}: RetentionReminderProps): string {
  const title = escapeHtml(formTitle);
  const content = `
    <p style="font-size:16px;margin:0 0 12px;">Halo,</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">
      ${responseCount} respons pada formulir <strong>&quot;${title}&quot;</strong> akan dihapus secara otomatis
      pada <strong>${expiryDate}</strong> (dalam ${days} hari) sesuai kebijakan retensi data Anda.
    </p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Untuk menyimpan data ini, Anda dapat:</p>
    <ul style="font-size:14px;line-height:1.6;margin:0 0 12px;padding-left:20px;">
      <li>Unduh respons sebagai CSV dari dashboard</li>
      <li>Backup melalui aplikasi desktop KaemForm</li>
      <li>Beli storage add-on untuk memperpanjang retensi</li>
    </ul>
    <div>
      ${emailButton(dashboardUrl, "Buka Dashboard")}
      ${emailButtonSecondary(storeUrl, "Beli Storage Add-on")}
    </div>
  `;

  return emailLayout(getRetentionReminderSubject({ formTitle, responseCount, expiryDate, days, dashboardUrl, storeUrl }), content);
}
