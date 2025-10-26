/**
 * Example AI-Integrated React Application
 * Demonstrates the doubled capabilities of the Opencode Framework
 */

import React from "react"
import {
  AIModelSelector,
  AIChat,
  WorkflowBuilder,
  AnalyticsDashboard,
  CollaborationPanel,
  CodeSuggestionsPanel,
  useAI,
  useCodeGeneration,
} from "@opencode/ui-components"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code,
  MessageSquare,
  Brain,
  Sparkles,
  Workflow,
  BarChart3,
  Users,
  Lightbulb,
  Zap,
  Shield,
  Database,
  Cloud,
  Palette,
} from "lucide-react"

function App() {
  const [codePrompt, setCodePrompt] = React.useState("")
  const [generatedCode, setGeneratedCode] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("overview")

  // AI hooks for different purposes
  const { generate, isLoading: aiLoading } = useAI({
    model: "openai/gpt-4o-mini",
    temperature: 0.7,
  })

  const { generateCode, isLoading: codeLoading } = useCodeGeneration({
    model: "openai/gpt-4o",
  })

  const handleGenerateCode = async () => {
    if (!codePrompt.trim()) return

    const response = await generateCode(codePrompt, "typescript", "React component")
    if (response) {
      setGeneratedCode(response.content)
    }
  }

  const handleExplainCode = async () => {
    if (!generatedCode) return

    const response = await generate(
      `Please explain this code:\n\n${generatedCode}`,
      "You are a programming instructor. Explain code clearly and comprehensively.",
    )

    if (response) {
      alert(`Code Explanation:\n\n${response.content}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Opencode AI Framework 2.0
          </h1>
          <p className="text-lg text-muted-foreground">
            Doubled capabilities with advanced AI orchestration, enterprise features, and intelligent UX
          </p>
          <Badge variant="secondary" className="text-sm">
            🚀 2x More Powerful
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="collaboration">Team</TabsTrigger>
            <TabsTrigger value="code">Code AI</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Model Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIModelSelector
                  onModelChange={(model) => console.log("Model changed to:", model)}
                  showDescription={true}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    AI Code Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe the code you want to generate..."
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateCode}
                      disabled={!codePrompt.trim() || codeLoading}
                      className="flex-1"
                    >
                      {codeLoading ? "Generating..." : "Generate Code"}
                    </Button>
                    {generatedCode && (
                      <Button variant="outline" onClick={handleExplainCode} disabled={aiLoading}>
                        Explain Code
                      </Button>
                    )}
                  </div>
                  {generatedCode && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Generated Code:</h4>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{generatedCode}</code>
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AIChat
                    title="AI Assistant"
                    systemMessage="You are a helpful AI assistant integrated into a web application. Provide clear, concise, and actionable responses."
                    placeholder="Ask me anything about development, AI, or get help with your project..."
                    showModelSelector={false}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowBuilder />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="collaboration">
            <CollaborationPanel userId="demo-user" userName="Demo User" />
          </TabsContent>

          <TabsContent value="code">
            <CodeSuggestionsPanel />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* New Features Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 New 2.0 Features - 2x More Powerful</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Workflow className="w-12 h-12 mx-auto text-blue-500" />
                    <h3 className="text-lg font-semibold">Multi-Agent Workflows</h3>
                    <p className="text-sm text-muted-foreground">
                      Orchestrate complex AI workflows with multiple agents working together in dependency chains
                    </p>
                    <Badge variant="secondary">Advanced Orchestration</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <BarChart3 className="w-12 h-12 mx-auto text-green-500" />
                    <h3 className="text-lg font-semibold">Usage Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive analytics dashboard with cost tracking, performance metrics, and usage insights
                    </p>
                    <Badge variant="secondary">Enterprise-Grade</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Users className="w-12 h-12 mx-auto text-purple-500" />
                    <h3 className="text-lg font-semibold">Real-time Collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      Collaborate on AI interactions in real-time with team members and shared model selection
                    </p>
                    <Badge variant="secondary">Team Productivity</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Lightbulb className="w-12 h-12 mx-auto text-yellow-500" />
                    <h3 className="text-lg font-semibold">AI Code Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligent code completion, refactoring suggestions, and optimization recommendations
                    </p>
                    <Badge variant="secondary">Developer Experience</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Zap className="w-12 h-12 mx-auto text-orange-500" />
                    <h3 className="text-lg font-semibold">Smart Caching</h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligent response caching with automatic invalidation and performance optimization
                    </p>
                    <Badge variant="secondary">Performance & Scale</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Shield className="w-12 h-12 mx-auto text-red-500" />
                    <h3 className="text-lg font-semibold">Enterprise Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Security policies, compliance features, and enterprise-grade access controls
                    </p>
                    <Badge variant="secondary">Enterprise Ready</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Database className="w-12 h-12 mx-auto text-indigo-500" />
                    <h3 className="text-lg font-semibold">Advanced Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Database connections, cloud services, and comprehensive API orchestration
                    </p>
                    <Badge variant="secondary">Supercharged</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Palette className="w-12 h-12 mx-auto text-pink-500" />
                    <h3 className="text-lg font-semibold">Intelligent UI/UX</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced components, predictive interfaces, and smart notifications
                    </p>
                    <Badge variant="secondary">Intelligent UX</Badge>
                  </div>

                  <div className="text-center space-y-3 p-4 border rounded-lg">
                    <Cloud className="w-12 h-12 mx-auto text-cyan-500" />
                    <h3 className="text-lg font-semibold">Cloud-Native</h3>
                    <p className="text-sm text-muted-foreground">
                      Background processing, monitoring, and scalable cloud architecture
                    </p>
                    <Badge variant="secondary">Cloud Scale</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Original Features */}
            <Card>
              <CardHeader>
                <CardTitle>✨ Original Framework Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <Brain className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">Universal AI Integration</h3>
                    <p className="text-sm text-muted-foreground">One-line AI integration in any React component</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Code className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">Model Marketplace</h3>
                    <p className="text-sm text-muted-foreground">
                      Easy switching between GPT-4, Claude, Gemini, and more
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">ShadUI Components</h3>
                    <p className="text-sm text-muted-foreground">Beautiful, accessible UI components out of the box</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
