/**
 * Capability Evaluation Framework
 * Intelligent assessment and recommendation system for project requirements
 */

import { useState, useCallback, useRef } from "react"
import { OpenRouterClient, AIMessage } from "@opencode/openrouter-sdk"

export interface ProjectRequirement {
  id: string
  category: "frontend" | "backend" | "database" | "ai" | "deployment" | "testing" | "security" | "performance"
  name: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  complexity: "simple" | "moderate" | "complex" | "expert"
  estimatedEffort: string
  dependencies: string[]
  acceptanceCriteria: string[]
}

export interface ToolCapability {
  id: string
  name: string
  category: "framework" | "library" | "platform" | "service" | "tool"
  type: "frontend" | "backend" | "database" | "ai" | "deployment" | "testing" | "security" | "performance"
  description: string
  strengths: string[]
  limitations: string[]
  useCases: string[]
  learningCurve: "beginner" | "intermediate" | "advanced"
  ecosystem: {
    popularity: number // 1-10 scale
    maintenance: "active" | "stable" | "deprecated"
    community: number // 1-10 scale
  }
  compatibility: string[]
  cost: {
    type: "free" | "freemium" | "paid" | "enterprise"
    pricing?: string
  }
}

export interface CapabilityAssessment {
  requirement: ProjectRequirement
  currentCapability: number // 0-10 scale
  gapAnalysis: {
    gaps: string[]
    severity: "low" | "medium" | "high" | "critical"
    impact: string
  }
  recommendations: ToolRecommendation[]
  implementationPlan: {
    phases: string[]
    timeline: string
    resources: string[]
    risks: string[]
  }
  confidence: number // 0-1 scale
}

export interface ToolRecommendation {
  tool: ToolCapability
  relevanceScore: number // 0-1 scale
  reasoning: string
  implementationEffort: "low" | "medium" | "high"
  businessValue: {
    timeSavings: string
    costImpact: string
    qualityImprovement: string
    scalability: string
  }
  prerequisites: string[]
  alternatives: string[]
}

export interface ProjectAssessment {
  overallScore: number // 0-10 scale
  capabilityBreakdown: Record<string, number>
  criticalGaps: string[]
  recommendedRoadmap: {
    immediate: ToolRecommendation[]
    shortTerm: ToolRecommendation[]
    longTerm: ToolRecommendation[]
  }
  estimatedTimeline: string
  totalCost: string
  riskAssessment: {
    technical: string[]
    business: string[]
    operational: string[]
  }
}

export function useCapabilityEvaluation() {
  const [assessments, setAssessments] = useState<CapabilityAssessment[]>([])
  const [currentAssessment, setCurrentAssessment] = useState<ProjectAssessment | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
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

  // Comprehensive tool capabilities database
  const getToolCapabilities = useCallback((): ToolCapability[] => {
    return [
      // Frontend Frameworks
      {
        id: "react",
        name: "React",
        category: "framework",
        type: "frontend",
        description: "Component-based UI library for building interactive user interfaces",
        strengths: ["Component reusability", "Virtual DOM performance", "Rich ecosystem", "Strong community"],
        limitations: ["Learning curve for JSX", "Frequent updates", "Large bundle size if not optimized"],
        useCases: ["SPAs", "Complex UIs", "Real-time applications", "Enterprise applications"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 10, maintenance: "active", community: 10 },
        compatibility: ["TypeScript", "Next.js", "Vite", "Webpack"],
        cost: { type: "free" },
      },
      {
        id: "vue",
        name: "Vue.js",
        category: "framework",
        type: "frontend",
        description: "Progressive framework for building user interfaces",
        strengths: ["Gentle learning curve", "Flexible architecture", "Excellent documentation", "Small bundle size"],
        limitations: ["Smaller ecosystem than React", "Less corporate adoption"],
        useCases: ["Rapid prototyping", "Small to medium applications", "Progressive enhancement"],
        learningCurve: "beginner",
        ecosystem: { popularity: 8, maintenance: "active", community: 8 },
        compatibility: ["TypeScript", "Nuxt.js", "Vite"],
        cost: { type: "free" },
      },
      {
        id: "angular",
        name: "Angular",
        category: "framework",
        type: "frontend",
        description: "Platform for building mobile and desktop web applications",
        strengths: ["Full-featured framework", "TypeScript native", "Enterprise support", "Strong tooling"],
        limitations: ["Steep learning curve", "Heavy bundle size", "Complex architecture"],
        useCases: ["Large enterprise applications", "Complex SPAs", "Long-term projects"],
        learningCurve: "advanced",
        ecosystem: { popularity: 7, maintenance: "active", community: 8 },
        compatibility: ["TypeScript", "Angular CLI", "RxJS"],
        cost: { type: "free" },
      },

      // Backend Frameworks
      {
        id: "nodejs",
        name: "Node.js",
        category: "platform",
        type: "backend",
        description: "JavaScript runtime for server-side development",
        strengths: ["Same language frontend/backend", "High performance", "Rich ecosystem", "Microservices friendly"],
        limitations: ["Single-threaded", "Callback hell potential", "Memory intensive"],
        useCases: ["APIs", "Real-time applications", "Microservices", "CLI tools"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 10, maintenance: "active", community: 10 },
        compatibility: ["Express", "Fastify", "NestJS", "TypeScript"],
        cost: { type: "free" },
      },
      {
        id: "python-fastapi",
        name: "FastAPI",
        category: "framework",
        type: "backend",
        description: "Modern, fast web framework for building APIs with Python",
        strengths: ["High performance", "Auto-generated docs", "Type hints", "Async support"],
        limitations: ["Python ecosystem dependency", "Less mature than Flask/Django"],
        useCases: ["REST APIs", "ML APIs", "High-performance services"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 8, maintenance: "active", community: 7 },
        compatibility: ["Python", "Pydantic", "SQLAlchemy", "Docker"],
        cost: { type: "free" },
      },

      // Databases
      {
        id: "postgresql",
        name: "PostgreSQL",
        category: "platform",
        type: "database",
        description: "Advanced open source relational database",
        strengths: ["ACID compliance", "Advanced features", "Extensible", "Strong SQL support"],
        limitations: ["Complex setup", "Resource intensive", "Learning curve"],
        useCases: ["Enterprise applications", "Complex queries", "Data integrity critical apps"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 9, maintenance: "active", community: 9 },
        compatibility: ["Prisma", "TypeORM", "SQLAlchemy"],
        cost: { type: "free" },
      },
      {
        id: "mongodb",
        name: "MongoDB",
        category: "platform",
        type: "database",
        description: "Document-oriented NoSQL database",
        strengths: ["Flexible schema", "Horizontal scaling", "JSON-like documents", "Developer friendly"],
        limitations: ["No transactions (until recently)", "Memory intensive", "Less mature ecosystem"],
        useCases: ["Content management", "Real-time analytics", "Flexible data models"],
        learningCurve: "beginner",
        ecosystem: { popularity: 9, maintenance: "active", community: 8 },
        compatibility: ["Mongoose", "MongoDB Driver", "Prisma"],
        cost: { type: "freemium" },
      },

      // AI/ML Tools
      {
        id: "openai-api",
        name: "OpenAI API",
        category: "service",
        type: "ai",
        description: "Access to GPT models for text generation and analysis",
        strengths: ["High-quality output", "Versatile models", "Easy integration", "Well-documented"],
        limitations: ["API costs", "Rate limits", "Dependency on external service"],
        useCases: ["Text generation", "Code assistance", "Content creation", "Analysis"],
        learningCurve: "beginner",
        ecosystem: { popularity: 10, maintenance: "active", community: 9 },
        compatibility: ["REST API", "SDKs", "OpenRouter"],
        cost: { type: "paid", pricing: "$0.002/1K tokens" },
      },
      {
        id: "huggingface",
        name: "Hugging Face",
        category: "platform",
        type: "ai",
        description: "Platform for machine learning models and datasets",
        strengths: ["Open source models", "Wide variety", "Community driven", "Easy deployment"],
        limitations: ["Model quality varies", "Resource requirements", "Complex setup"],
        useCases: ["Custom ML models", "NLP tasks", "Computer vision", "Research"],
        learningCurve: "advanced",
        ecosystem: { popularity: 9, maintenance: "active", community: 8 },
        compatibility: ["Transformers", "Datasets", "Inference API"],
        cost: { type: "freemium" },
      },

      // Deployment & DevOps
      {
        id: "vercel",
        name: "Vercel",
        category: "platform",
        type: "deployment",
        description: "Frontend cloud platform for static sites and serverless functions",
        strengths: ["Zero config deployment", "Global CDN", "Preview deployments", "Git integration"],
        limitations: ["Limited backend capabilities", "Vendor lock-in", "Cost scaling"],
        useCases: ["Frontend applications", "Static sites", "Jamstack apps", "API routes"],
        learningCurve: "beginner",
        ecosystem: { popularity: 9, maintenance: "active", community: 8 },
        compatibility: ["Next.js", "React", "Vue", "Angular"],
        cost: { type: "freemium" },
      },
      {
        id: "docker",
        name: "Docker",
        category: "tool",
        type: "deployment",
        description: "Containerization platform for application deployment",
        strengths: ["Consistent environments", "Portability", "Isolation", "Ecosystem"],
        limitations: ["Learning curve", "Resource overhead", "Security concerns"],
        useCases: ["Microservices", "Development environments", "CI/CD", "Multi-platform deployment"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 10, maintenance: "active", community: 10 },
        compatibility: ["Kubernetes", "Docker Compose", "CI/CD tools"],
        cost: { type: "free" },
      },

      // Testing Tools
      {
        id: "jest",
        name: "Jest",
        category: "tool",
        type: "testing",
        description: "JavaScript testing framework with built-in mocking and coverage",
        strengths: ["Zero configuration", "Fast execution", "Rich assertions", "Snapshot testing"],
        limitations: ["Primarily for JavaScript", "Large test suites can be slow"],
        useCases: ["Unit testing", "Integration testing", "Component testing", "API testing"],
        learningCurve: "beginner",
        ecosystem: { popularity: 9, maintenance: "active", community: 9 },
        compatibility: ["React", "Vue", "Node.js", "TypeScript"],
        cost: { type: "free" },
      },
      {
        id: "cypress",
        name: "Cypress",
        category: "tool",
        type: "testing",
        description: "End-to-end testing framework for web applications",
        strengths: ["Real browser testing", "Time travel debugging", "Automatic waits", "Rich dashboard"],
        limitations: ["Chrome/Edge only", "Slower than unit tests", "Setup complexity"],
        useCases: ["E2E testing", "Integration testing", "UI testing", "Critical path testing"],
        learningCurve: "intermediate",
        ecosystem: { popularity: 8, maintenance: "active", community: 7 },
        compatibility: ["React", "Vue", "Angular", "Any web app"],
        cost: { type: "free" },
      },

      // Security Tools
      {
        id: "owasp-zap",
        name: "OWASP ZAP",
        category: "tool",
        type: "security",
        description: "Web application security scanner and proxy",
        strengths: ["Comprehensive scanning", "Automated testing", "Extensible", "Free"],
        limitations: ["False positives", "Learning curve", "Performance impact"],
        useCases: ["Security testing", "Vulnerability assessment", "Penetration testing", "Compliance"],
        learningCurve: "advanced",
        ecosystem: { popularity: 7, maintenance: "active", community: 6 },
        compatibility: ["Web applications", "APIs", "CI/CD pipelines"],
        cost: { type: "free" },
      },

      // Performance Tools
      {
        id: "lighthouse",
        name: "Lighthouse",
        category: "tool",
        type: "performance",
        description: "Automated tool for improving web app quality",
        strengths: ["Comprehensive audits", "Actionable recommendations", "Integrated into DevTools", "Free"],
        limitations: ["Lab data only", "Limited customization", "Requires Chrome"],
        useCases: ["Performance auditing", "SEO analysis", "Accessibility testing", "Best practices"],
        learningCurve: "beginner",
        ecosystem: { popularity: 8, maintenance: "active", community: 7 },
        compatibility: ["Web applications", "Chrome DevTools", "CI/CD"],
        cost: { type: "free" },
      },
    ]
  }, [])

  // Assess project requirements and capabilities
  const assessProject = useCallback(
    async (
      requirements: ProjectRequirement[],
      currentStack: string[],
      projectGoals: string[],
      constraints: string[] = [],
    ): Promise<ProjectAssessment> => {
      await initializeClient()
      setIsEvaluating(true)

      try {
        const tools = getToolCapabilities()
        const prompt = `Assess this project comprehensively:

Project Requirements:
${requirements.map((r) => `- ${r.name} (${r.priority}): ${r.description}`).join("\n")}

Current Technology Stack:
${currentStack.join(", ")}

Project Goals:
${projectGoals.join(", ")}

Constraints:
${constraints.join(", ")}

Available Tools:
${tools.map((t) => `${t.id}: ${t.name} (${t.type}) - ${t.description}`).join("\n")}

Provide a detailed assessment including:
1. Overall project readiness score (0-10)
2. Capability gaps by category
3. Critical issues requiring immediate attention
4. Recommended tools and technologies
5. Implementation roadmap (immediate/short-term/long-term)
6. Timeline and cost estimates
7. Risk assessment

Return structured analysis with actionable recommendations.`

        const messages: AIMessage[] = [
          {
            role: "system",
            content:
              "You are a senior technical architect and project manager. Provide comprehensive project assessments with strategic recommendations and practical implementation plans.",
          },
          { role: "user", content: prompt },
        ]

        const response = await clientRef.current!.generate(messages, {
          model: "openai/gpt-4o",
          temperature: 0.3,
          max_tokens: 3000,
        })

        // Generate detailed assessments for each requirement
        const detailedAssessments = await Promise.all(
          requirements.map(async (req) => {
            const assessmentPrompt = `Assess capability for: ${req.name}

Requirement: ${req.description}
Priority: ${req.priority}
Complexity: ${req.complexity}

Current stack: ${currentStack.join(", ")}
Available tools: ${tools
              .filter((t) => t.type === req.category)
              .map((t) => t.name)
              .join(", ")}

Provide:
1. Current capability level (0-10)
2. Specific gaps identified
3. Recommended tools with reasoning
4. Implementation effort and timeline`

            const assessmentResponse = await clientRef.current!.generate(
              [
                {
                  role: "system",
                  content: "Assess technical capabilities and provide specific recommendations.",
                },
                {
                  role: "user",
                  content: assessmentPrompt,
                },
              ],
              {
                model: "openai/gpt-4o",
                temperature: 0.2,
                max_tokens: 1000,
              },
            )

            // Create mock assessment - in production, parse AI response
            const relevantTools = tools.filter((t) => t.type === req.category).slice(0, 3)
            const assessment: CapabilityAssessment = {
              requirement: req,
              currentCapability: Math.floor(Math.random() * 6) + 3, // Mock 3-8 range
              gapAnalysis: {
                gaps: [`Limited experience with ${req.category} technologies`, "Need specialized tooling"],
                severity: req.priority === "critical" ? "high" : "medium",
                impact: `Affects ${req.name} implementation quality and timeline`,
              },
              recommendations: relevantTools.map((tool) => ({
                tool,
                relevanceScore: Math.random() * 0.4 + 0.6,
                reasoning: `${tool.name} provides excellent ${req.category} capabilities for ${req.name}`,
                implementationEffort:
                  tool.learningCurve === "beginner" ? "low" : tool.learningCurve === "intermediate" ? "medium" : "high",
                businessValue: {
                  timeSavings: "20-40%",
                  costImpact: tool.cost.type === "free" ? "Cost reduction" : "Premium investment",
                  qualityImprovement: "Industry best practices",
                  scalability: "Enterprise-ready",
                },
                prerequisites: tool.compatibility.slice(0, 2),
                alternatives: tools
                  .filter((t) => t.type === req.category && t.id !== tool.id)
                  .slice(0, 2)
                  .map((t) => t.name),
              })),
              implementationPlan: {
                phases: ["Planning", "Setup", "Development", "Testing", "Deployment"],
                timeline:
                  req.complexity === "simple"
                    ? "1-2 weeks"
                    : req.complexity === "moderate"
                      ? "2-4 weeks"
                      : "1-3 months",
                resources: [`${req.complexity} developer`, "Technical lead", "QA engineer"],
                risks: ["Technology learning curve", "Integration challenges", "Timeline delays"],
              },
              confidence: 0.85,
            }

            return assessment
          }),
        )

        setAssessments(detailedAssessments)

        // Calculate overall project assessment
        const overallScore =
          detailedAssessments.reduce((sum, a) => sum + a.currentCapability, 0) / detailedAssessments.length
        const capabilityBreakdown = detailedAssessments.reduce(
          (acc, assessment) => {
            acc[assessment.requirement.category] =
              (acc[assessment.requirement.category] || 0) + assessment.currentCapability
            return acc
          },
          {} as Record<string, number>,
        )

        // Normalize breakdown
        Object.keys(capabilityBreakdown).forEach((key) => {
          const count = detailedAssessments.filter((a) => a.requirement.category === key).length
          capabilityBreakdown[key] = capabilityBreakdown[key] / count
        })

        const criticalGaps = detailedAssessments
          .filter((a) => a.gapAnalysis.severity === "critical" || a.gapAnalysis.severity === "high")
          .map((a) => a.requirement.name)

        const assessment: ProjectAssessment = {
          overallScore,
          capabilityBreakdown,
          criticalGaps,
          recommendedRoadmap: {
            immediate: detailedAssessments
              .filter((a) => a.requirement.priority === "critical")
              .flatMap((a) => a.recommendations)
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
              .slice(0, 5),
            shortTerm: detailedAssessments
              .filter((a) => a.requirement.priority === "high")
              .flatMap((a) => a.recommendations)
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
              .slice(0, 5),
            longTerm: detailedAssessments
              .filter((a) => ["medium", "low"].includes(a.requirement.priority))
              .flatMap((a) => a.recommendations)
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
              .slice(0, 5),
          },
          estimatedTimeline: detailedAssessments.some((a) => a.requirement.complexity === "expert")
            ? "3-6 months"
            : "1-3 months",
          totalCost: detailedAssessments.some((a) => a.recommendations.some((r) => r.tool.cost.type === "enterprise"))
            ? "$50K-$200K"
            : "$10K-$50K",
          riskAssessment: {
            technical: ["Technology adoption challenges", "Integration complexity", "Performance bottlenecks"],
            business: ["Budget constraints", "Timeline delays", "Resource availability"],
            operational: ["Deployment challenges", "Monitoring setup", "Maintenance overhead"],
          },
        }

        setCurrentAssessment(assessment)
        return assessment
      } finally {
        setIsEvaluating(false)
      }
    },
    [initializeClient, getToolCapabilities],
  )

  // Get recommendations for specific use case
  const getRecommendations = useCallback(
    async (
      useCase: string,
      constraints: string[] = [],
      budget: "low" | "medium" | "high" | "enterprise" = "medium",
    ): Promise<ToolRecommendation[]> => {
      await initializeClient()
      setIsEvaluating(true)

      try {
        const tools = getToolCapabilities()
        const prompt = `Recommend tools for this use case:

Use Case: ${useCase}
Constraints: ${constraints.join(", ")}
Budget Level: ${budget}

Available Tools:
${tools.map((t) => `${t.id}: ${t.name} (${t.type}) - ${t.description}`).join("\n")}

Consider:
- Technical fit for the use case
- Budget constraints
- Implementation complexity
- Long-term maintainability
- Community and ecosystem support

Return top 5 recommendations with detailed reasoning.`

        const messages: AIMessage[] = [
          {
            role: "system",
            content:
              "You are a technical consultant. Recommend the most appropriate tools and technologies based on specific use cases and constraints.",
          },
          { role: "user", content: prompt },
        ]

        const response = await clientRef.current!.generate(messages, {
          model: "openai/gpt-4o",
          temperature: 0.3,
          max_tokens: 1500,
        })

        // Generate recommendations based on use case
        const relevantTools = tools
          .filter((tool) => {
            const useCaseLower = useCase.toLowerCase()
            return (
              tool.useCases.some(
                (uc) => useCaseLower.includes(uc.toLowerCase()) || uc.toLowerCase().includes(useCaseLower),
              ) ||
              tool.description.toLowerCase().includes(useCaseLower) ||
              tool.name.toLowerCase().includes(useCaseLower)
            )
          })
          .slice(0, 5)

        const recommendations: ToolRecommendation[] = relevantTools.map((tool) => ({
          tool,
          relevanceScore: Math.random() * 0.3 + 0.7, // Mock high relevance
          reasoning: `${tool.name} is highly suitable for ${useCase} due to its ${tool.strengths.slice(0, 2).join(" and ")}`,
          implementationEffort:
            tool.learningCurve === "beginner" ? "low" : tool.learningCurve === "intermediate" ? "medium" : "high",
          businessValue: {
            timeSavings: "25-50%",
            costImpact: tool.cost.type === "free" ? "Significant savings" : "Premium value",
            qualityImprovement: "Industry standards",
            scalability: "Enterprise-ready",
          },
          prerequisites: tool.compatibility.slice(0, 3),
          alternatives: tools
            .filter((t) => t.type === tool.type && t.id !== tool.id)
            .slice(0, 2)
            .map((t) => t.name),
        }))

        return recommendations
      } finally {
        setIsEvaluating(false)
      }
    },
    [initializeClient, getToolCapabilities],
  )

  // Generate implementation roadmap
  const generateRoadmap = useCallback(
    async (
      assessment: ProjectAssessment,
      timeline: "aggressive" | "standard" | "conservative" = "standard",
    ): Promise<{
      phases: Array<{
        name: string
        duration: string
        deliverables: string[]
        dependencies: string[]
        risks: string[]
      }>
      milestones: string[]
      successMetrics: string[]
    }> => {
      await initializeClient()
      setIsEvaluating(true)

      try {
        const prompt = `Create a detailed implementation roadmap:

Project Assessment:
- Overall Score: ${assessment.overallScore}/10
- Critical Gaps: ${assessment.criticalGaps.join(", ")}
- Timeline Preference: ${timeline}
- Budget: ${assessment.totalCost}

Recommended Tools: ${assessment.recommendedRoadmap.immediate.map((r) => r.tool.name).join(", ")}

Create a phased implementation plan with:
1. Detailed phases with timelines
2. Key milestones and deliverables
3. Dependencies and risk mitigation
4. Success metrics and KPIs`

        const messages: AIMessage[] = [
          {
            role: "system",
            content:
              "You are a project manager. Create detailed, actionable roadmaps with realistic timelines and clear success criteria.",
          },
          { role: "user", content: prompt },
        ]

        const response = await clientRef.current!.generate(messages, {
          model: "openai/gpt-4o",
          temperature: 0.2,
          max_tokens: 2000,
        })

        // Generate structured roadmap
        const phases = [
          {
            name: "Foundation & Planning",
            duration: timeline === "aggressive" ? "1 week" : timeline === "standard" ? "2 weeks" : "3 weeks",
            deliverables: ["Technical architecture", "Team setup", "Development environment", "Initial documentation"],
            dependencies: [],
            risks: ["Resource availability", "Technology selection delays"],
          },
          {
            name: "Core Implementation",
            duration: timeline === "aggressive" ? "3 weeks" : timeline === "standard" ? "6 weeks" : "8 weeks",
            deliverables: ["MVP functionality", "Basic integrations", "Initial testing", "User feedback"],
            dependencies: ["Foundation & Planning"],
            risks: ["Technical challenges", "Scope creep", "Integration issues"],
          },
          {
            name: "Enhancement & Optimization",
            duration: timeline === "aggressive" ? "2 weeks" : timeline === "standard" ? "4 weeks" : "6 weeks",
            deliverables: [
              "Advanced features",
              "Performance optimization",
              "Security hardening",
              "Comprehensive testing",
            ],
            dependencies: ["Core Implementation"],
            risks: ["Performance bottlenecks", "Security vulnerabilities", "Testing delays"],
          },
          {
            name: "Deployment & Launch",
            duration: timeline === "aggressive" ? "1 week" : timeline === "standard" ? "2 weeks" : "3 weeks",
            deliverables: ["Production deployment", "Monitoring setup", "Documentation", "Training materials"],
            dependencies: ["Enhancement & Optimization"],
            risks: ["Deployment failures", "Downtime", "User adoption issues"],
          },
        ]

        return {
          phases,
          milestones: [
            "Project kickoff and planning complete",
            "MVP delivered and tested",
            "All features implemented and optimized",
            "Successful production launch",
            "Post-launch monitoring and support established",
          ],
          successMetrics: [
            "All critical requirements met",
            "Performance benchmarks achieved",
            "User acceptance testing passed",
            "Zero critical security issues",
            "System uptime > 99.5%",
            "User satisfaction score > 4.5/5",
          ],
        }
      } finally {
        setIsEvaluating(false)
      }
    },
    [initializeClient],
  )

  return {
    assessments,
    currentAssessment,
    isEvaluating,
    assessProject,
    getRecommendations,
    generateRoadmap,
    getToolCapabilities,
    clearAssessments: useCallback(() => {
      setAssessments([])
      setCurrentAssessment(null)
    }, []),
  }
}
