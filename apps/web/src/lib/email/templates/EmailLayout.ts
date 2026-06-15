export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailLayout(preheader: string, contentHtml: string): string {
  return `<html>
  <body style="margin:0;padding:24px;background-color:#F4F4F5;font-family:Arial, Helvetica, sans-serif;color:#18181B;">
    <div style="display:none;overflow:hidden;line-height:0;opacity:0;">${escapeHtml(preheader)}</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tbody>
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;background-color:#FFFFFF;border-radius:8px;border:1px solid #E4E4E7;">
              <tbody>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#2563EB;">KaemForm</p>
                    ${contentHtml}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style="margin-top:16px;font-size:12px;color:#A1A1AA;">KaemForm — bagian dari ekosistem Kaemnur</p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;margin-right:8px;padding:10px 20px;background-color:#2563EB;color:#FFFFFF;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">${label}</a>`;
}

export function emailButtonSecondary(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;margin-right:8px;padding:10px 20px;background-color:#F4F4F5;color:#18181B;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid #E4E4E7;">${label}</a>`;
}
