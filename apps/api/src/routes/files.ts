import { Hono } from "hono"
import { z } from "zod"
import { getFileSystemService } from "../services/fileSystem"

const files = new Hono()

const createFileSchema = z.object({
  path: z.string(),
  content: z.string().default(""),
  type: z.enum(["file", "directory"]).default("file"),
})

const updateFileSchema = z.object({
  content: z.string(),
})

const renameFileSchema = z.object({
  newPath: z.string(),
})

files.get("/", async (c) => {
  try {
    const dirPath = c.req.query("path") || "/"
    const fs = getFileSystemService()
    const fileList = await fs.listFiles(dirPath)

    return c.json({
      success: true,
      path: dirPath,
      files: fileList,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list files",
      },
      500,
    )
  }
})

files.get("/:path{.+}", async (c) => {
  try {
    const path = c.req.param("path")
    const fs = getFileSystemService()
    const fileContent = await fs.readFile(path)

    return c.json({
      success: true,
      ...fileContent,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to read file",
      },
      error instanceof Error && error.message.includes("not found") ? 404 : 500,
    )
  }
})

files.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const validated = createFileSchema.parse(body)
    const fs = getFileSystemService()

    if (validated.type === "directory") {
      await fs.createDirectory(validated.path)
    } else {
      await fs.createFile(validated.path, validated.content)
    }

    return c.json(
      {
        success: true,
        path: validated.path,
        type: validated.type,
        message: `${validated.type === "directory" ? "Directory" : "File"} created successfully`,
      },
      201,
    )
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create file",
      },
      error instanceof Error && error.message.includes("already exists") ? 409 : 500,
    )
  }
})

files.put("/:path{.+}", async (c) => {
  try {
    const path = c.req.param("path")
    const body = await c.req.json()
    const validated = updateFileSchema.parse(body)
    const fs = getFileSystemService()

    await fs.writeFile(path, validated.content)

    return c.json({
      success: true,
      path,
      message: "File updated successfully",
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update file",
      },
      500,
    )
  }
})

files.patch("/:path{.+}/rename", async (c) => {
  try {
    const path = c.req.param("path")
    const body = await c.req.json()
    const validated = renameFileSchema.parse(body)
    const fs = getFileSystemService()

    await fs.renameFile(path, validated.newPath)

    return c.json({
      success: true,
      oldPath: path,
      newPath: validated.newPath,
      message: "File renamed successfully",
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to rename file",
      },
      500,
    )
  }
})

files.delete("/:path{.+}", async (c) => {
  try {
    const path = c.req.param("path")
    const fs = getFileSystemService()

    await fs.deleteFile(path)

    return c.json({
      success: true,
      path,
      message: "File deleted successfully",
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      error instanceof Error && error.message.includes("not found") ? 404 : 500,
    )
  }
})

export default files
