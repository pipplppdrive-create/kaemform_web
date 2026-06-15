import { emailButton, emailLayout, escapeHtml } from "./EmailLayout";

export interface ResponseNotificationProps {
  formTitle: string;
  responsesUrl: string;
}

export function getResponseNotificationSubject({ formTitle }: ResponseNotificationProps): string {
  return `[KaemForm] Respons baru pada "${formTitle}"`;
}

export function renderResponseNotificationEmail({ formTitle, responsesUrl }: ResponseNotificationProps): string {
  const title = escapeHtml(formTitle);
  const content = `
    <p style="font-size:16px;margin:0 0 12px;">Halo,</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">
      Formulir Anda <strong>&quot;${title}&quot;</strong> baru saja menerima respons baru.
    </p>
    <div>
      ${emailButton(responsesUrl, "Lihat Respons")}
    </div>
  `;

  return emailLayout(getResponseNotificationSubject({ formTitle, responsesUrl }), content);
}
