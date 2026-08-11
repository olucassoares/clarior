import { ensureDatabase, getDatabaseConnection, getOwnerId } from "../../../lib/database";

export async function GET(request: Request) {
  try {
    await ensureDatabase(getOwnerId(request));
    await (await getDatabaseConnection()).prepare("SELECT 1").first();
    return Response.json({ status: "ok", service: "clarior", database: "ready", timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: "error", service: "clarior", database: "unavailable", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
