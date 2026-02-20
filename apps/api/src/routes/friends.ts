import { Hono } from "hono";

export const friendsRoutes = new Hono();

friendsRoutes.get("/friends", (c) => c.json({ code: 0, message: "ok", data: [] }));
