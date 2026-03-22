import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Lösenord saknas" }, { status: 400 });
  }

  const success = await login(password);
  if (!success) {
    return NextResponse.json({ error: "Fel lösenord" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
