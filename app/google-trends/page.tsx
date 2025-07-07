"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, AlertCircle, TrendingUp, TrendingDown, BarChart3, Globe, Clock } from "lucide-react"

interface TrendsData {
  success: boolean
  keywords: string[]
  timeframe: string
  geo: string
  timestamp: string
  interest_over_time: any
  related_queries: any
  related_topics: any
  regional_interest: any
  summary: any
  comparison_insights?: any
}

export default function GoogleTrendsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [timeframe, setTimeframe] = useState("today 12-m")
  const [geo, setGeo] = useState("worldwide")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<TrendsData | null>(null)

  const API_BASE_URL = "http://localhost:8000"

  const timeframeOptions = [
    { value: "now 1-H", label: "Past hour" },
    { value: "now 4-H", label: "Past 4 hours" },
    { value: "now 1-d", label: "Past day" },
    { value: "now 7-d", label: "Past 7 days" },
    { value: "today 1-m", label: "Past month" },
    { value: "today 3-m", label: "Past 3 months" },
    { value: "today 12-m", label: "Past 12 months" },
    { value: "today 5-y", label: "Past 5 years" },
    { value: "all", label: "All time" }
  ]

  const geoOptions = [
    { value: "worldwide", label: "Worldwide" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "JP", label: "Japan" },
    { value: "IN", label: "India" },
    { value: "BR", label: "Brazil" }
  ]

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const params = new URLSearchParams({
        query: searchTerm,
        timeframe: timeframe,
        geo: geo === "worldwide" ? "" : geo
      })

      const response = await fetch(`${API_BASE_URL}/google-trends?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || "Failed to fetch Google Trends data")
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to fetch trends data. Please check if the backend is running and try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderSummaryCard = (keyword: string, summary: any) => (
    <Card key={keyword} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{keyword}</span>
          <Badge variant={summary.trend_direction === 'increasing' ? 'default' : 'secondary'}>
            {summary.trend_direction === 'increasing' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {summary.trend_direction}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.average_interest.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Average Interest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.max_interest}</div>
            <div className="text-sm text-muted-foreground">Peak Interest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.min_interest}</div>
            <div className="text-sm text-muted-foreground">Min Interest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.volatility.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Volatility</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRelatedQueries = (queries: any) => {
    if (!queries || Object.keys(queries).length === 0) return null

    return (
      <div className="space-y-4">
        {Object.entries(queries).map(([keyword, data]: [string, any]) => (
          <Card key={keyword}>
            <CardHeader>
              <CardTitle className="text-lg">{keyword}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="top" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="top">Top Queries</TabsTrigger>
                  <TabsTrigger value="rising">Rising Queries</TabsTrigger>
                </TabsList>
                <TabsContent value="top" className="space-y-2">
                  {data.top && data.top.length > 0 ? (
                    <div className="grid gap-2">
                      {data.top.slice(0, 5).map((query: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{query.query}</span>
                          <Badge variant="outline">{query.value}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No top queries available</p>
                  )}
                </TabsContent>
                <TabsContent value="rising" className="space-y-2">
                  {data.rising && data.rising.length > 0 ? (
                    <div className="grid gap-2">
                      {data.rising.slice(0, 5).map((query: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{query.query}</span>
                          <Badge variant="secondary">{query.value}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rising queries available</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Google Trends Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Analyze search trends and popularity over time with detailed insights
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Configuration</CardTitle>
            <CardDescription>
              Enter search terms and configure your analysis parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Terms</label>
                <Input
                  placeholder="e.g., react, vue, angular (comma-separated)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Geographic Region</label>
                <Select value={geo} onValueChange={setGeo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {geoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchTerm.trim()}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Trends...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Trends
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {results.summary && Object.keys(results.summary).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Trend Summary
                </h2>
                {Object.entries(results.summary).map(([keyword, summary]) => 
                  renderSummaryCard(keyword, summary)
                )}
              </div>
            )}

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Detailed Analysis
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {results.timeframe}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {results.geo || "Worldwide"}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="queries">Related Queries</TabsTrigger>
                    <TabsTrigger value="topics">Related Topics</TabsTrigger>
                    <TabsTrigger value="regional">Regional Interest</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="text-center py-8">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Interest Over Time</h3>
                      <p className="text-muted-foreground mb-4">
                        Interactive charts and visualizations will be displayed here
                      </p>
                      <Badge variant="outline">
                        Keywords: {results.keywords.join(", ")}
                      </Badge>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="queries" className="space-y-4">
                    {renderRelatedQueries(results.related_queries)}
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Related topics data will be displayed here
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="regional" className="space-y-4">
                    <div className="text-center py-8">
                      <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Regional interest data will be displayed here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Raw Data for Development */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Data (Development View)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}