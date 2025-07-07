"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, CheckCircle, Circle, BarChart3, Code, TrendingUp, MessageCircle, Home } from "lucide-react"
import SimilarWebResults from "./similarweb-results"
import BuiltWithResults from "./builtwith-results"
import ChatSystem from "./chat-system"

interface AnalysisFlowProps {
  domain: string
  setDomain: (domain: string) => void
}

type Step = "domain" | "similarweb" | "builtwith" | "trends" | "chat"

interface StepData {
  id: Step
  title: string
  description: string
  icon: any
  color: string
  completed: boolean
  data?: any
}

interface AnalysisData {
  domain: string
  competitors: string[]
  similarWebData: any
  builtWithData: any
  trendsData: any
}

export default function AnalysisFlow({ domain, setDomain }: AnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("domain")
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    domain: domain,
    competitors: [],
    similarWebData: null,
    builtWithData: null,
    trendsData: null
  })

  const steps: StepData[] = [
    {
      id: "domain",
      title: "Domain Input",
      description: "Enter the website domain to analyze",
      icon: Circle,
      color: "bg-gray-500",
      completed: completedSteps.has("domain")
    },
    {
      id: "similarweb",
      title: "SimilarWeb Analysis",
      description: "Analyze website traffic and competitive intelligence",
      icon: BarChart3,
      color: "bg-blue-500",
      completed: completedSteps.has("similarweb")
    },
    {
      id: "builtwith",
      title: "BuiltWith Analysis",
      description: "Discover technologies and frameworks used",
      icon: Code,
      color: "bg-green-500",
      completed: completedSteps.has("builtwith")
    },
    {
      id: "trends",
      title: "Google Trends",
      description: "Analyze search trends and popularity",
      icon: TrendingUp,
      color: "bg-purple-500",
      completed: completedSteps.has("trends")
    },
    {
      id: "chat",
      title: "AI Chat Assistant",
      description: "Get insights and recommendations",
      icon: MessageCircle,
      color: "bg-orange-500",
      completed: completedSteps.has("chat")
    }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    if (domain) {
      setAnalysisData(prev => ({ ...prev, domain }))
    }
  }, [domain])

  const handleDomainSubmit = () => {
    if (domain.trim()) {
      setCompletedSteps(prev => new Set(prev).add("domain"))
      setCurrentStep("similarweb")
    }
  }

  const handleSimilarWebComplete = (data: any) => {
    const competitors = data?.competitors || []
    console.log("SimilarWeb completion data:", data)
    setAnalysisData(prev => ({
      ...prev,
      similarWebData: data,
      competitors: competitors
    }))
    setCompletedSteps(prev => new Set(prev).add("similarweb"))
    setCurrentStep("builtwith")
  }

  const handleBuiltWithComplete = (data: any) => {
    console.log("BuiltWith completion data:", data)
    setAnalysisData(prev => ({
      ...prev,
      builtWithData: data
    }))
    setCompletedSteps(prev => new Set(prev).add("builtwith"))
    setCurrentStep("trends")
  }

  const handleTrendsSubmit = async () => {
    // This function is no longer used as trends are handled in GoogleTrendsAnalysisStep
    setCompletedSteps(prev => new Set(prev).add("trends"))
    setCurrentStep("chat")
  }

  const handleBackToSearch = () => {
    setCurrentStep("domain")
    setCompletedSteps(new Set())
    setAnalysisData({
      domain: "",
      competitors: [],
      similarWebData: null,
      builtWithData: null,
      trendsData: null
    })
    setDomain("")
  }

  const handleBackToDashboard = () => {
    handleBackToSearch()
    // Navigate back to dashboard by reloading or using router
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "domain":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Enter Domain to Analyze
              </CardTitle>
              <CardDescription>
                Start your comprehensive website analysis by entering the domain you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium">
                  Website Domain
                </label>
                <Input
                  id="domain"
                  placeholder="Enter domain (e.g., example.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleDomainSubmit()}
                />
              </div>
              <Button 
                onClick={handleDomainSubmit}
                disabled={!domain.trim()}
                className="w-full"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )

      case "similarweb":
        return (
          <SimilarWebAnalysisStep
            domain={domain}
            onComplete={handleSimilarWebComplete}
            onBack={handleBackToSearch}
          />
        )

      case "builtwith":
        return (
          <BuiltWithAnalysisStep
            domain={domain}
            competitors={analysisData.competitors}
            onComplete={handleBuiltWithComplete}
            onBack={() => setCurrentStep("similarweb")}
          />
        )

      case "trends":
        return (
          <GoogleTrendsAnalysisStep
            domain={domain}
            onComplete={(data: any) => {
              setAnalysisData(prev => ({
                ...prev,
                trendsData: data
              }))
              setCompletedSteps(prev => new Set(prev).add("trends"))
              setCurrentStep("chat")
            }}
            onBack={() => setCurrentStep("builtwith")}
          />
        )

      case "chat":
        return (
          <ChatAnalysisStep
            domain={domain}
            analysisData={analysisData}
            onBack={() => setCurrentStep("trends")}
            onBackToDashboard={handleBackToDashboard}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Website Analysis Flow</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="grid grid-cols-5 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = completedSteps.has(step.id)
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : isCompleted
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isCompleted ? "bg-green-500" : step.color
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <Icon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center mt-1">
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}

// SimilarWeb Analysis Step Component
function SimilarWebAnalysisStep({ domain, onComplete, onBack }: { domain: string, onComplete: (data: any) => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const handleStartAnalysis = async () => {
    if (!domain.trim()) return

    setLoading(true)
    setError("")
    setHasStarted(true)
    
    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websites: [domain],
          userId: "user-123"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
        // Extract competitors for next step
        const competitors = data.data?.[0]?.competitors || []
        onComplete({
          domain,
          competitors,
          similarWebData: data,
          rawData: data
        })
      } else {
        setError(data.error || "Failed to analyze website")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setError("Failed to analyze website. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (results) {
      const competitors = results.data?.[0]?.competitors || []
      onComplete({
        domain,
        competitors,
        similarWebData: results,
        rawData: results
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>SimilarWeb Analysis</span>
          </CardTitle>
          <CardDescription>
            Analyze website traffic, engagement metrics, and competitive intelligence for {domain}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!hasStarted ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ready to analyze traffic and competitive data for <strong>{domain}</strong>
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStartAnalysis} disabled={loading}>
                    {loading ? "Analyzing..." : "Start SimilarWeb Analysis"}
                    <BarChart3 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">
                      Analyzing {domain}... This may take a few moments.
                    </p>
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {results && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ✅ SimilarWeb analysis completed successfully! 
                        Found data for {results.data?.length || 0} website(s).
                      </AlertDescription>
                    </Alert>
                    
                    {results.data?.[0] && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {results.data[0].globalRank || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Global Rank</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {results.data[0].monthlyVisits || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Monthly Visits</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {results.data[0].avgDuration || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Avg. Duration</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {results.data[0].competitors?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Competitors</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleContinue}>
                        Continue to Tech Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// BuiltWith Analysis Step Component
function BuiltWithAnalysisStep({ domain, competitors, onComplete, onBack }: { domain: string, competitors: string[], onComplete: (data: any) => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const handleStartAnalysis = async () => {
    if (!domain.trim()) return

    setLoading(true)
    setError("")
    setHasStarted(true)
    
    try {
      const websites = [domain, ...competitors].filter(Boolean)
      const response = await fetch("http://localhost:8000/api/analyze-tech-stack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websites: websites,
          userId: "user-123"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
        onComplete({
          domain,
          competitors,
          builtWithData: data,
          rawData: data
        })
      } else {
        setError(data.error || "Failed to analyze website technologies")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setError("Failed to analyze website. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (results) {
      onComplete({
        domain,
        competitors,
        builtWithData: results,
        rawData: results
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span>BuiltWith Analysis</span>
          </CardTitle>
          <CardDescription>
            Discover technologies, frameworks, and tools used by {domain}
            {competitors.length > 0 && ` and ${competitors.length} competitor(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!hasStarted ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ready to analyze technology stack for <strong>{domain}</strong>
                  {competitors.length > 0 && (
                    <span>
                      {' '}and <strong>{competitors.length}</strong> competitor(s): {competitors.slice(0, 3).join(', ')}
                      {competitors.length > 3 && '...'}
                    </span>
                  )}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStartAnalysis} disabled={loading}>
                    {loading ? "Analyzing..." : "Start BuiltWith Analysis"}
                    <Code className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">
                      Analyzing technology stack for {domain}... This may take a few moments.
                    </p>
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {results && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ✅ BuiltWith analysis completed successfully! 
                        Found {results.data?.length || 0} website(s) with technology data.
                      </AlertDescription>
                    </Alert>
                    
                    {results.data?.[0] && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Technology Stack Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {results.data[0].builtwith_result?.technologies?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Technologies</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {results.data[0].builtwith_result?.frameworks?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Frameworks</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {results.data[0].builtwith_result?.analytics?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Analytics</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {results.data.length}
                              </div>
                              <div className="text-sm text-gray-600">Websites</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleContinue}>
                        Continue to Trends Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Google Trends Analysis Step Component
function GoogleTrendsAnalysisStep({ domain, onComplete, onBack }: { domain: string, onComplete: (data: any) => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)
  const [keywords, setKeywords] = useState<string[]>([domain])
  const [newKeyword, setNewKeyword] = useState("")
  const [hasStarted, setHasStarted] = useState(false)

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setKeywords(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartAnalysis = async () => {
    if (keywords.length === 0) return

    setLoading(true)
    setError("")
    setHasStarted(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/google-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords,
          timeframe: '12m',
          geo: 'US'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
        onComplete({
          keywords,
          trendsData: data,
          rawData: data
        })
      } else {
        setError(data.error || "Failed to fetch Google Trends data")
      }
    } catch (error) {
      console.error("Trends API error:", error)
      setError("Failed to analyze trends. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (results) {
      onComplete({
        keywords,
        trendsData: results,
        rawData: results
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>Google Trends Analysis</span>
          </CardTitle>
          <CardDescription>
            Analyze search trends and popularity patterns for {domain} and related keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!hasStarted ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="keyword" className="text-sm font-medium">
                    Add Keywords (Domain is already included)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="keyword"
                      placeholder="Enter keyword (e.g., web development)"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                    />
                    <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
                      Add
                    </Button>
                  </div>
                </div>

                {keywords.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Keywords to analyze:</label>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={index === 0 ? "cursor-default" : "cursor-pointer"}
                          onClick={index === 0 ? undefined : () => removeKeyword(index)}
                        >
                          {keyword} {index === 0 ? "(domain)" : "×"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4 pt-4">
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStartAnalysis} disabled={loading || keywords.length === 0}>
                    {loading ? "Analyzing..." : "Start Trends Analysis"}
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">
                      Analyzing trends for {keywords.length} keyword(s)... This may take a few moments.
                    </p>
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {results && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ✅ Google Trends analysis completed successfully! 
                        Analyzed {keywords.length} keyword(s).
                      </AlertDescription>
                    </Alert>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Trends Analysis Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {keywords.length}
                            </div>
                            <div className="text-sm text-gray-600">Keywords</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {results.data?.timeframe || '12m'}
                            </div>
                            <div className="text-sm text-gray-600">Timeframe</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {results.data?.geo || 'US'}
                            </div>
                            <div className="text-sm text-gray-600">Region</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              ✓
                            </div>
                            <div className="text-sm text-gray-600">Complete</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleContinue}>
                        Continue to AI Chat
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Chat Analysis Step Component
function ChatAnalysisStep({ domain, analysisData, onBack, onBackToDashboard }: { domain: string, analysisData: any, onBack: () => void, onBackToDashboard: () => void }) {
  const [hasAnalysisComplete, setHasAnalysisComplete] = useState(false)

  useEffect(() => {
    // Check if we have analysis data to show completion
    if (analysisData.similarWebData || analysisData.builtWithData || analysisData.trendsData) {
      setHasAnalysisComplete(true)
    }
  }, [analysisData])

  // Prepare analysis data for ChatSystem
  const chatAnalysisData = {
    domain: domain,
    competitors: analysisData.competitors || [],
    similarWebData: analysisData.similarWebData?.rawData || analysisData.similarWebData || {},
    builtWithData: analysisData.builtWithData?.rawData || analysisData.builtWithData || {},
    // Include additional context for AI
    trendsData: analysisData.trendsData || {},
    // Provide a summary context for the AI
    summary: {
      domain: domain,
      hasTrafficData: !!(analysisData.similarWebData?.rawData || analysisData.similarWebData),
      hasTechData: !!(analysisData.builtWithData?.rawData || analysisData.builtWithData),
      hasTrendsData: !!analysisData.trendsData,
      competitorCount: (analysisData.competitors || []).length
    }
  }

  // Debug: Log the data being passed to ChatSystem
  console.log("ChatAnalysisStep - Analysis Data:", analysisData)
  console.log("ChatAnalysisStep - Chat Analysis Data:", chatAnalysisData)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6" />
            <span>AI Chat Assistant</span>
          </CardTitle>
          <CardDescription>
            Chat with AI to get insights and recommendations about {domain} based on your analysis data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hasAnalysisComplete && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Analysis complete! You can now ask questions about {domain} based on:
                  {analysisData.similarWebData && " SimilarWeb data,"}
                  {analysisData.builtWithData && " BuiltWith data,"}
                  {analysisData.trendsData && " Google Trends data"}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Use the working ChatSystem component */}
            <ChatSystem 
              analysisData={chatAnalysisData}
              onBackToSearch={() => {}} // Not used in flow
            />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Trends
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onBackToDashboard}>
                  <Home className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Analysis Complete</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
