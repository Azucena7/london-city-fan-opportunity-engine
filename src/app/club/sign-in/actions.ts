"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInClub } from "@/lib/clubAuth";
import { clubAccessEnabled, clubCookie, clubEnvironment } from "@/lib/clubSession";

export async function signIn(form: FormData) {
  if (!clubAccessEnabled()) redirect("/club/sign-in?status=setup");
  const email = form.get("email");
  const password = form.get("password");
  const session = typeof email === "string" && typeof password === "string"
    ? await signInClub(clubEnvironment(), email.trim(), password) : null;
  if (!session) redirect("/club/sign-in?status=denied");
  (await cookies()).set(clubCookie, session.token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: session.maxAge,
  });
  redirect("/club");
}

export async function signOut() {
  (await cookies()).set(clubCookie, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  redirect("/club/sign-in");
}
