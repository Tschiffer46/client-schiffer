import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

interface SessionData {
  authenticated?: boolean;
}

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET || "fallback-dev-secret-must-be-32-chars!",
  cookieName: "schiffer-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.authenticated === true;
}

export async function login(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) return false;

  const valid = await bcrypt.compare(password, hash);
  if (!valid) return false;

  const session = await getSession();
  session.authenticated = true;
  await session.save();
  return true;
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
