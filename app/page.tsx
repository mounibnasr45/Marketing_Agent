"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, AlertCircle, Globe, BarChart3, Code, RefreshCw, TrendingUp, Users, Eye, History } from "lucide-react"
import SimilarWebResults from "./components/similarweb-results"
import BuiltWithResults from "./components/builtwith-results"
import ChatSystem from "./components/chat-system"
import { SessionHistory } from "./components/session-history"
import { useAppState } from "@/lib/state-context"

// API Response types
interface ApiResponse {
  success: boolean
  data: any[]
  count: number
  note?: string
}

export default function AnalysisPlatform() {
  const { state, dispatch } = useAppState()
  const [showHistory, setShowHistory] = useState(false)
  
  // Use state management for all state
  const domain = state.currentSession.domain
  const analysisState = state.currentSession.analysisState
  const analysisType = state.currentSession.analysisType
  const progress = state.currentSession.progress
  const competitorProgress = state.currentSession.competitorProgress
  const currentCompetitor = state.currentSession.currentCompetitor
  const error = state.currentSession.error
  const competitors = state.currentSession.competitors
  const analysisData = state.currentSession.analysisData
  const apiResponse = state.currentSession.apiResponse

  // Backend API URL
  const API_BASE_URL = "http://localhost:8000"

  // Generate a consistent user ID based on session or browser
  const getUserId = () => {
    return state.settings.userId
  }

  const handleAnalyze = async () => {
    if (!domain.trim()) return

    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'loading' })
    dispatch({ type: 'SET_PROGRESS', payload: 0 })
    dispatch({ type: 'SET_ERROR', payload: '' })

    // Simulate progress for UI
    const progressSteps = [
      { step: 20, message: "Connecting to domain..." },
      { step: 40, message: "Gathering traffic data..." },
      { step: 60, message: "Analyzing competitor landscape..." },
      { step: 80, message: "Processing market data..." },
      { step: 100, message: "Finalizing traffic analysis..." },
    ]

    try {
      // Start progress animation
      for (const { step } of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        dispatch({ type: 'SET_PROGRESS', payload: step })
      }

      // Call backend API for SimilarWeb analysis
      const requestData = {
        websites: [domain],
        userId: getUserId() // Use consistent user ID
      }

      console.log("🚀 Frontend: Sending SimilarWeb analysis request")
      console.log("   📤 Request URL:", `${API_BASE_URL}/api/analyze`)
      console.log("   📦 Request Data:", requestData)
      console.log("   ⏰ Request Time:", new Date().toISOString())

      const startTime = performance.now()
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const endTime = performance.now()
      const requestDuration = endTime - startTime

      console.log("📥 Frontend: Received SimilarWeb analysis response")
      console.log("   ✅ Response Status:", response.status)
      console.log("   ⏱️ Response Time:", `${requestDuration.toFixed(2)}ms`)
      console.log("   📊 Response Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error("❌ Frontend: API request failed")
        console.error("   Status:", response.status)
        console.error("   Status Text:", response.statusText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      
      console.log("📊 Frontend: Parsed response data")
      console.log("   ✅ Success:", data.success)
      console.log("   📈 Data Count:", data.count)
      console.log("   📝 Note:", data.note)
      
      if (!data.success) {
        console.error("❌ Frontend: Analysis failed according to response")
        throw new Error('Analysis failed')
      }

      // Store the API response
      dispatch({ type: 'SET_API_RESPONSE', payload: data })
      
      // Extract competitors from the response
      const competitorDomains = data.data[0]?.topSimilarityCompetitors?.map((comp: any) => comp.domain) || 
        ["indeed.com", "glassdoor.com", "monster.com", "ziprecruiter.com"]
      
      dispatch({ type: 'SET_COMPETITORS', payload: competitorDomains })

      // Store analysis data
      const newAnalysisData = {
        domain,
        competitors: competitorDomains,
        similarWebData: data.data[0] || {},
        builtWithData: {},
        apiResponse: data, // Include full API response
      }
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: newAnalysisData })

      console.log("✅ Frontend: SimilarWeb analysis completed successfully")
      console.log("   🏆 Competitors found:", competitorDomains.length)
      console.log("   📊 Analysis data stored")

      // Start with SimilarWeb results
      dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'similarweb' })
    } catch (err) {
      console.error('❌ Frontend: Analysis error:', err)
      console.error('   🔍 Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      })
      dispatch({ type: 'SET_ERROR', payload: "Failed to analyze the website. Please make sure the backend is running and try again." })
      dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'error' })
    }
  }

  const handleCompetitorAnalysis = async () => {
    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'analyzing-competitors' })
    dispatch({ type: 'SET_COMPETITOR_PROGRESS', payload: 0 })

    try {
      // Get the consistent user ID
      const userId = getUserId()

      // Simulate analyzing each competitor's technology stack
      const allDomains = [domain, ...competitors]

      console.log("🔧 Frontend: Starting tech stack analysis")
      console.log("   🌐 Domains to analyze:", allDomains)
      console.log("   👤 User ID:", userId)

      for (let i = 0; i < allDomains.length; i++) {
        dispatch({ type: 'SET_CURRENT_COMPETITOR', payload: allDomains[i] })
        dispatch({ type: 'SET_COMPETITOR_PROGRESS', payload: ((i + 1) / allDomains.length) * 100 })
        console.log(`   📊 Analyzing ${i + 1}/${allDomains.length}: ${allDomains[i]}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Call backend API for BuiltWith analysis
      const requestData = {
        websites: [domain, ...competitors],
        userId: userId
      }

      console.log("🚀 Frontend: Sending BuiltWith analysis request")
      console.log("   📤 Request URL:", `${API_BASE_URL}/api/analyze-tech-stack`)
      console.log("   📦 Request Data:", requestData)
      console.log("   ⏰ Request Time:", new Date().toISOString())

      const startTime = performance.now()
      const response = await fetch(`${API_BASE_URL}/api/analyze-tech-stack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const endTime = performance.now()
      const requestDuration = endTime - startTime

      console.log("📥 Frontend: Received BuiltWith analysis response")
      console.log("   ✅ Response Status:", response.status)
      console.log("   ⏱️ Response Time:", `${requestDuration.toFixed(2)}ms`)
      console.log("   📊 Response Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error("❌ Frontend: BuiltWith API request failed")
        console.error("   Status:", response.status)
        console.error("   Status Text:", response.statusText)
        throw new Error(`BuiltWith API Error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      
      console.log("📊 Frontend: Parsed BuiltWith response data")
      console.log("   ✅ Success:", data.success)
      console.log("   📈 Data Count:", data.count)
      console.log("   📝 Note:", data.note)
      
      if (!data.success) {
        console.error("❌ Frontend: BuiltWith analysis failed according to response")
        throw new Error('BuiltWith analysis failed')
      }

      // Update the stored API response with BuiltWith data
      dispatch({ type: 'SET_API_RESPONSE', payload: data })
      
      // Update analysis data with BuiltWith results
      if (analysisData) {
        const updatedAnalysisData = {
          ...analysisData,
          builtWithData: data.data[0] || {},
          apiResponse: data, // Include updated API response
        }
        dispatch({ type: 'SET_ANALYSIS_DATA', payload: updatedAnalysisData })
      }

      console.log("✅ Frontend: Tech stack analysis completed successfully")
      console.log("   🔧 Technologies analyzed for", allDomains.length, "domains")

      dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'builtwith' })
    } catch (err) {
      console.error('❌ Frontend: BuiltWith analysis error:', err)
      console.error('   🔍 Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      })
      dispatch({ type: 'SET_ERROR', payload: "Failed to analyze technology stack. Using fallback data." })
      // Still proceed to BuiltWith view with existing data
      dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'builtwith' })
    }
  }

  const handleStartChat = () => {
    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'chat' })
  }

  const handleRetry = () => {
    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'idle' })
    dispatch({ type: 'SET_ERROR', payload: '' })
    dispatch({ type: 'SET_PROGRESS', payload: 0 })
    dispatch({ type: 'SET_COMPETITOR_PROGRESS', payload: 0 })
  }

  const switchToBuiltWith = () => {
    handleCompetitorAnalysis()
  }

  const switchToSimilarWeb = () => {
    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'similarweb' })
  }

  const switchToChat = () => {
    dispatch({ type: 'SET_ANALYSIS_STATE', payload: 'chat' })
  }

  const backToSearch = () => {
    dispatch({ type: 'RESET_SESSION' })
  }

  const handleHistoryRestore = (sessionId: string) => {
    setShowHistory(false)
    // Session is already loaded by the dispatch action
  }

  // Show session history
  if (showHistory) {
    return (
      <SessionHistory
        onRestoreSession={handleHistoryRestore}
        onClose={() => setShowHistory(false)}
      />
    )
  }

  if (analysisState === "chat" && analysisData) {
    return <ChatSystem analysisData={analysisData} onBackToSearch={backToSearch} />
  }

  if (analysisState === "similarweb") {
    return (
      <SimilarWebResults
        domain={domain}
        onSwitchToBuiltWith={switchToBuiltWith}
        onSwitchToChat={switchToChat}
        onBackToSearch={backToSearch}
        competitors={competitors}
        apiData={apiResponse}
      />
    )
  }

  if (analysisState === "builtwith") {
    return (
      <BuiltWithResults
        domain={domain}
        competitors={competitors}
        onSwitchToSimilarWeb={switchToSimilarWeb}
        onSwitchToChat={switchToChat}
        onBackToSearch={backToSearch}
        apiData={apiResponse}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Website Intelligence Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get comprehensive insights into any website's traffic, technology stack, and competitive landscape with
            AI-powered analysis
          </p>
        </div>

        {/* Main Search Form */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-800">Analyze Any Website</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Enter a domain to discover traffic insights, competitor technology stacks, and get AI-powered
              recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Input */}
            <div className="space-y-4">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Enter domain name (e.g., linkedin.com)"
                    value={domain}
                    onChange={(e) => dispatch({ type: 'SET_DOMAIN', payload: e.target.value })}
                    className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analysisState === "loading" || !domain.trim()}
                  className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {analysisState === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Search className="h-5 w-5 mr-2" />
                  )}
                  Analyze
                </Button>
                
                {/* History Button */}
                {state.sessionHistory.length > 0 && (
                  <Button
                    onClick={() => setShowHistory(true)}
                    variant="outline"
                    className="h-14 px-6 text-lg rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <History className="h-5 w-5 mr-2" />
                    Session History ({state.sessionHistory.length})
                  </Button>
                )}
              </div>

              {/* Analysis Type Selection */}
              <div className="flex justify-center gap-2">
                <Button
                  variant={analysisType === "similarweb" ? "default" : "outline"}
                  onClick={() => dispatch({ type: 'SET_ANALYSIS_TYPE', payload: 'similarweb' })}
                  className="rounded-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Traffic Analysis
                </Button>
                <Button
                  variant={analysisType === "builtwith" ? "default" : "outline"}
                  onClick={() => dispatch({ type: 'SET_ANALYSIS_TYPE', payload: 'builtwith' })}
                  className="rounded-full"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Technology Stack
                </Button>
                <Button
                  variant={analysisType === "both" ? "default" : "outline"}
                  onClick={() => dispatch({ type: 'SET_ANALYSIS_TYPE', payload: 'both' })}
                  className="rounded-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Complete Analysis + AI Chat
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {analysisState === "loading" && (
              <div className="text-center space-y-6 py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Analyzing {domain}</h3>
                  <p className="text-gray-600">Gathering comprehensive website intelligence...</p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <Progress value={progress} className="h-3 rounded-full" />
                  <p className="text-sm text-gray-500">{progress}% Complete</p>
                </div>
              </div>
            )}

            {/* Competitor Analysis Loading State */}
            {analysisState === "analyzing-competitors" && (
              <div className="text-center space-y-6 py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Analyzing Competitor Technology Stacks</h3>
                  <p className="text-gray-600">
                    Currently analyzing: <span className="font-semibold text-purple-600">{currentCompetitor}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Scanning {competitors.length + 1} websites for technology insights...
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <Progress value={competitorProgress} className="h-3 rounded-full" />
                  <p className="text-sm text-gray-500">{Math.round(competitorProgress)}% Complete</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                  {[domain, ...competitors].map((comp, index) => (
                    <Badge
                      key={comp}
                      variant={index < (competitorProgress / 100) * (competitors.length + 1) ? "default" : "outline"}
                      className="text-xs"
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {analysisState === "error" && (
              <Alert className="border-red-200 bg-red-50 max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                  <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4 bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Traffic Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Monthly visits & engagement metrics
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Geographic traffic distribution
                </li>
                <li className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Top keywords & search traffic
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Competitor identification
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Competitive Tech Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technology stack comparison
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Competitor infrastructure analysis
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Market technology trends
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Technology adoption insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Interactive data exploration
                </li>
                <li className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Smart recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Strategic competitive insights
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  AI-powered Q&A system
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sample Domains */}
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Try These Popular Domains</CardTitle>
            <CardDescription>
              Click any domain to see a comprehensive competitive analysis with AI insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              {["linkedin.com", "github.com", "stackoverflow.com", "medium.com", "netflix.com", "spotify.com"].map(
                (sampleDomain) => (
                  <Badge
                    key={sampleDomain}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 px-4 py-2 text-sm"
                    onClick={() => dispatch({ type: 'SET_DOMAIN', payload: sampleDomain })}
                  >
                    {sampleDomain}
                  </Badge>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
