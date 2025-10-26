import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import filesRouter from "./routes/files"
import projectsRouter from "./routes/projects"
import healthRouter from "./routes/health"
import graphRouter from "./routes/graph"

const app = new Hono()

app.use("*", cors())
app.use("*", logger())

app.route("/api/health", healthRouter)
app.route("/api/files", filesRouter)
app.route("/api/projects", projectsRouter)
app.route("/api/graph", graphRouter)

app.get("/", (c) => {
  return c.json({
    name: "OpenCode API",
    version: "0.1.0",
    status: "running",
  })
})

const port = process.env.PORT || 3001

console.log(`🚀 OpenCode API running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
