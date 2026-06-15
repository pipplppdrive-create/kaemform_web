import { NextResponse } from "next/server";
import {
  hasFeature,
  submitResponseSchema,
  type FormField,
  type FormSettings,
  type ResponseData,
} from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { resolveEffectiveLicense } from "@/lib/auth/license";
import { evaluateConditions } from "@/lib/conditions";
import { validateResponse } from "@/lib/validations/response-validator";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";
import { resend, RESEND_FROM_EMAIL } from "@/lib/email/resend";
import { renderResponseNotificationEmail, getResponseNotificationSubject } from "@/lib/email/templates/ResponseNotification";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submitResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  // Honeypot — silently accept without persisting.
  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  const ipHash = hashIp(getClientIp(request));
  if (!checkRateLimit(`response:${ipHash}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data: form } = await admin
    .from("forms")
    .select("*")
    .eq("id", parsed.data.form_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form || form.status !== "published") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const settings = form.settings as FormSettings;
  const responseCount = form.response_count as number;

  if (
    settings.limit_responses !== null &&
    settings.limit_responses !== undefined &&
    responseCount >= settings.limit_responses
  ) {
    return NextResponse.json({ error: "form_full" }, { status: 403 });
  }

  let respondentId: string | null = null;
  if (settings.require_login) {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    respondentId = session.id;
  }

  if (settings.one_response_per_ip) {
    const { count } = await admin
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("form_id", form.id as string)
      .eq("metadata->>ip_hash", ipHash)
      .is("deleted_at", null);

    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "already_submitted" }, { status: 403 });
    }
  }

  const fields = form.schema as FormField[];
  const data = parsed.data.data as ResponseData;
  const visibility = evaluateConditions(fields, data);
  const errors = validateResponse(fields, data, visibility);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "validation_error", details: errors }, { status: 400 });
  }

  const retentionDays = settings.retention_days ?? 30;
  const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from("responses").insert({
    form_id: form.id as string,
    respondent_id: respondentId,
    data,
    metadata: { ip_hash: ipHash, user_agent: request.headers.get("user-agent") ?? undefined },
    expires_at: expiresAt,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const newResponseCount = responseCount + 1;
  const update: Record<string, unknown> = { response_count: newResponseCount };

  if (settings.limit_responses !== null && settings.limit_responses !== undefined && newResponseCount >= settings.limit_responses) {
    update.status = "closed";
    update.closed_at = new Date().toISOString();
  }

  await admin.from("forms").update(update).eq("id", form.id as string);

  if (settings.notification_emails.length > 0) {
    void sendResponseNotifications(admin, form.id as string, form.workspace_id as string, form.title as string, settings.notification_emails);
  }

  return NextResponse.json({ success: true });
}

async function sendResponseNotifications(
  admin: ReturnType<typeof createAdminClient>,
  formId: string,
  workspaceId: string,
  formTitle: string,
  emails: string[]
): Promise<void> {
  const { data: workspace } = await admin.from("workspaces").select("slug, owner_id").eq("id", workspaceId).maybeSingle();
  if (!workspace) return;

  const { data: owner } = await admin.from("users").select("license_cache").eq("id", workspace.owner_id as string).maybeSingle();
  if (!owner) return;

  const license = resolveEffectiveLicense(owner.license_cache as Parameters<typeof resolveEffectiveLicense>[0]);
  if (!hasFeature(license.limits, "email_notification")) return;

  const responsesUrl = `${APP_URL}/app/w/${workspace.slug}/f/${formId}/responses`;
  const subject = getResponseNotificationSubject({ formTitle, responsesUrl });
  const html = renderResponseNotificationEmail({ formTitle, responsesUrl });

  await Promise.all(
    emails.map((email) => resend.emails.send({ from: RESEND_FROM_EMAIL, to: email, subject, html }))
  );
}
