import { ensureDatabase, getDatabaseConnection, getOwnerId } from "../../../../lib/database";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const ownerId = getOwnerId(request);
  await ensureDatabase(ownerId);
  const { id } = await context.params;
  const result = await (await getDatabaseConnection()).prepare("DELETE FROM transactions WHERE id=? AND owner_id=?").bind(id, ownerId).run();
  if (!result.meta.changes) return Response.json({ error: "Transação não encontrada." }, { status: 404 });
  return Response.json({ deleted: true });
}
