import { Hono } from "hono"

const health = new Hono()

health.get("/", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

health.get("/ready", (c) => {
  return c.json({
    ready: true,
    services: {
      database: "connected",
      fileSystem: "available",
    },
  })
})

export default health
