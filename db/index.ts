import { env } from "cloudflare:workers";

export function getD1() {
  return env.DB;
}
