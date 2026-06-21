import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pastoralistsTable } from "@workspace/db";
import {
  CreatePastoralistBody,
  DeletePastoralistParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * GET /api/pastoralists
 * List all registered pastoralists.
 */
router.get("/pastoralists", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(pastoralistsTable)
      .orderBy(pastoralistsTable.createdAt);
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to list pastoralists");
    res.status(500).json({ error: "Failed to list pastoralists" });
  }
});

/**
 * POST /api/pastoralists
 * Register a new pastoralist herder.
 */
router.post("/pastoralists", async (req, res): Promise<void> => {
  const parsed = CreatePastoralistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    name,
    phone,
    location = "",
    cattle = 0,
    goats = 0,
    camels = 0,
    waterSource = "Unknown",
    alertsEnabled = true,
  } = parsed.data;

  try {
    const [row] = await db
      .insert(pastoralistsTable)
      .values({
        name,
        phone,
        location,
        cattle,
        goats,
        camels,
        waterSource,
        alertsEnabled,
      })
      .returning();

    req.log.info(
      { id: row!.id, name: row!.name, phone: row!.phone },
      "Pastoralist registered",
    );
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to register pastoralist");
    res.status(500).json({ error: "Failed to register pastoralist" });
  }
});

/**
 * DELETE /api/pastoralists/:id
 * Remove a pastoralist from the registry.
 */
router.delete("/pastoralists/:id", async (req, res): Promise<void> => {
  const parsed = DeletePastoralistParams.safeParse({
    id: Number(req.params.id),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const deleted = await db
      .delete(pastoralistsTable)
      .where(eq(pastoralistsTable.id, parsed.data.id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Pastoralist not found" });
      return;
    }

    req.log.info({ id: parsed.data.id }, "Pastoralist removed");
    res.json({ status: "deleted" });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to delete pastoralist");
    res.status(500).json({ error: "Failed to delete pastoralist" });
  }
});

export default router;
