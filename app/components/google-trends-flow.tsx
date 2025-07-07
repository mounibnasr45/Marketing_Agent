"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  TrendingUp,
  Globe,
  Calendar,
  BarChart3,
  MessageCircle,
  Plus,
  X,
  Search,
  Target,
  Award,
  Users,
  Eye,
} from "lucide-react"

interface GoogleTrendsFlowProps {
  domain: string
  competitors: string[]
  onBackToSearch: () => void
  onSwitchToChat: () => void
  onAnalysisComplete?: (data: any) => void
  showNextButton?: boolean
}

interface TrendData {
  keyword: string
  interest: number
  relatedQueries: string[]
  geography: string
  timeframe: string
}

// Mock trends data
const mockTrendsData: TrendData[] = [
  {
    keyword: "job search",
    interest: 85,
    relatedQueries: ["jobs near me", "remote jobs", "part time jobs"],
    geography: "Worldwide",
    timeframe: "Past 12 months"
  },
  {
    keyword: "career opportunities",
    interest: 72,
    relatedQueries: ["career change", "career development", "job opportunities"],
    geography: "United States",
    timeframe: "Past 12 months"
  },
  {
    keyword: "professional networking",
    interest: 68,
    relatedQueries: ["business networking", "linkedin", "professional connections"],
    geography: "Worldwide",
    timeframe: "Past 12 months"
  }
]

export default function GoogleTrendsFlow({
  domain,
  competitors,
  onBackToSearch,
  onSwitchToChat,
  onAnalysisComplete,
  showNextButton = false,
}: GoogleTrendsFlowProps) {
  const [keywords, setKeywords] = useState<string[]>(["job search", "career opportunities"])
  const [newKeyword, setNewKeyword] = useState("")
  const [timeframe, setTimeframe] = useState("12months")
  const [geography, setGeography] = useState("worldwide")
  const [isLoading, setIsLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [trendsData, setTrendsData] = useState<TrendData[]>([])

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleAnalyze = async () => {
    if (keywords.length === 0) return
    
    setIsLoading(true)
    
    try {
      // Try to call the real API
      const response = await fetch("http://localhost:8000/api/google-trends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          timeframe,
          geography,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTrendsData(data.trends || mockTrendsData)
      } else {
        throw new Error("API call failed")
      }
    } catch (error) {
      console.error("Trends API error:", error)
      // Fall back to mock data
      setTrendsData(mockTrendsData)
    } finally {
      setIsLoading(false)
      setHasAnalyzed(true)
    }
  }

  const handleContinueToChat = () => {
    if (onAnalysisComplete) {
      onAnalysisComplete({
        domain: domain,
        competitors: competitors,
        trendsData: {
          keywords,
          timeframe,
          geography,
          results: trendsData
        },
        rawData: trendsData
      })
    } else {
      onSwitchToChat()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToSearch} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Google Trends Analysis</h1>
              <p className="text-gray-600">Market trends and search patterns</p>
            </div>
          </div>
          <div className="flex gap-2">
            {showNextButton && hasAnalyzed ? (
              <Button onClick={handleContinueToChat} size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Continue to AI Chat
              </Button>
            ) : (
              <Button onClick={onSwitchToChat} variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            )}
          </div>
        </div>

        {/* Analysis Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Configure Trends Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Keywords Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Keywords to Analyze</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                  className="flex-1"
                />
                <Button onClick={handleAddKeyword} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Timeframe Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Past Month</SelectItem>
                  <SelectItem value="3months">Past 3 Months</SelectItem>
                  <SelectItem value="6months">Past 6 Months</SelectItem>
                  <SelectItem value="12months">Past 12 Months</SelectItem>
                  <SelectItem value="5years">Past 5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Geography Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Geography</label>
              <Select value={geography} onValueChange={setGeography}>
                <SelectTrigger>
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select geography" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="worldwide">Worldwide</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="gb">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="in">India</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={keywords.length === 0 || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Trends...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Market Trends
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {hasAnalyzed && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{keywords.length}</div>
                  <div className="text-sm text-gray-600">Keywords</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{trendsData.length}</div>
                  <div className="text-sm text-gray-600">Trends Found</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{geography === "worldwide" ? "Global" : "Regional"}</div>
                  <div className="text-sm text-gray-600">Scope</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{timeframe.replace("months", "M").replace("years", "Y")}</div>
                  <div className="text-sm text-gray-600">Timeframe</div>
                </CardContent>
              </Card>
            </div>

            {/* Trends Results */}
            <Card>
              <CardHeader>
                <CardTitle>Trends Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendsData.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold text-lg">{trend.keyword}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{trend.interest}</div>
                            <div className="text-xs text-gray-500">Interest Score</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Related Queries</h4>
                          <div className="flex flex-wrap gap-1">
                            {trend.relatedQueries.map((query, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {query}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Details</h4>
                          <div className="text-sm space-y-1">
                            <div>Geography: {trend.geography}</div>
                            <div>Timeframe: {trend.timeframe}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      {showNextButton ? "Analysis Complete - Get AI Insights" : "Get AI-Powered Analysis"}
                    </h3>
                    <p className="text-green-700">
                      {showNextButton 
                        ? "Your comprehensive analysis is complete. Chat with our AI to get insights and recommendations."
                        : "Let our AI assistant analyze these trends alongside your traffic and technology data."
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {showNextButton ? (
                      <Button onClick={handleContinueToChat} size="lg">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Continue to AI Chat
                      </Button>
                    ) : (
                      <Button onClick={onSwitchToChat}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask AI
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
