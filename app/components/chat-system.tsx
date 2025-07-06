"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  BarChart3,
  Code,
  Lightbulb,
  Target,
  Sparkles,
  MessageCircle,
  Brain,
} from "lucide-react"
import { useAppState } from "@/lib/state-context"

interface AnalysisData {
  domain: string
  competitors: string[]
  similarWebData: any
  builtWithData: any
}

interface ChatSystemProps {
  analysisData: AnalysisData
  onBackToSearch: () => void
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

const suggestedQuestions = [
  "What are the main traffic sources for this website?",
  "How does this domain compare to its competitors?",
  "What technologies do the top competitors use?",
  "What are the growth opportunities based on this analysis?",
  "Which competitor has the best technology stack?",
  "What marketing strategies should I focus on?",
  "How can I improve my website's performance?",
  "What are the key differentiators in this market?",
]

const ChatSystem = ({ analysisData, onBackToSearch }: ChatSystemProps) => {
  const { state, dispatch } = useAppState()
  
  // Use messages from state if available, otherwise initialize with welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    if (state.currentSession.messages.length > 0) {
      return state.currentSession.messages
    }
    return [
      {
        id: "1",
        type: "assistant",
        content: `Hello! I'm your AI assistant and I've analyzed all the data for **${analysisData.domain}** and its ${analysisData.competitors.length} competitors. 

I have insights on:
- Traffic patterns and user behavior
- Competitive landscape analysis  
- Technology stack comparisons
- Growth opportunities and recommendations

What would you like to explore first? You can ask me anything about the analysis!`,
        timestamp: new Date(),
        suggestions: suggestedQuestions.slice(0, 4),
      },
    ]
  })
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Sync messages with state
  useEffect(() => {
    dispatch({ type: 'SET_MESSAGES', payload: messages })
  }, [messages, dispatch])

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length > 1) { // Only save if there are actual conversations
      dispatch({ type: 'SAVE_SESSION' })
    }
  }, [messages, dispatch])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    const domain = analysisData.domain || "your domain"
    
    // Get actual data from analysis
    const similarWebData = analysisData.similarWebData || {}
    const competitors = analysisData.competitors || []
    const builtWithData = analysisData.builtWithData || {}
    
    // Extract real metrics
    const visits = similarWebData.totalVisits || 0
    const visitsFormatted = visits > 1000000 ? `${(visits/1000000).toFixed(1)}M` : 
                           visits > 1000 ? `${(visits/1000).toFixed(1)}K` : 
                           visits.toString()
    
    const bounceRate = similarWebData.bounceRate ? `${(similarWebData.bounceRate * 100).toFixed(1)}%` : 'N/A'
    const avgDuration = similarWebData.avgVisitDuration || 'N/A'
    const globalRank = similarWebData.globalRank || 'N/A'
    
    // Extract traffic sources
    const trafficSources = similarWebData.trafficSources || {}
    const directTraffic = trafficSources.directVisitsShare ? `${(trafficSources.directVisitsShare * 100).toFixed(1)}%` : 'N/A'
    const organicTraffic = trafficSources.organicSearchVisitsShare ? `${(trafficSources.organicSearchVisitsShare * 100).toFixed(1)}%` : 'N/A'
    const socialTraffic = trafficSources.socialNetworksVisitsShare ? `${(trafficSources.socialNetworksVisitsShare * 100).toFixed(1)}%` : 'N/A'
    const referralTraffic = trafficSources.referralVisitsShare ? `${(trafficSources.referralVisitsShare * 100).toFixed(1)}%` : 'N/A'

    const mockResponses: Record<string, string> = {
      "traffic sources": `Based on the analysis of **${domain}**, here are the main traffic sources:

� **Traffic Overview:**
- **Global Rank:** #${globalRank}
- **Monthly Visits:** ${visitsFormatted}
- **Bounce Rate:** ${bounceRate}
- **Average Visit Duration:** ${avgDuration}

🔵 **Direct Traffic (${directTraffic})** - ${parseFloat(directTraffic) > 30 ? 'Excellent brand recognition!' : 'Good direct traffic, room for brand building'}

🟢 **Organic Search (${organicTraffic})** - ${parseFloat(organicTraffic) > 40 ? 'Strong SEO performance!' : 'Decent organic presence, SEO optimization opportunities exist'}

🟣 **Referrals (${referralTraffic})** - ${parseFloat(referralTraffic) > 10 ? 'Good referral traffic' : 'Opportunity to build more partnerships'}

🔴 **Social Media (${socialTraffic})** - ${parseFloat(socialTraffic) > 10 ? 'Great social presence!' : 'Significant growth opportunity in social media marketing'}

**Key Insights:**
- Your traffic pattern shows ${parseFloat(directTraffic) > 30 ? 'strong brand loyalty' : 'opportunity for brand building'}
- ${parseFloat(organicTraffic) > 40 ? 'SEO is a key strength' : 'SEO optimization could drive more growth'}
- ${parseFloat(socialTraffic) < 10 ? 'Social media presents untapped potential' : 'Social strategy is working well'}

Would you like me to dive deeper into any specific traffic source or suggest strategies to improve them?`,

      competitors: `Here's how **${domain}** stacks up against the competition:

🏆 **Your Position:** ${globalRank !== 'N/A' ? `Ranked #${globalRank} globally` : 'Strong market presence'} with ${visitsFormatted} monthly visits

**Competitive Landscape:**
${competitors.slice(0, 3).map((comp, i) => `${i + 1}. **${comp}** - Key competitor in your space`).join('\n')}

**Your Competitive Advantages:**
- ${bounceRate !== 'N/A' && parseFloat(bounceRate) < 50 ? `Low bounce rate (${bounceRate}) shows strong user engagement` : 'User engagement metrics available'}
- ${avgDuration !== 'N/A' ? `Average visit duration of ${avgDuration} indicates content quality` : 'Content engagement data available'}
- ${parseFloat(directTraffic) > 25 ? 'Strong direct traffic indicates brand recognition' : 'Building brand recognition opportunity'}

**Growth Opportunities:**
- ${parseFloat(organicTraffic) < 40 ? 'SEO optimization could capture more organic traffic' : 'Maintain strong SEO performance'}
- ${parseFloat(socialTraffic) < 10 ? 'Social media expansion could drive significant growth' : 'Continue social media success'}
- ${competitors.length > 0 ? `Analyze competitor strategies in ${competitors.slice(0, 2).join(' and ')}` : 'Competitive analysis opportunities'}

What specific competitive aspect would you like me to analyze further?`,

      technologies: `Here's the technology landscape for **${domain}**:

**Current Tech Stack Analysis:**
${builtWithData.technologies ? `
🔧 **Detected Technologies:**
${builtWithData.technologies.slice(0, 6).map((tech: any) => `- ${tech.name} (${tech.tag})`).join('\n')}

**Technology Recommendations:**
- Your current stack shows ${builtWithData.technologies.length > 10 ? 'comprehensive technology adoption' : 'focused technology choices'}
- ${builtWithData.technologies.some((t: any) => t.tag?.includes('Analytics')) ? 'Analytics tracking is in place' : 'Consider adding analytics tools'}
- ${builtWithData.technologies.some((t: any) => t.tag?.includes('JavaScript')) ? 'Modern JavaScript frameworks detected' : 'Consider modern JavaScript frameworks'}
` : 'Technology analysis data is being processed...'}

**Strategic Tech Insights:**
- Focus on technologies that improve user experience
- Consider performance optimization tools
- Ensure mobile-first approach
- Implement proper analytics and tracking

**Competitive Tech Advantage:**
- ${builtWithData.technologies?.length > 15 ? 'Extensive technology stack' : 'Streamlined technology approach'}
- Opportunities for ${builtWithData.technologies?.some((t: any) => t.tag?.includes('CDN')) ? 'CDN optimization' : 'CDN implementation'}

Which technology area interests you most?`,

      "growth opportunities": `Based on the comprehensive analysis of **${domain}**, here are your key growth opportunities:

🚀 **Immediate Opportunities (0-3 months):**

1. **Traffic Source Optimization**
   - Current traffic: ${visitsFormatted} monthly visits
   - ${parseFloat(socialTraffic) < 10 ? `Social media expansion potential: Current ${socialTraffic} could grow to 15-20%` : 'Maintain social media momentum'}
   - ${parseFloat(organicTraffic) < 50 ? `SEO optimization: Current ${organicTraffic} organic traffic has growth potential` : 'Maintain strong SEO performance'}

2. **User Experience Enhancement**
   - Bounce rate: ${bounceRate} ${parseFloat(bounceRate) > 50 ? '(room for improvement)' : '(performing well)'}
   - Average session: ${avgDuration} ${avgDuration.includes(':') && parseInt(avgDuration.split(':')[0]) > 3 ? '(strong engagement)' : '(engagement opportunity)'}

3. **Competitive Positioning**
   - Global rank: #${globalRank} ${globalRank !== 'N/A' && parseInt(globalRank) > 50000 ? '(growth potential)' : '(strong position)'}
   - Key competitors: ${competitors.slice(0, 2).join(', ')}

🎯 **Medium-term Opportunities (3-12 months):**

1. **Technology Stack Modernization**
   - ${builtWithData.technologies ? `Current stack: ${builtWithData.technologies.length} technologies` : 'Technology audit needed'}
   - Focus on performance and user experience improvements

2. **Content Strategy Enhancement**
   - ${parseFloat(organicTraffic) < 40 ? 'SEO content opportunities' : 'Content optimization for better engagement'}
   - ${avgDuration !== 'N/A' ? `Leverage ${avgDuration} session duration` : 'Improve content engagement'}

3. **Market Expansion**
   - ${parseFloat(directTraffic) > 25 ? 'Strong brand foundation for expansion' : 'Brand building for expansion'}
   - Geographic and demographic opportunities

**ROI Prioritization:**
1. ${parseFloat(socialTraffic) < 10 ? 'Social media marketing (High ROI, Low effort)' : 'Social media optimization'}
2. ${parseFloat(organicTraffic) < 40 ? 'SEO optimization (Medium ROI, Medium effort)' : 'SEO maintenance'}
3. Technology upgrades (High ROI, High effort)

Which opportunity would you like to explore in detail?`,

      default: `I'm your AI assistant with deep knowledge of **${domain}** analysis! Here's what I can help you understand:

📊 **Your Website Overview:**
- **Domain:** ${domain}
- **Global Rank:** #${globalRank}
- **Monthly Visits:** ${visitsFormatted}
- **Bounce Rate:** ${bounceRate}
- **Avg Session:** ${avgDuration}

🔍 **Available Analysis:**
- **Traffic Sources:** ${directTraffic} direct, ${organicTraffic} organic, ${socialTraffic} social
- **Competitors:** ${competitors.length} identified competitors
- **Technologies:** ${builtWithData.technologies ? `${builtWithData.technologies.length} detected` : 'Analysis in progress'}

💡 **What I Can Help With:**
- Traffic source optimization strategies
- Competitive positioning analysis
- Technology stack recommendations
- Growth opportunity identification
- Performance benchmarking

Just ask me anything about your analysis data! I can provide specific insights, comparisons, and actionable recommendations.

What would you like to explore first?`,
    }

    if (lowerMessage.includes("traffic") || lowerMessage.includes("source")) {
      return mockResponses["traffic sources"]
    } else if (lowerMessage.includes("competitor") || lowerMessage.includes("compare")) {
      return mockResponses["competitors"]
    } else if (lowerMessage.includes("technology") || lowerMessage.includes("tech") || lowerMessage.includes("stack")) {
      return mockResponses["technologies"]
    } else if (
      lowerMessage.includes("growth") ||
      lowerMessage.includes("opportunity") ||
      lowerMessage.includes("improve")
    ) {
      return mockResponses["growth opportunities"]
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello! I'm excited to help you understand the analysis of **${domain}**. I have comprehensive data on traffic patterns, competitor analysis, and technology insights. What specific aspect would you like to explore?`
    } else {
      return mockResponses["default"]
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInputValue = inputValue // Store the current input value
    setInputValue("")
    setIsTyping(true)

    try {
      // Call backend chat API
      const requestData = {
        message: currentInputValue,
        analysis_data: {
          domain: analysisData.domain,
          competitors: analysisData.competitors,
          data: [analysisData.similarWebData, analysisData.builtWithData].filter(Boolean)
        }
      }

      console.log("[CHAT] Frontend: Sending chat request")
      console.log("   [REQUEST] Request URL:", "http://localhost:8000/api/chat")
      console.log("   [DATA] Request Data:", {
        message: currentInputValue,
        analysis_data_size: JSON.stringify(requestData.analysis_data).length + " characters"
      })
      console.log("   [TIME] Request Time:", new Date().toISOString())

      const startTime = performance.now()
      const response = await fetch("http://localhost:8000/api/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const endTime = performance.now()
      const requestDuration = endTime - startTime

      console.log("[RESPONSE] Frontend: Received chat response")
      console.log("   [STATUS] Response Status:", response.status)
      console.log("   [TIME] Response Time:", `${requestDuration.toFixed(2)}ms`)
      console.log("   [HEADERS] Response Headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        
        console.log("[DATA] Frontend: Parsed chat response data")
        console.log("   [LENGTH] Response length:", data.response?.length || 0, "characters")
        console.log("   [SUGGESTIONS] Suggestions count:", data.suggestions?.length || 0)
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.response || generateResponse(currentInputValue),
          timestamp: new Date(),
          suggestions: data.suggestions || suggestedQuestions.slice(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4) + 4),
        }

        setMessages((prev) => [...prev, assistantMessage])
        console.log("[SUCCESS] Frontend: Chat response processed successfully")
      } else {
        console.error("[ERROR] Frontend: Chat API request failed")
        console.error("   Status:", response.status)
        console.error("   Status Text:", response.statusText)
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error('[ERROR] Frontend: Chat API error:', error)
      console.error('   [DETAILS] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
      
      console.log("[FALLBACK] Frontend: Falling back to mock response")
      
      // Fallback to mock response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: generateResponse(currentInputValue),
          timestamp: new Date(),
          suggestions: suggestedQuestions.slice(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4) + 4),
        }

        setMessages((prev) => [...prev, assistantMessage])
        console.log("[SUCCESS] Frontend: Mock response processed successfully")
      }, 1000)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              onClick={onBackToSearch}
              className="flex items-center gap-2 bg-white/50 hover:bg-white/80 border-white/30 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                  <Brain className="h-3 w-3 mr-1" />
                  Powered by Analysis Data
                </Badge>
              </div>
              <p className="text-xl text-gray-600 font-medium">Ask anything about {analysisData.domain} analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Analysis Complete</p>
              <p className="font-semibold text-green-600">{analysisData.competitors.length + 1} websites analyzed</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Analysis Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto w-fit">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-bold text-blue-900">Traffic Data</div>
                <div className="text-xs text-blue-600">Complete analysis available</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mx-auto w-fit">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-bold text-purple-900">Tech Stacks</div>
                <div className="text-xs text-purple-600">{analysisData.competitors.length + 1} sites analyzed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mx-auto w-fit">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-bold text-green-900">Competitors</div>
                <div className="text-xs text-green-600">{analysisData.competitors.length} identified</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mx-auto w-fit">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-bold text-orange-900">Insights</div>
                <div className="text-xs text-orange-600">AI-powered recommendations</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              AI Analysis Assistant
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <ScrollArea ref={scrollAreaRef} className="h-96 w-full rounded-xl border bg-gray-50/50 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}>
                    {message.type === "assistant" && (
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs h-7 bg-blue-50 hover:bg-blue-100 border-blue-200"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {message.type === "user" && (
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500">
                        <AvatarFallback className="bg-transparent">
                          <User className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the analysis data..."
                className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-12 px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(question)}
                  className="text-xs bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border-gray-200"
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChatSystem
