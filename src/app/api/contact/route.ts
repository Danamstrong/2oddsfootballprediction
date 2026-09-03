import { NextResponse } from "next/server";
import { SUPPORT_EMAIL } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  /** Honeypot — real users never fill this. */
  company?: string;
}

function fail(message: string, status: number) {
  return NextResponse.json({ status: "error", message }, { status });
}

export async function POST(req: Request) {
  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  if (body.company) {
    // Honeypot tripped — pretend success, drop it.
    return NextResponse.json({ status: "success", message: "Thanks!" });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (name.length < 2) return fail("Please tell us your name.", 400);
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.", 400);
  if (message.length < 10) {
    return fail("Please add a bit more detail to your message.", 400);
  }
  if (message.length > 4000) {
    return fail("That message is too long — keep it under 4000 characters.", 400);
  }

  // TODO: deliver to the support inbox (SMTP / Brevo / Resend) or a ticket
  // system. For now the inquiry is logged server-side so it isn't lost.
  console.info("[contact] new inquiry", {
    to: SUPPORT_EMAIL,
    name,
    email,
    subject: subject || "(no subject)",
    length: message.length,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    status: "success",
    message:
      "Thanks — your message has reached our support desk. We reply within 24 hours.",
  });
}
