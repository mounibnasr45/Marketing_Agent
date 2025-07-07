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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: `Hello! I'm your AI assistant and I've analyzed all the data for **${analysisData.domain}** and its ${analysisData.competitors.length} competitors. I have insights on:

- 📊 Traffic patterns and user behavior
- 🏆 Competitive landscape analysis  
- 🔧 Technology stack comparisons
- 💡 Growth opportunities and recommendations

What would you like to explore first? You can ask me anything about the analysis!`,
      timestamp: new Date(),
      suggestions: suggestedQuestions.slice(0, 4),
    },
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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
    
    const mockResponses: Record<string, string> = {
      "traffic sources": `Based on the analysis of ${analysisData.domain || "your domain"}, here are the main traffic sources:

🔵 **Direct Traffic (45%)** - This is excellent! It shows strong brand recognition and user loyalty. Users are typing your URL directly or using bookmarks.

🟢 **Organic Search (35%)** - Great SEO performance! This indicates your content is ranking well for relevant keywords.

🟣 **Referrals (10%)** - Decent referral traffic from other websites linking to you.

🔴 **Social Media (5%)** - There's room for improvement here. Consider investing more in social media marketing.

**Key Insights:**
- Your direct traffic percentage is above industry average (typically 20-30%)
- Strong organic presence suggests good SEO foundation
- Social media presents a growth opportunity

Would you like me to dive deeper into any specific traffic source or suggest strategies to improve them?`,

      competitors: `Here's how your domain stacks up against the competition:

🏆 **Your Position:** Strong market presence with solid fundamentals

**Competitor Analysis:**
1. **indeed.com** - Market leader with 1.8B monthly visits
   - Higher traffic volume but lower engagement
   - Opportunity: Better user experience

2. **glassdoor.com** - 500M visits, strong employer branding
   - Focus on company reviews and salary data
   - Opportunity: Expand beyond job listings

3. **monster.com** - 300M visits, traditional approach
   - Older platform with declining market share
   - Opportunity: Modern user experience

4. **ziprecruiter.com** - 250M visits, AI-focused
   - Strong technology integration
   - Opportunity: Compete on AI features

**Your Competitive Advantages:**
- Higher engagement rates (8:45 avg session vs industry 6:30)
- Lower bounce rate (35% vs industry 45%)
- Strong direct traffic indicating brand loyalty

**Recommendations:**
- Leverage your engagement advantage in marketing
- Focus on social media to match competitors
- Consider expanding into adjacent markets

What specific competitor would you like me to analyze further?`,

      technologies: `Here's the technology landscape across your competitive set:

**Most Popular Technologies:**
🔧 **Nginx (80% adoption)** - Industry standard web server
🔧 **Google Analytics (100% adoption)** - Universal analytics choice
🔧 **Cloudflare (60% adoption)** - Popular CDN and security solution

**Technology Differentiation by Competitor:**

**LinkedIn (Your Domain):**
- React + Node.js (Modern JavaScript stack)
- AWS hosting (Scalable cloud infrastructure)
- Strong performance optimization

**Indeed:**
- Java + Spring Framework (Enterprise-grade)
- Apache Tomcat (Traditional but reliable)
- Focus on stability over innovation

**Glassdoor:**
- Angular + TypeScript (Modern, type-safe)
- MongoDB (Flexible data storage)
- Good balance of modern and stable

**Monster:**
- Vue.js + PHP (Mixed modern/legacy)
- MySQL (Traditional database)
- Needs modernization

**ZipRecruiter:**
- Python + Django (AI/ML friendly)
- PostgreSQL (Advanced database features)
- Best positioned for AI integration

**Strategic Recommendations:**
1. **Maintain React advantage** - You're using modern, popular tech
2. **Consider AI integration** - Learn from ZipRecruiter's Python stack
3. **Strengthen security** - All competitors use Cloudflare
4. **Database optimization** - Consider PostgreSQL for advanced features

Which technology area interests you most?`,

      "growth opportunities": `Based on the comprehensive analysis, here are your key growth opportunities:

🚀 **Immediate Opportunities (0-3 months):**
1. **Social Media Expansion**
   - Current: 5% of traffic from social
   - Opportunity: Industry average is 15%
   - Potential: +200% traffic increase from social channels

2. **International Expansion**
   - Strong US presence (42% of traffic)
   - Growing Indian market (15% with +5% growth)
   - Opportunity: Target UK, Brazil, Canada more aggressively

3. **SEO Content Gap**
   - Competitors rank for keywords you're missing
   - Focus on long-tail job-related keywords
   - Potential: +30% organic traffic

🎯 **Medium-term Opportunities (3-12 months):**
1. **Technology Modernization**
   - Implement AI features like ZipRecruiter
   - Enhance mobile experience
   - Add progressive web app capabilities

2. **User Experience Optimization**
   - Your 8:45 session duration is excellent
   - Leverage this in marketing campaigns
   - Create case studies around user engagement

3. **Partnership Development**
   - Low referral traffic (10%) suggests partnership gaps
   - Target HR software integrations
   - University career center partnerships

📈 **Long-term Strategic Moves (12+ months):**
1. **Adjacent Market Expansion**
   - Professional development/training
   - Freelance marketplace
   - Company culture/employer branding

2. **Geographic Expansion**
   - European markets
   - Asia-Pacific opportunities
   - Localized content and features

**ROI Prioritization:**
1. Social media marketing (High ROI, Low effort)
2. International SEO (Medium ROI, Medium effort)
3. Technology upgrades (High ROI, High effort)

Which opportunity would you like to explore in detail?`,

      default: `I'm your AI assistant with deep knowledge of your website analysis! I can help you understand:

📊 **Traffic Analysis Insights**
- Visitor patterns and behavior
- Geographic distribution
- Traffic source optimization

🏆 **Competitive Intelligence**
- How you stack up against competitors
- Market positioning opportunities
- Competitive advantages to leverage

🔧 **Technology Recommendations**
- Tech stack comparisons
- Infrastructure improvements
- Security and performance optimization

💡 **Strategic Growth Opportunities**
- Market expansion possibilities
- User experience improvements
- Revenue optimization strategies

Just ask me anything about your analysis data! I can provide specific insights, comparisons, and actionable recommendations based on all the information we've gathered.

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
      return `Hello! I'm excited to help you understand the analysis of **${analysisData.domain}**. I have comprehensive data on traffic patterns, competitor analysis, and technology insights. What specific aspect would you like to explore?`
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
      // Ensure analysis_data is always a valid dictionary with serializable values, replacing undefined/null with empty objects and omitting unserializable values.
      const safeSimilarWebData = analysisData.similarWebData ?? {};
      const safeBuiltWithData = analysisData.builtWithData ?? {};
      const safeCompetitors = Array.isArray(analysisData.competitors) ? analysisData.competitors : [];
      const safeDomain = typeof analysisData.domain === "string" ? analysisData.domain : "";
      // Call backend chat API
      const response = await fetch("http://localhost:8000/api/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInputValue,
          analysis_data: {
            domain: safeDomain,
            competitors: safeCompetitors,
            similarWebData: safeSimilarWebData,
            builtWithData: safeBuiltWithData
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.response || generateResponse(currentInputValue),
          timestamp: new Date(),
          suggestions: data.suggestions || suggestedQuestions.slice(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4) + 4),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error('Chat API error:', error)
      
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