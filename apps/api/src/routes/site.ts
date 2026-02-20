import { Hono } from "hono";

export const siteRoutes = new Hono();

siteRoutes.get("/site", (c) => c.json({ code: 0, message: "ok", data: null }));
siteRoutes.get("/home", (c) => c.json({ code: 0, message: "ok", data: null }));
