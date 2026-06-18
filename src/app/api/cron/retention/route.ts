import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, RESEND_FROM_EMAIL } from "@/lib/email/resend";
import { renderRetentionReminderEmail, getRetentionReminderSubject } from "@/lib/email/templates/RetentionReminder";
import {
  renderRetentionFinalReminderEmail,
  getRetentionFinalReminderSubject,
} from "@/lib/email/templates/RetentionFinalReminder";
import { buildPublicUrl } from "@/lib/public-url";

const SETTINGS_URL = buildPublicUrl("/app/settings");
const DAY_MS = 24 * 60 * 60 * 1000;

type AdminClient = ReturnType<typeof createAdminClient>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

async function sendReminders(admin: AdminClient, now: Date, withinDays: number, isFinal: boolean): Promise<number> {
  const windowEnd = new Date(now.getTime() + withinDays * DAY_MS).toISOString();
  const dedupeWindowStart = new Date(now.getTime() - (isFinal ? DAY_MS : 6 * DAY_MS)).toISOString();

  const { data: responses } = await admin
    .from("responses")
    .select("form_id, expires_at")
    .gt("expires_at", now.toISOString())
    .lte("expires_at", windowEnd)
    .is("deleted_at", null);

  if (!responses || responses.length === 0) return 0;

  const grouped = new Map<string, { count: number; expiresAt: string }>();
  for (const r of responses) {
    const formId = r.form_id as string;
    const existing = grouped.get(formId);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(formId, { count: 1, expiresAt: r.expires_at as string });
    }
  }

  let sentCount = 0;

  for (const [formId, info] of grouped) {
    const { data: recentLog } = await admin
      .from("retention_logs")
      .select("id")
      .eq("form_id", formId)
      .eq("action", "reminder_sent")
      .gt("executed_at", dedupeWindowStart)
      .limit(1)
      .maybeSingle();

    if (recentLog) continue;

    const { data: form } = await admin.from("forms").select("title, workspace_id").eq("id", formId).maybeSingle();
    if (!form) continue;

    const { data: workspace } = await admin
      .from("workspaces")
      .select("id, slug, owner_id")
      .eq("id", form.workspace_id as string)
      .maybeSingle();
    if (!workspace) continue;

    const { data: owner } = await admin.from("users").select("email").eq("id", workspace.owner_id as string).maybeSingle();
    if (!owner?.email) continue;

    const dashboardUrl = buildPublicUrl(`/app/w/${workspace.slug}/f/${formId}/responses`);
    const expiryDate = formatDate(info.expiresAt);
    const formTitle = form.title as string;

    const subject = isFinal
      ? getRetentionFinalReminderSubject({
          formTitle,
          responseCount: info.count,
          expiryDate,
          dashboardUrl,
          storeUrl: SETTINGS_URL,
        })
      : getRetentionReminderSubject({
          formTitle,
          responseCount: info.count,
          expiryDate,
          days: withinDays,
          dashboardUrl,
          storeUrl: SETTINGS_URL,
        });

    const html = isFinal
      ? renderRetentionFinalReminderEmail({
          formTitle,
          responseCount: info.count,
          expiryDate,
          dashboardUrl,
          storeUrl: SETTINGS_URL,
        })
      : renderRetentionReminderEmail({
          formTitle,
          responseCount: info.count,
          expiryDate,
          days: withinDays,
          dashboardUrl,
          storeUrl: SETTINGS_URL,
        });

    await resend.emails.send({ from: RESEND_FROM_EMAIL, to: owner.email as string, subject, html });

    await admin.from("retention_logs").insert({
      form_id: formId,
      workspace_id: workspace.id as string,
      action: "reminder_sent",
      responses_count: info.count,
    });

    sentCount += 1;
  }

  return sentCount;
}

async function softDeleteExpired(admin: AdminClient, now: Date): Promise<number> {
  const nowIso = now.toISOString();

  const { data: expired } = await admin.from("responses").select("form_id").lte("expires_at", nowIso).is("deleted_at", null);

  if (!expired || expired.length === 0) return 0;

  const counts = new Map<string, number>();
  for (const r of expired) {
    const formId = r.form_id as string;
    counts.set(formId, (counts.get(formId) ?? 0) + 1);
  }

  await admin.from("responses").update({ deleted_at: nowIso }).lte("expires_at", nowIso).is("deleted_at", null);

  for (const [formId, count] of counts) {
    const { data: form } = await admin.from("forms").select("workspace_id").eq("id", formId).maybeSingle();
    if (!form) continue;

    await admin.from("retention_logs").insert({
      form_id: formId,
      workspace_id: form.workspace_id as string,
      action: "deleted",
      responses_count: count,
    });
  }

  return expired.length;
}

async function hardDeleteOld(admin: AdminClient, now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - 30 * DAY_MS).toISOString();

  const { data: deleted } = await admin.from("responses").delete().lte("deleted_at", cutoff).select("id");

  return deleted?.length ?? 0;
}

export async function POST(request: Request) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const reminders_sent = await sendReminders(admin, now, 7, false);
  const final_reminders_sent = await sendReminders(admin, now, 1, true);
  const soft_deleted = await softDeleteExpired(admin, now);
  const hard_deleted = await hardDeleteOld(admin, now);

  return NextResponse.json({ reminders_sent, final_reminders_sent, soft_deleted, hard_deleted });
}
