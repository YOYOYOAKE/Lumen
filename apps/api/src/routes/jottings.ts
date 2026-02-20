import { Hono } from "hono";

export const jottingRoutes = new Hono();

jottingRoutes.get("/jottings", (c) => c.json({ code: 0, message: "ok", data: [], meta: null }));
jottingRoutes.get("/jottings/:slug", (c) => {
  const slug = c.req.param("slug");
  return c.json({ code: 0, message: "ok", data: { slug } });
});
