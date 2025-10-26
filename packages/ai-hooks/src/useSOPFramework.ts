/**
 * Standard Operating Procedures (SOP) Framework
 * Pre-built workflows, templates, and best practices for accelerated development
 */

import { useState, useCallback, useRef } from "react"
import { OpenRouterClient, AIMessage } from "@opencode/openrouter-sdk"

export interface SOPTemplate {
  id: string
  name: string
  description: string
  category: "development" | "deployment" | "testing" | "security" | "performance" | "maintenance"
  complexity: "beginner" | "intermediate" | "advanced" | "expert"
  estimatedDuration: string
  prerequisites: string[]
  steps: SOPStep[]
  successCriteria: string[]
  riskFactors: string[]
  tools: string[]
  metadata: {
    author: string
    version: string
    lastUpdated: Date
    usageCount: number
    successRate: number
    tags: string[]
  }
}

export interface SOPStep {
  id: string
  title: string
  description: string
  type: "manual" | "automated" | "verification" | "decision"
  tools: string[]
  inputs: string[]
  outputs: string[]
  estimatedTime: string
  instructions: string[]
  validationCriteria: string[]
  rollbackInstructions?: string[]
}

export interface SOPExecution {
  id: string
  templateId: string
  status: "not_started" | "in_progress" | "completed" | "failed" | "paused"
  currentStep: number
  startTime: Date
  endTime?: Date
  completedSteps: number[]
  failedSteps: number[]
  notes: string[]
  metrics: {
    totalTime: number
    stepsCompleted: number
    errors: number
    rollbacks: number
  }
}

export interface SOPRecommendation {
  template: SOPTemplate
  relevanceScore: number
  reasoning: string
  estimatedSavings: {
    time: string
    cost: string
    quality: string
  }
  prerequisites: string[]
  risks: string[]
}

export function useSOPFramework() {
  const [templates, setTemplates] = useState<SOPTemplate[]>([])
  const [executions, setExecutions] = useState<SOPExecution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<OpenRouterClient | null>(null)

  // Initialize AI client
  const initializeClient = useCallback(async () => {
    if (!clientRef.current) {
      try {
        const { getDefaultClient } = await import("@opencode/openrouter-sdk")
        clientRef.current = getDefaultClient()
      } catch (error) {
        console.error("Failed to initialize AI client:", error)
        throw new Error("AI client initialization failed")
      }
    }
  }, [])

  // Pre-built SOP templates library
  const getSOPTemplates = useCallback(() => {
    const defaultTemplates: SOPTemplate[] = [
      {
        id: "web-app-setup",
        name: "Full-Stack Web Application Setup",
        description: "Complete setup for modern web applications with React, Node.js, and database",
        category: "development",
        complexity: "intermediate",
        estimatedDuration: "2-4 hours",
        prerequisites: ["Node.js installed", "Git configured", "Basic React knowledge"],
        successCriteria: [
          "Application runs locally",
          "Database connected",
          "Basic CRUD operations work",
          "Tests pass",
          "Deployment ready",
        ],
        riskFactors: ["Database connection issues", "Environment configuration", "Dependency conflicts"],
        tools: ["React", "Node.js", "PostgreSQL", "Docker", "Jest"],
        steps: [
          {
            id: "project-init",
            title: "Initialize Project Structure",
            description: "Set up the basic project structure with proper folder organization",
            type: "automated",
            tools: ["CLI", "npm"],
            inputs: ["project name", "technology stack"],
            outputs: ["project folder", "package.json", "initial files"],
            estimatedTime: "15 minutes",
            instructions: [
              "Run 'npx create-react-app <project-name>'",
              "Navigate to project directory",
              "Initialize git repository",
              "Install additional dependencies",
            ],
            validationCriteria: ["Project folder exists", "package.json created", "Dependencies installed"],
          },
          {
            id: "backend-setup",
            title: "Set Up Backend API",
            description: "Create Express.js server with basic routing and middleware",
            type: "automated",
            tools: ["Express.js", "Node.js"],
            inputs: ["API requirements", "database schema"],
            outputs: ["server.js", "routes", "middleware"],
            estimatedTime: "30 minutes",
            instructions: [
              "Install Express and required dependencies",
              "Create server.js with basic configuration",
              "Set up CORS and security middleware",
              "Create basic API routes",
            ],
            validationCriteria: ["Server starts without errors", "API endpoints respond"],
          },
          {
            id: "database-config",
            title: "Configure Database",
            description: "Set up database connection and create initial schema",
            type: "manual",
            tools: ["PostgreSQL", "Prisma"],
            inputs: ["database schema", "connection details"],
            outputs: ["database connection", "schema files", "migrations"],
            estimatedTime: "45 minutes",
            instructions: [
              "Install database driver and ORM",
              "Configure database connection",
              "Create schema definition",
              "Run initial migration",
            ],
            validationCriteria: ["Database connection successful", "Tables created", "Sample data inserted"],
          },
          {
            id: "frontend-integration",
            title: "Integrate Frontend with Backend",
            description: "Connect React frontend with API endpoints",
            type: "automated",
            tools: ["React", "Axios", "React Query"],
            inputs: ["API endpoints", "data requirements"],
            outputs: ["API client", "data fetching hooks", "state management"],
            estimatedTime: "1 hour",
            instructions: [
              "Install HTTP client library",
              "Create API service functions",
              "Implement data fetching hooks",
              "Add error handling and loading states",
            ],
            validationCriteria: ["API calls work", "Data displays in UI", "Error states handled"],
          },
          {
            id: "testing-setup",
            title: "Set Up Testing Framework",
            description: "Configure unit and integration tests",
            type: "automated",
            tools: ["Jest", "React Testing Library", "Supertest"],
            inputs: ["component list", "API endpoints"],
            outputs: ["test files", "test configuration", "CI pipeline"],
            estimatedTime: "30 minutes",
            instructions: [
              "Install testing libraries",
              "Configure Jest and testing environment",
              "Create basic component tests",
              "Set up API integration tests",
            ],
            validationCriteria: ["Tests run successfully", "Coverage report generated", "CI pipeline configured"],
          },
          {
            id: "deployment-prep",
            title: "Prepare for Deployment",
            description: "Configure production build and deployment settings",
            type: "manual",
            tools: ["Docker", "Vercel", "GitHub Actions"],
            inputs: ["deployment platform", "environment variables"],
            outputs: ["Dockerfile", "deployment config", "CI/CD pipeline"],
            estimatedTime: "45 minutes",
            instructions: [
              "Create production build configuration",
              "Set up environment variables",
              "Configure deployment platform",
              "Test deployment pipeline",
            ],
            validationCriteria: ["Production build succeeds", "Deployment successful", "Application accessible"],
          },
        ],
        metadata: {
          author: "Opencode Framework",
          version: "2.0.0",
          lastUpdated: new Date(),
          usageCount: 1250,
          successRate: 0.89,
          tags: ["web-development", "fullstack", "react", "nodejs", "database"],
        },
      },
      {
        id: "ai-integration",
        name: "AI Feature Integration",
        description: "Integrate AI capabilities into existing applications",
        category: "development",
        complexity: "advanced",
        estimatedDuration: "3-6 hours",
        prerequisites: ["Existing application", "AI API access", "Basic AI knowledge"],
        successCriteria: [
          "AI features functional",
          "Error handling implemented",
          "Performance optimized",
          "Security measures in place",
        ],
        riskFactors: ["API rate limits", "Cost overruns", "Data privacy concerns"],
        tools: ["OpenRouter", "AI SDK", "Caching", "Monitoring"],
        steps: [
          {
            id: "ai-requirements",
            title: "Define AI Requirements",
            description: "Identify which features need AI capabilities",
            type: "manual",
            tools: ["Requirements analysis"],
            inputs: ["feature list", "use cases"],
            outputs: ["AI feature specification", "API requirements"],
            estimatedTime: "30 minutes",
            instructions: [
              "List features requiring AI",
              "Define input/output formats",
              "Estimate API usage and costs",
              "Identify fallback mechanisms",
            ],
            validationCriteria: ["Requirements documented", "Costs estimated", "Technical feasibility confirmed"],
          },
          {
            id: "ai-client-setup",
            title: "Set Up AI Client",
            description: "Configure AI API client with proper authentication",
            type: "automated",
            tools: ["OpenRouter SDK", "Environment config"],
            inputs: ["API keys", "model preferences"],
            outputs: ["AI client configuration", "error handling"],
            estimatedTime: "20 minutes",
            instructions: [
              "Install AI SDK",
              "Configure API credentials",
              "Set up client with retry logic",
              "Implement rate limiting",
            ],
            validationCriteria: ["Client initializes", "API calls work", "Error handling functional"],
          },
          {
            id: "ai-feature-implementation",
            title: "Implement AI Features",
            description: "Build AI-powered features with proper error handling",
            type: "automated",
            tools: ["React hooks", "AI SDK", "Error boundaries"],
            inputs: ["feature specifications", "UI components"],
            outputs: ["AI feature components", "integration tests"],
            estimatedTime: "2 hours",
            instructions: [
              "Create AI feature hooks",
              "Implement UI components",
              "Add loading and error states",
              "Create integration tests",
            ],
            validationCriteria: ["Features work as expected", "Error states handled", "Performance acceptable"],
          },
          {
            id: "caching-optimization",
            title: "Implement Caching and Optimization",
            description: "Add caching to reduce API costs and improve performance",
            type: "automated",
            tools: ["Redis", "Local storage", "Cache invalidation"],
            inputs: ["usage patterns", "cache requirements"],
            outputs: ["caching layer", "performance metrics"],
            estimatedTime: "1 hour",
            instructions: [
              "Implement response caching",
              "Set up cache invalidation",
              "Monitor cache hit rates",
              "Optimize cache strategies",
            ],
            validationCriteria: ["Cache working", "Performance improved", "Costs reduced"],
          },
          {
            id: "security-monitoring",
            title: "Add Security and Monitoring",
            description: "Implement security measures and monitoring for AI features",
            type: "manual",
            tools: ["Security audit", "Monitoring tools", "Logging"],
            inputs: ["security requirements", "monitoring needs"],
            outputs: ["security measures", "monitoring dashboard"],
            estimatedTime: "45 minutes",
            instructions: [
              "Implement input validation",
              "Add rate limiting",
              "Set up monitoring and alerts",
              "Create audit logs",
            ],
            validationCriteria: ["Security vulnerabilities addressed", "Monitoring active", "Alerts configured"],
          },
        ],
        metadata: {
          author: "Opencode Framework",
          version: "2.0.0",
          lastUpdated: new Date(),
          usageCount: 890,
          successRate: 0.94,
          tags: ["ai-integration", "machine-learning", "api-integration", "security"],
        },
      },
      {
        id: "deployment-automation",
        name: "Automated Deployment Pipeline",
        description: "Set up CI/CD pipeline with automated testing and deployment",
        category: "deployment",
        complexity: "intermediate",
        estimatedDuration: "2-3 hours",
        prerequisites: ["Git repository", "Hosting platform", "Basic CI/CD knowledge"],
        successCriteria: [
          "Automated testing on commits",
          "Successful deployments",
          "Rollback capability",
          "Monitoring and alerts",
        ],
        riskFactors: ["Pipeline failures", "Environment inconsistencies", "Security vulnerabilities"],
        tools: ["GitHub Actions", "Docker", "Kubernetes", "Monitoring"],
        steps: [
          {
            id: "ci-setup",
            title: "Set Up Continuous Integration",
            description: "Configure automated testing and code quality checks",
            type: "automated",
            tools: ["GitHub Actions", "Jest", "ESLint"],
            inputs: ["test scripts", "code quality rules"],
            outputs: ["CI pipeline", "test reports", "code coverage"],
            estimatedTime: "30 minutes",
            instructions: [
              "Create GitHub Actions workflow",
              "Configure test execution",
              "Set up code quality checks",
              "Configure coverage reporting",
            ],
            validationCriteria: ["Pipeline runs on commits", "Tests pass", "Reports generated"],
          },
          {
            id: "containerization",
            title: "Containerize Application",
            description: "Create Docker configuration for consistent deployments",
            type: "automated",
            tools: ["Docker", "Docker Compose"],
            inputs: ["application structure", "dependencies"],
            outputs: ["Dockerfile", "docker-compose.yml"],
            estimatedTime: "45 minutes",
            instructions: [
              "Create multi-stage Dockerfile",
              "Configure environment variables",
              "Set up docker-compose for local development",
              "Test container builds",
            ],
            validationCriteria: ["Container builds successfully", "Application runs in container"],
          },
          {
            id: "cd-setup",
            title: "Configure Continuous Deployment",
            description: "Set up automated deployment to staging and production",
            type: "manual",
            tools: ["GitHub Actions", "Vercel", "AWS"],
            inputs: ["deployment targets", "environment configs"],
            outputs: ["CD pipeline", "deployment scripts"],
            estimatedTime: "1 hour",
            instructions: [
              "Configure staging deployment",
              "Set up production deployment",
              "Implement blue-green deployment",
              "Configure rollback procedures",
            ],
            validationCriteria: ["Staging deployments work", "Production deployments automated", "Rollback functional"],
          },
          {
            id: "monitoring-alerts",
            title: "Set Up Monitoring and Alerts",
            description: "Configure application monitoring and alerting",
            type: "automated",
            tools: ["Application monitoring", "Error tracking", "Performance monitoring"],
            inputs: ["monitoring requirements", "alert thresholds"],
            outputs: ["monitoring dashboard", "alert configurations"],
            estimatedTime: "30 minutes",
            instructions: [
              "Set up application monitoring",
              "Configure error tracking",
              "Create performance dashboards",
              "Set up alert notifications",
            ],
            validationCriteria: ["Monitoring active", "Alerts configured", "Dashboards accessible"],
          },
        ],
        metadata: {
          author: "Opencode Framework",
          version: "2.0.0",
          lastUpdated: new Date(),
          usageCount: 675,
          successRate: 0.91,
          tags: ["deployment", "ci-cd", "automation", "monitoring"],
        },
      },
    ]

    setTemplates(defaultTemplates)
    return defaultTemplates
  }, [])

  // Get SOP recommendations based on project requirements
  const getSOPRecommendations = useCallback(
    async (
      projectType: string,
      requirements: string[],
      currentCapabilities: string[],
    ): Promise<SOPRecommendation[]> => {
      await initializeClient()
      setIsLoading(true)

      try {
        const templates = getSOPTemplates()
        const prompt = `Analyze this project and recommend the most relevant SOP templates:

Project Type: ${projectType}
Requirements: ${requirements.join(", ")}
Current Capabilities: ${currentCapabilities.join(", ")}

Available SOP Templates:
${templates.map((t) => `${t.id}: ${t.name} (${t.category}) - ${t.description}`).join("\n")}

For each relevant template, provide:
1. Relevance score (0-1)
2. Why it's recommended
3. Estimated time/cost/quality savings
4. Prerequisites and risks

Return as JSON array.`

        const messages: AIMessage[] = [
          {
            role: "system",
            content:
              "You are an expert project manager. Recommend the most appropriate SOP templates based on project requirements and current capabilities.",
          },
          { role: "user", content: prompt },
        ]

        const response = await clientRef.current!.generate(messages, {
          model: "openai/gpt-4o",
          temperature: 0.3,
          max_tokens: 1500,
        })

        // Parse AI recommendations and match with templates
        const recommendations: SOPRecommendation[] = templates
          .filter((template) => {
            // Simple relevance matching - in production, use parsed AI response
            const relevantCategories = {
              web: ["web-app-setup", "ai-integration"],
              backend: ["deployment-automation"],
              ai: ["ai-integration"],
              fullstack: ["web-app-setup", "ai-integration", "deployment-automation"],
            }
            return relevantCategories[projectType as keyof typeof relevantCategories]?.includes(template.id)
          })
          .map((template) => ({
            template,
            relevanceScore: Math.random() * 0.4 + 0.6, // Mock score - use AI response in production
            reasoning: `This template provides proven processes for ${template.category} tasks in ${projectType} projects.`,
            estimatedSavings: {
              time: template.estimatedDuration,
              cost: "20-40% reduction",
              quality: "Standardized best practices",
            },
            prerequisites: template.prerequisites,
            risks: template.riskFactors,
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore)

        return recommendations
      } finally {
        setIsLoading(false)
      }
    },
    [initializeClient, getSOPTemplates],
  )

  // Execute SOP template
  const executeSOP = useCallback(
    async (templateId: string, context: Record<string, any> = {}): Promise<SOPExecution> => {
      const templates = getSOPTemplates()
      const template = templates.find((t) => t.id === templateId)

      if (!template) {
        throw new Error(`SOP template ${templateId} not found`)
      }

      const execution: SOPExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        status: "in_progress",
        currentStep: 0,
        startTime: new Date(),
        completedSteps: [],
        failedSteps: [],
        notes: [],
        metrics: {
          totalTime: 0,
          stepsCompleted: 0,
          errors: 0,
          rollbacks: 0,
        },
      }

      setExecutions((prev) => [...prev, execution])
      return execution
    },
    [getSOPTemplates],
  )

  // Update SOP execution progress
  const updateSOPProgress = useCallback(
    (executionId: string, stepId: string, status: "completed" | "failed", notes?: string) => {
      setExecutions((prev) =>
        prev.map((exec) => {
          if (exec.id !== executionId) return exec

          const updated = { ...exec }
          if (status === "completed") {
            updated.completedSteps.push(parseInt(stepId))
            updated.currentStep = Math.max(updated.currentStep, parseInt(stepId) + 1)
            updated.metrics.stepsCompleted++
          } else {
            updated.failedSteps.push(parseInt(stepId))
            updated.metrics.errors++
          }

          if (notes) {
            updated.notes.push(notes)
          }

          // Check if execution is complete
          const template = getSOPTemplates().find((t) => t.id === exec.templateId)
          if (template && updated.completedSteps.length === template.steps.length) {
            updated.status = "completed"
            updated.endTime = new Date()
            updated.metrics.totalTime = updated.endTime.getTime() - updated.startTime.getTime()
          }

          return updated
        }),
      )
    },
    [getSOPTemplates],
  )

  // Generate custom SOP template
  const generateCustomSOP = useCallback(
    async (
      task: string,
      context: string,
      complexity: "beginner" | "intermediate" | "advanced" | "expert" = "intermediate",
    ): Promise<SOPTemplate> => {
      await initializeClient()
      setIsLoading(true)

      try {
        const prompt = `Create a comprehensive Standard Operating Procedure (SOP) for this task:

Task: ${task}
Context: ${context}
Target Complexity: ${complexity}

Generate a complete SOP with:
1. Step-by-step instructions
2. Required tools and prerequisites
3. Success criteria and validation
4. Risk factors and mitigation
5. Estimated time and resources
6. Troubleshooting guide

Format as detailed, actionable procedure.`

        const messages: AIMessage[] = [
          {
            role: "system",
            content:
              "You are an expert process engineer. Create detailed, actionable SOPs that ensure consistent and successful outcomes.",
          },
          { role: "user", content: prompt },
        ]

        const response = await clientRef.current!.generate(messages, {
          model: "openai/gpt-4o",
          temperature: 0.2,
          max_tokens: 2500,
        })

        const customTemplate: SOPTemplate = {
          id: `custom_${Date.now()}`,
          name: `${task} Procedure`,
          description: `Custom SOP for ${task}`,
          category: "development",
          complexity,
          estimatedDuration: "1-2 hours", // Would be parsed from AI response
          prerequisites: [], // Would be parsed from AI response
          steps: [], // Would be parsed from AI response
          successCriteria: [],
          riskFactors: [],
          tools: [],
          metadata: {
            author: "AI Generated",
            version: "1.0.0",
            lastUpdated: new Date(),
            usageCount: 0,
            successRate: 0,
            tags: ["custom", "generated"],
          },
        }

        setTemplates((prev) => [...prev, customTemplate])
        return customTemplate
      } finally {
        setIsLoading(false)
      }
    },
    [initializeClient],
  )

  return {
    templates,
    executions,
    isLoading,
    getSOPTemplates,
    getSOPRecommendations,
    executeSOP,
    updateSOPProgress,
    generateCustomSOP,
    clearExecutions: useCallback(() => setExecutions([]), []),
  }
}
