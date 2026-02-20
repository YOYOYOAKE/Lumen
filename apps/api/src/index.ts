import { Hono } from "hono";
import { siteRoutes } from "./routes/site";
import { postRoutes } from "./routes/posts";
import { jottingRoutes } from "./routes/jottings";
import { docsRoutes } from "./routes/docs";
import { tagsRoutes } from "./routes/tags";
import { searchRoutes } from "./routes/search";
import { friendsRoutes } from "./routes/friends";

type Bindings = {
  LUMEN_METADATA: D1Database;
  LUMEN_CONTENT: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/v1/health", (c) => c.json({ code: 0, message: "ok", data: { status: "up" } }));
app.route("/api/v1", siteRoutes);
app.route("/api/v1", postRoutes);
app.route("/api/v1", jottingRoutes);
app.route("/api/v1", docsRoutes);
app.route("/api/v1", tagsRoutes);
app.route("/api/v1", searchRoutes);
app.route("/api/v1", friendsRoutes);

export default app;
