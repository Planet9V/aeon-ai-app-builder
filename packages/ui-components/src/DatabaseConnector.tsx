/**
 * Database Connector Component - Database Integration & Management
 * Unified interface for database connections, queries, and schema management
 */

import React, { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Database,
  Plus,
  Play,
  Settings,
  Zap,
  Table as TableIcon,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Key,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react"

export interface DatabaseConnection {
  id: string
  name: string
  type: "postgresql" | "mysql" | "mongodb" | "sqlite" | "redis"
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  connectionString?: string
  status: "disconnected" | "connecting" | "connected" | "error"
  lastConnected?: Date
  error?: string
}

export interface DatabaseQuery {
  id: string
  connectionId: string
  name: string
  query: string
  type: "select" | "insert" | "update" | "delete" | "create" | "drop"
  parameters: Record<string, any>
  status: "idle" | "running" | "completed" | "error"
  result?: QueryResult
  executionTime?: number
  error?: string
  timestamp: Date
}

export interface QueryResult {
  columns: string[]
  rows: any[][]
  rowCount: number
  affectedRows?: number
  executionTime: number
}

export interface DatabaseSchema {
  tables: TableSchema[]
  views: ViewSchema[]
  indexes: IndexSchema[]
  constraints: ConstraintSchema[]
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  primaryKey: string[]
  indexes: string[]
  rowCount?: number
}

export interface ColumnSchema {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
  primaryKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
}

export interface ViewSchema {
  name: string
  definition: string
  columns: string[]
}

export interface IndexSchema {
  name: string
  table: string
  columns: string[]
  unique: boolean
  type: string
}

export interface ConstraintSchema {
  name: string
  type: "primary_key" | "foreign_key" | "unique" | "check"
  table: string
  columns: string[]
  definition?: string
}

interface DatabaseConnectorProps {
  className?: string
  onConnectionCreate?: (connection: DatabaseConnection) => void
  onQueryExecute?: (query: DatabaseQuery) => void
}

export function DatabaseConnector({ className = "", onConnectionCreate, onQueryExecute }: DatabaseConnectorProps) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [queries, setQueries] = useState<DatabaseQuery[]>([])
  const [schemas, setSchemas] = useState<Record<string, DatabaseSchema>>({})
  const [activeTab, setActiveTab] = useState("connections")
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)

  // Create new database connection
  const createConnection = useCallback(
    (connectionData: Omit<DatabaseConnection, "id" | "status">) => {
      const connection: DatabaseConnection = {
        id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...connectionData,
        status: "disconnected",
      }
      setConnections((prev) => [...prev, connection])
      onConnectionCreate?.(connection)
    },
    [onConnectionCreate],
  )

  // Test database connection
  const testConnection = useCallback(
    async (connectionId: string) => {
      const connection = connections.find((c) => c.id === connectionId)
      if (!connection) return

      setConnections((prev) => prev.map((c) => (c.id === connectionId ? { ...c, status: "connecting" } : c)))

      try {
        // Mock connection test - in production, implement actual database connection
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const success = Math.random() > 0.2 // 80% success rate for demo
        setConnections((prev) =>
          prev.map((c) =>
            c.id === connectionId
              ? {
                  ...c,
                  status: success ? "connected" : "error",
                  lastConnected: success ? new Date() : undefined,
                  error: success ? undefined : "Connection failed: Invalid credentials",
                }
              : c,
          ),
        )

        return success
      } catch (error) {
        setConnections((prev) =>
          prev.map((c) =>
            c.id === connectionId
              ? {
                  ...c,
                  status: "error",
                  error: error instanceof Error ? error.message : "Connection failed",
                }
              : c,
          ),
        )
        return false
      }
    },
    [connections],
  )

  // Execute database query
  const executeQuery = useCallback(
    async (connectionId: string, queryText: string, name?: string, parameters: Record<string, any> = {}) => {
      const connection = connections.find((c) => c.id === connectionId)
      if (!connection || connection.status !== "connected") return

      const query: DatabaseQuery = {
        id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        connectionId,
        name: name || `Query ${queries.length + 1}`,
        query: queryText,
        type: inferQueryType(queryText),
        parameters,
        status: "running",
        timestamp: new Date(),
      }

      setQueries((prev) => [query, ...prev])

      try {
        const startTime = Date.now()

        // Mock query execution - in production, execute actual database query
        await new Promise((resolve) => setTimeout(resolve, 500))

        const executionTime = Date.now() - startTime
        const mockResult: QueryResult = {
          columns: ["id", "name", "email", "created_at"],
          rows: [
            [1, "John Doe", "john@example.com", "2024-01-01"],
            [2, "Jane Smith", "jane@example.com", "2024-01-02"],
            [3, "Bob Johnson", "bob@example.com", "2024-01-03"],
          ],
          rowCount: 3,
          affectedRows: query.type !== "select" ? 1 : undefined,
          executionTime,
        }

        const success = Math.random() > 0.1 // 90% success rate for demo

        setQueries((prev) =>
          prev.map((q) =>
            q.id === query.id
              ? {
                  ...q,
                  status: success ? "completed" : "error",
                  result: success ? mockResult : undefined,
                  executionTime,
                  error: success ? undefined : "Query execution failed: Syntax error",
                }
              : q,
          ),
        )

        onQueryExecute?.(queries.find((q) => q.id === query.id)!)
        return success ? mockResult : null
      } catch (error) {
        setQueries((prev) =>
          prev.map((q) =>
            q.id === query.id
              ? {
                  ...q,
                  status: "error",
                  error: error instanceof Error ? error.message : "Query execution failed",
                }
              : q,
          ),
        )
        return null
      }
    },
    [connections, queries, onQueryExecute],
  )

  // Load database schema
  const loadSchema = useCallback(
    async (connectionId: string) => {
      const connection = connections.find((c) => c.id === connectionId)
      if (!connection || connection.status !== "connected") return

      try {
        // Mock schema loading - in production, query actual database schema
        const mockSchema: DatabaseSchema = {
          tables: [
            {
              name: "users",
              columns: [
                { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
                { name: "name", type: "VARCHAR(255)", nullable: false },
                { name: "email", type: "VARCHAR(255)", nullable: false, unique: true },
                { name: "created_at", type: "TIMESTAMP", nullable: false, defaultValue: "NOW()" },
              ],
              primaryKey: ["id"],
              indexes: ["email_idx"],
              rowCount: 1250,
            },
            {
              name: "posts",
              columns: [
                { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
                { name: "user_id", type: "INTEGER", nullable: false, foreignKey: { table: "users", column: "id" } },
                { name: "title", type: "VARCHAR(500)", nullable: false },
                { name: "content", type: "TEXT", nullable: true },
                { name: "published", type: "BOOLEAN", nullable: false, defaultValue: false },
              ],
              primaryKey: ["id"],
              indexes: ["user_id_idx", "published_idx"],
              rowCount: 3400,
            },
          ],
          views: [],
          indexes: [],
          constraints: [],
        }

        setSchemas((prev) => ({ ...prev, [connectionId]: mockSchema }))
        return mockSchema
      } catch (error) {
        console.error("Failed to load schema:", error)
        return null
      }
    },
    [connections],
  )

  // Helper function to infer query type
  const inferQueryType = useCallback((query: string): DatabaseQuery["type"] => {
    const upperQuery = query.trim().toUpperCase()
    if (upperQuery.startsWith("SELECT")) return "select"
    if (upperQuery.startsWith("INSERT")) return "insert"
    if (upperQuery.startsWith("UPDATE")) return "update"
    if (upperQuery.startsWith("DELETE")) return "delete"
    if (upperQuery.startsWith("CREATE")) return "create"
    if (upperQuery.startsWith("DROP")) return "drop"
    return "select"
  }, [])

  const getConnectionStats = useCallback(
    (connectionId: string) => {
      const connectionQueries = queries.filter((q) => q.connectionId === connectionId)
      const total = connectionQueries.length
      const successful = connectionQueries.filter((q) => q.status === "completed").length
      const avgExecutionTime =
        total > 0 ? connectionQueries.reduce((sum, q) => sum + (q.executionTime || 0), 0) / total : 0

      return { total, successful, avgExecutionTime }
    },
    [queries],
  )

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Database className="w-8 h-8 text-primary" />
          Database Connector & Management
        </h2>
        <p className="text-lg text-muted-foreground">
          Unified database integration, query execution, and schema management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="queries">Query Editor</TabsTrigger>
          <TabsTrigger value="schema">Schema Explorer</TabsTrigger>
          <TabsTrigger value="history">Query History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Database Connections</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Database Connection</DialogTitle>
                </DialogHeader>
                <ConnectionForm onSubmit={createConnection} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => {
              const stats = getConnectionStats(connection.id)
              return (
                <Card key={connection.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            connection.status === "connected"
                              ? "default"
                              : connection.status === "connecting"
                                ? "secondary"
                                : connection.status === "error"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {connection.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(connection.id)}
                          disabled={connection.status === "connecting"}
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${connection.status === "connecting" ? "animate-spin" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {connection.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Host:</span>
                        <span className="font-mono text-xs">
                          {connection.host}:{connection.port}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database:</span>
                        <span className="font-mono text-xs">{connection.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Queries:</span>
                        <span>
                          {stats.total} ({stats.successful} successful)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Time:</span>
                        <span>{stats.avgExecutionTime > 0 ? `${Math.round(stats.avgExecutionTime)}ms` : "N/A"}</span>
                      </div>
                      {connection.lastConnected && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Connected:</span>
                          <span className="text-xs">{connection.lastConnected.toLocaleString()}</span>
                        </div>
                      )}
                      {connection.error && (
                        <div className="text-sm text-red-600 mt-2">
                          <span className="font-medium">Error:</span> {connection.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {connections.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Database Connections</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first database connection to start managing your data
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Connection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Database Connection</DialogTitle>
                    </DialogHeader>
                    <ConnectionForm onSubmit={createConnection} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <QueryEditor
                connections={connections}
                onExecute={executeQuery}
                selectedConnection={selectedConnection}
                onConnectionChange={setSelectedConnection}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Schema Explorer</h3>
            <Select value={selectedConnection || ""} onValueChange={setSelectedConnection}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {connections
                  .filter((c) => c.status === "connected")
                  .map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConnection && schemas[selectedConnection] ? (
            <SchemaViewer schema={schemas[selectedConnection]} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TableIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Schema Loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Select a connected database and load its schema to explore tables and relationships
                </p>
                {selectedConnection && (
                  <Button onClick={() => loadSchema(selectedConnection)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Schema
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {queries.map((query) => {
                    const connection = connections.find((c) => c.id === query.connectionId)
                    return (
                      <div key={query.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {query.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : query.status === "error" ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : query.status === "running" ? (
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{query.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {connection?.name} • {query.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {query.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {query.executionTime ? `${query.executionTime}ms` : "Pending"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{connections.length}</div>
                <div className="text-sm text-muted-foreground">Total Connections</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{queries.filter((q) => q.status === "completed").length}</div>
                <div className="text-sm text-muted-foreground">Successful Queries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {queries.length > 0
                    ? Math.round(queries.reduce((sum, q) => sum + (q.executionTime || 0), 0) / queries.length)
                    : 0}
                  ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Query Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{Object.keys(schemas).length}</div>
                <div className="text-sm text-muted-foreground">Schemas Loaded</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper Components
function ConnectionForm({ onSubmit }: { onSubmit: (connection: Omit<DatabaseConnection, "id" | "status">) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "postgresql" as const,
    host: "localhost",
    port: 5432,
    database: "",
    username: "",
    password: "",
    ssl: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const getDefaultPort = (type: string) => {
    switch (type) {
      case "postgresql":
        return 5432
      case "mysql":
        return 3306
      case "mongodb":
        return 27017
      case "redis":
        return 6379
      default:
        return 5432
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Connection Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Database Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) =>
              setFormData((prev) => ({
                ...prev,
                type: value,
                port: getDefaultPort(value),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="mongodb">MongoDB</SelectItem>
              <SelectItem value="sqlite">SQLite</SelectItem>
              <SelectItem value="redis">Redis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="host">Host</Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="database">Database</Label>
          <Input
            id="database"
            value={formData.database}
            onChange={(e) => setFormData((prev) => ({ ...prev, database: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ssl"
          checked={formData.ssl}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ssl: checked }))}
        />
        <Label htmlFor="ssl">Use SSL</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Connection
      </Button>
    </form>
  )
}

function QueryEditor({
  connections,
  onExecute,
  selectedConnection,
  onConnectionChange,
}: {
  connections: DatabaseConnection[]
  onExecute: (connectionId: string, query: string, name?: string) => Promise<any>
  selectedConnection: string | null
  onConnectionChange: (connectionId: string | null) => void
}) {
  const [query, setQuery] = useState("")
  const [queryName, setQueryName] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    if (!selectedConnection || !query.trim()) return

    setIsExecuting(true)
    try {
      await onExecute(selectedConnection, query, queryName || undefined)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="connection">Database Connection</Label>
        <Select value={selectedConnection || ""} onValueChange={onConnectionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select connection" />
          </SelectTrigger>
          <SelectContent>
            {connections
              .filter((c) => c.status === "connected")
              .map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  {connection.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="queryName">Query Name (Optional)</Label>
        <Input id="queryName" value={queryName} onChange={(e) => setQueryName(e.target.value)} placeholder="My Query" />
      </div>

      <div>
        <Label htmlFor="query">SQL Query</Label>
        <Textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM users LIMIT 10;"
          rows={10}
          className="font-mono"
        />
      </div>

      <Button onClick={handleExecute} disabled={!selectedConnection || !query.trim() || isExecuting} className="w-full">
        {isExecuting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Execute Query
          </>
        )}
      </Button>
    </div>
  )
}

function SchemaViewer({ schema }: { schema: DatabaseSchema }) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const selectedTableData = selectedTable ? schema.tables.find((t) => t.name === selectedTable) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {schema.tables.map((table) => (
              <div
                key={table.name}
                className={`p-2 rounded cursor-pointer ${
                  selectedTable === table.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedTable(table.name)}
              >
                <div className="font-medium">{table.name}</div>
                <div className="text-sm opacity-70">{table.rowCount} rows</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{selectedTable || "Select a table"}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTableData ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Nullable</TableHead>
                  <TableHead>Primary Key</TableHead>
                  <TableHead>Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTableData.columns.map((column) => (
                  <TableRow key={column.name}>
                    <TableCell className="font-medium">{column.name}</TableCell>
                    <TableCell>{column.type}</TableCell>
                    <TableCell>{column.nullable ? "Yes" : "No"}</TableCell>
                    <TableCell>{column.primaryKey ? "Yes" : "No"}</TableCell>
                    <TableCell>{column.defaultValue || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Select a table to view its schema</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseConnector
