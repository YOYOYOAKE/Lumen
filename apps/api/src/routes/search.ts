import { Hono } from "hono";

export const searchRoutes = new Hono();

searchRoutes.get("/search", (c) => {
  const q = c.req.query("q") ?? "";
  return c.json({ code: 0, message: "ok", data: [], meta: { q } });
});
