import { Hono } from "hono"
import { z } from "zod"
import { getMemgraphService } from "../services/memgraph"

const graph = new Hono()

const createNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  properties: z.record(z.any()),
})

const createRelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
  properties: z.record(z.any()).optional(),
})

graph.get("/health", async (c) => {
  const memgraph = getMemgraphService()

  try {
    await memgraph.connect()
    await memgraph.disconnect()

    return c.json({
      status: "healthy",
      service: "memgraph",
    })
  } catch (error) {
    return c.json(
      {
        status: "unhealthy",
        service: "memgraph",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      503,
    )
  }
})

graph.post("/nodes", async (c) => {
  const body = await c.req.json()
  const validated = createNodeSchema.parse(body)

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    const id = await memgraph.createNode(validated)
    return c.json({ success: true, id }, 201)
  } finally {
    await memgraph.disconnect()
  }
})

graph.get("/nodes/:id", async (c) => {
  const id = c.req.param("id")

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    const node = await memgraph.getNode(id)

    if (!node) {
      return c.json({ error: "Node not found" }, 404)
    }

    return c.json(node)
  } finally {
    await memgraph.disconnect()
  }
})

graph.delete("/nodes/:id", async (c) => {
  const id = c.req.param("id")

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    await memgraph.deleteNode(id)
    return c.json({ success: true })
  } finally {
    await memgraph.disconnect()
  }
})

graph.post("/relationships", async (c) => {
  const body = await c.req.json()
  const validated = createRelationshipSchema.parse(body)

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    await memgraph.createRelationship(validated)
    return c.json({ success: true }, 201)
  } finally {
    await memgraph.disconnect()
  }
})

graph.get("/nodes/:id/relationships", async (c) => {
  const id = c.req.param("id")

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    const relationships = await memgraph.getNodeRelationships(id)
    return c.json({ relationships })
  } finally {
    await memgraph.disconnect()
  }
})

graph.get("/search/:type", async (c) => {
  const type = c.req.param("type")
  const query = c.req.query()

  const memgraph = getMemgraphService()
  await memgraph.connect()

  try {
    const nodes = await memgraph.searchNodes(type, query)
    return c.json({ nodes })
  } finally {
    await memgraph.disconnect()
  }
})

export default graph
