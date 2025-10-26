/**
 * Code Suggestions Panel Component - Enhanced Developer Experience
 * AI-powered code completion, refactoring, and optimization suggestions
 */

import React, { useState, useEffect } from "react"
import { useCodeSuggestions, CodeSuggestion } from "@opencode/ai-hooks"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Lightbulb, CheckCircle, X, RefreshCw, Copy, Sparkles, AlertTriangle, Zap, Target } from "lucide-react"

interface CodeSuggestionsPanelProps {
  className?: string
}

export function CodeSuggestionsPanel({ className = "" }: CodeSuggestionsPanelProps) {
  const { suggestions, isAnalyzing, analyzeCode, applySuggestion, clearSuggestions } = useCodeSuggestions()
  const [codeInput, setCodeInput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("typescript")
  const [context, setContext] = useState("")
  const [activeTab, setActiveTab] = useState("input")

  const handleAnalyzeCode = async () => {
    if (!codeInput.trim()) return
    await analyzeCode(codeInput, selectedLanguage, context)
    setActiveTab("suggestions")
  }

  const handleApplySuggestion = (suggestionId: string) => {
    applySuggestion(suggestionId)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "completion":
        return <Code className="w-4 h-4 text-blue-500" />
      case "refactor":
        return <RefreshCw className="w-4 h-4 text-green-500" />
      case "optimization":
        return <Zap className="w-4 h-4 text-purple-500" />
      case "bugfix":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "completion":
        return "bg-blue-100 text-blue-800"
      case "refactor":
        return "bg-green-100 text-green-800"
      case "optimization":
        return "bg-purple-100 text-purple-800"
      case "bugfix":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Code Assistant
        </h2>
        <p className="text-lg text-muted-foreground">Get intelligent code suggestions, completions, and improvements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Code Input</TabsTrigger>
          <TabsTrigger value="suggestions" disabled={suggestions.length === 0}>
            Suggestions ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code to Analyze
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="context">Context (Optional)</Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Describe what this code does or what you're trying to achieve..."
                    rows={2}
                  />
                </div>

                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={`Paste your ${selectedLanguage} code here...`}
                  rows={15}
                  className="font-mono text-sm"
                />

                <Button onClick={handleAnalyzeCode} disabled={!codeInput.trim() || isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Quick Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setCodeInput(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`)
                    }
                  >
                    <h4 className="font-medium">Simple Function</h4>
                    <p className="text-sm text-muted-foreground">Get suggestions for optimization and best practices</p>
                  </div>

                  <div
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setCodeInput(`class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  save() {
    // TODO: implement save logic
  }

  validate() {
    if (!this.name) return false;
    if (!this.email) return false;
    return true;
  }
}`)
                    }
                  >
                    <h4 className="font-medium">Class Implementation</h4>
                    <p className="text-sm text-muted-foreground">Complete missing methods and improve structure</p>
                  </div>

                  <div
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setCodeInput(`async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}`)
                    }
                  >
                    <h4 className="font-medium">Async Function</h4>
                    <p className="text-sm text-muted-foreground">Improve error handling and add TypeScript types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {suggestions.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
                    <div className="text-sm text-muted-foreground">Total Suggestions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {suggestions.filter((s) => s.type === "completion").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {suggestions.filter((s) => s.type === "optimization").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Optimizations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {suggestions.filter((s) => s.type === "bugfix").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Bug Fixes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>AI Suggestions</CardTitle>
                    <Button variant="outline" size="sm" onClick={clearSuggestions}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {suggestions
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((suggestion) => (
                          <div key={suggestion.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getSuggestionIcon(suggestion.type)}
                                <Badge className={getSuggestionColor(suggestion.type)}>{suggestion.type}</Badge>
                                <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(suggestion.content)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={() => handleApplySuggestion(suggestion.id)}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Apply
                                </Button>
                              </div>
                            </div>

                            <div className="mb-3">
                              <h4 className="font-medium mb-1">Suggestion</h4>
                              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Code</h4>
                              <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto font-mono">
                                <code>{suggestion.content}</code>
                              </pre>
                            </div>

                            {suggestion.lineNumber && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Suggested for line {suggestion.lineNumber}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Suggestions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add some code and click "Get AI Suggestions" to see intelligent recommendations
                </p>
                <Button onClick={() => setActiveTab("input")}>
                  <Code className="w-4 h-4 mr-2" />
                  Go to Code Input
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CodeSuggestionsPanel
