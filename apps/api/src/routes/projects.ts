import { Hono } from "hono"
import { z } from "zod"

const projects = new Hono()

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

projects.get("/", async (c) => {
  return c.json({
    projects: [],
    message: "Project listing not yet implemented",
  })
})

projects.get("/:id", async (c) => {
  const id = c.req.param("id")
  return c.json({
    id,
    message: "Project retrieval not yet implemented",
  })
})

projects.post("/", async (c) => {
  const body = await c.req.json()
  const validated = createProjectSchema.parse(body)

  return c.json(
    {
      success: true,
      project: validated,
      message: "Project creation not yet implemented",
    },
    201,
  )
})

projects.put("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json()

  return c.json({
    success: true,
    id,
    message: "Project update not yet implemented",
  })
})

projects.delete("/:id", async (c) => {
  const id = c.req.param("id")

  return c.json({
    success: true,
    id,
    message: "Project deletion not yet implemented",
  })
})

export default projects
