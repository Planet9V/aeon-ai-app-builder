export interface MemgraphConfig {
  host: string
  port: number
  username?: string
  password?: string
}

export interface GraphNode {
  id: string
  type: string
  properties: Record<string, any>
}

export interface GraphRelationship {
  from: string
  to: string
  type: string
  properties?: Record<string, any>
}

export class MemgraphService {
  private config: MemgraphConfig
  private connected: boolean = false

  constructor(config: MemgraphConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    console.log(`Connecting to Memgraph at ${this.config.host}:${this.config.port}`)
    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  async query(cypher: string, params: Record<string, any> = {}): Promise<any[]> {
    if (!this.connected) {
      throw new Error("Not connected to Memgraph")
    }

    console.log("Query:", cypher, params)
    return []
  }

  async createNode(node: GraphNode): Promise<string> {
    const cypher = `
      CREATE (n:${node.type} {id: $id})
      SET n += $properties
      RETURN n.id as id
    `

    const result = await this.query(cypher, {
      id: node.id,
      properties: node.properties,
    })

    return result[0]?.id || node.id
  }

  async createRelationship(rel: GraphRelationship): Promise<void> {
    const cypher = `
      MATCH (a {id: $from}), (b {id: $to})
      CREATE (a)-[r:${rel.type}]->(b)
      ${rel.properties ? "SET r += $properties" : ""}
      RETURN r
    `

    await this.query(cypher, {
      from: rel.from,
      to: rel.to,
      properties: rel.properties || {},
    })
  }

  async getNode(id: string): Promise<GraphNode | null> {
    const cypher = `
      MATCH (n {id: $id})
      RETURN n
    `

    const result = await this.query(cypher, { id })
    if (result.length === 0) return null

    return {
      id: result[0].id,
      type: result[0].labels[0],
      properties: result[0].properties,
    }
  }

  async deleteNode(id: string): Promise<void> {
    const cypher = `
      MATCH (n {id: $id})
      DETACH DELETE n
    `

    await this.query(cypher, { id })
  }

  async getNodeRelationships(id: string): Promise<GraphRelationship[]> {
    const cypher = `
      MATCH (n {id: $id})-[r]-(m)
      RETURN r, startNode(r).id as from, endNode(r).id as to
    `

    const result = await this.query(cypher, { id })

    return result.map((row) => ({
      from: row.from,
      to: row.to,
      type: row.r.type,
      properties: row.r.properties,
    }))
  }

  async searchNodes(type: string, properties: Record<string, any>): Promise<GraphNode[]> {
    const conditions = Object.keys(properties)
      .map((key) => `n.${key} = $${key}`)
      .join(" AND ")

    const cypher = `
      MATCH (n:${type})
      ${conditions ? `WHERE ${conditions}` : ""}
      RETURN n
    `

    const result = await this.query(cypher, properties)

    return result.map((row) => ({
      id: row.n.id,
      type: row.n.labels[0],
      properties: row.n.properties,
    }))
  }
}

let memgraphInstance: MemgraphService | null = null

export function getMemgraphService(config?: MemgraphConfig): MemgraphService {
  if (!memgraphInstance) {
    const defaultConfig: MemgraphConfig = {
      host: process.env.MEMGRAPH_HOST || "localhost",
      port: parseInt(process.env.MEMGRAPH_PORT || "7687"),
      username: process.env.MEMGRAPH_USERNAME,
      password: process.env.MEMGRAPH_PASSWORD,
    }

    memgraphInstance = new MemgraphService(config || defaultConfig)
  }

  return memgraphInstance
}

export default MemgraphService
