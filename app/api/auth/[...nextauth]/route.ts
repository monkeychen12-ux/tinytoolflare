import { handlers } from "@/auth";

export const { GET, POST } = handlers;

export function HEAD() {
  return new Response(null, { status: 200 });
}
