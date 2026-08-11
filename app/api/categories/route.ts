import { ensureDatabase, getOwnerId, queryRows } from "../../../lib/database";

export async function GET(request: Request) {
  const ownerId = getOwnerId(request);
  await ensureDatabase(ownerId);
  const categories = await queryRows("SELECT id, name, color, type FROM categories WHERE owner_id=? ORDER BY type DESC, name ASC", ownerId);
  return Response.json({ categories });
}
