import { Hono } from "hono";

export const postRoutes = new Hono();

postRoutes.get("/posts", (c) => c.json({ code: 0, message: "ok", data: [], meta: null }));
postRoutes.get("/posts/:slug", (c) => {
  const slug = c.req.param("slug");
  return c.json({ code: 0, message: "ok", data: { slug } });
});
