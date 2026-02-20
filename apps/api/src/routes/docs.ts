import { Hono } from "hono";

export const docsRoutes = new Hono();

docsRoutes.get("/docs", (c) => c.json({ code: 0, message: "ok", data: [] }));
docsRoutes.get("/docs/:slug", (c) => {
  const slug = c.req.param("slug");
  return c.json({ code: 0, message: "ok", data: { slug } });
});
