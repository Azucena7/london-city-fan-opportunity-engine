"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clubCookie, clubEnvironment } from "@/lib/clubSession";
import { accessMatchDrafts } from "@/lib/clubDrafts";

export async function createMatchDraft(form: FormData) {
  const token = (await cookies()).get(clubCookie)?.value;
  const club = form.get("clubId");
  const opponent = form.get("opponent");
  const date = form.get("matchDate");
  const objective = form.get("objective");
  if (!token) redirect("/club/sign-in");
  if ([club, opponent, date, objective].some(v => typeof v !== "string")) redirect("/club?draft=error");
  const saved = await accessMatchDrafts(clubEnvironment(), token, club as string, {
    opponent: (opponent as string).trim(), match_date: date as string, objective: objective as string,
  });
  if (!saved) redirect("/club?draft=error");
  revalidatePath("/club");
  redirect("/club?draft=saved");
}
