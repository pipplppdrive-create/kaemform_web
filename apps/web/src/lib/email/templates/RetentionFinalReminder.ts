import { emailButton, emailButtonSecondary, emailLayout, escapeHtml } from "./EmailLayout";

export interface RetentionFinalReminderProps {
  formTitle: string;
  responseCount: number;
  expiryDate: string;
  dashboardUrl: string;
  storeUrl: string;
}

export function getRetentionFinalReminderSubject({ formTitle }: RetentionFinalReminderProps): string {
  return `[KaemForm] Data form "${formTitle}" akan dihapus BESOK`;
}

export function renderRetentionFinalReminderEmail({
  formTitle,
  responseCount,
  expiryDate,
  dashboardUrl,
  storeUrl,
}: RetentionFinalReminderProps): string {
  const title = escapeHtml(formTitle);
  const content = `
    <p style="font-size:16px;margin:0 0 12px;">Halo,</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px;color:#DC2626;font-weight:600;">
      Peringatan terakhir: ${responseCount} respons pada formulir &quot;${title}&quot; akan dihapus secara permanen
      BESOK (${expiryDate}).
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

  return emailLayout(getRetentionFinalReminderSubject({ formTitle, responseCount, expiryDate, dashboardUrl, storeUrl }), content);
}
