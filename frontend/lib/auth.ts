import { apiFetch } from "@/lib/api";

export type UserRole = "parent" | "coach" | "admin" | "super_admin";

export type MeUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number: string;
};

export type MeResponse = {
  user: MeUser;
  parent_profile?: unknown;
};

export function isClubAdmin(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me/");
}
