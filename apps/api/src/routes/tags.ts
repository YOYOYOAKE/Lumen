import { Hono } from "hono";

export const tagsRoutes = new Hono();

tagsRoutes.get("/tags", (c) => c.json({ code: 0, message: "ok", data: [], meta: null }));
tagsRoutes.get("/tags/:tag/posts", (c) => {
  const tag = c.req.param("tag");
  return c.json({ code: 0, message: "ok", data: [], meta: { tag } });
});
