"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Download,
  Bell,
  Calendar,
  Filter,
  Zap,
  Target,
  Activity,
  Map,
  PieChart,
  LineChart,
  Users,
  Sparkles,
  TrendingDown,
  Globe,
  Clock,
} from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from "recharts"

interface SummaryData {
  average_interest: number
  max_interest: number
  min_interest: number
  trend_direction: string
  volatility: number
  peak_date?: string
  growth_rate?: number
  consistency?: number
  momentum?: number
}

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
  summary: Record<string, SummaryData>
  comparison_insights?: any
  trending_searches?: any[]
  keyword_suggestions?: string[]
  category_trends?: any
  seasonal_patterns?: any
  competitor_analysis?: any
  chart_data?: {
    line_chart?: any[]
    bar_chart?: any[]
  }
  regional_breakdown?: Record<string, any>
}

interface TrendingSearch {
  title: string
  formattedTraffic: string
  relatedQueries: string[]
  image?: string
  articles?: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function EnhancedGoogleTrendsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [timeframe, setTimeframe] = useState("today 12-m")
  const [geo, setGeo] = useState("worldwide")
  const [category, setCategory] = useState("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<TrendsData | null>(null)
  const [realTimeTrends, setRealTimeTrends] = useState<TrendingSearch[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState(50)
  const [exportFormat, setExportFormat] = useState("json")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["interest", "queries", "topics"])
  const [visualReportLoading, setVisualReportLoading] = useState(false)
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
    { value: "all", label: "All time" },
  ]

  const categoryOptions = [
  { value: "0", label: "All Categories" },
  { value: "3", label: "Arts & Entertainment" },
  { value: "5", label: "Autos & Vehicles" },
  { value: "45", label: "Beauty & Fitness" },
  { value: "12", label: "Business & Industrial" },
  { value: "16", label: "Computers & Electronics" },
  { value: "533", label: "Finance" },
  { value: "46", label: "Food & Drink" }, // Changed from "45" to "46"
  { value: "20", label: "Games" },
  { value: "47", label: "Health" }, // Changed from "45" to "47"
  { value: "299", label: "Home & Garden" },
  { value: "958", label: "Internet & Telecom" },
  { value: "174", label: "Jobs & Education" },
  { value: "300", label: "Law & Government" }, // Changed from "299" to "300"
  { value: "1", label: "News" },
  { value: "7", label: "Online Communities" },
  { value: "13", label: "People & Society" },
  { value: "67", label: "Pets & Animals" },
  { value: "71", label: "Real Estate" },
  { value: "14", label: "Reference" },
  { value: "31", label: "Science" },
  { value: "17", label: "Shopping" }, // Changed from "16" to "17"
  { value: "21", label: "Sports" },
  { value: "301", label: "Travel" },
];


  const geoOptions = [
    { value: "worldwide", label: "🌍 Worldwide" },
    { value: "US", label: "🇺🇸 United States" },
    { value: "GB", label: "🇬🇧 United Kingdom" },
    { value: "CA", label: "🇨🇦 Canada" },
    { value: "AU", label: "🇦🇺 Australia" },
    { value: "DE", label: "🇩🇪 Germany" },
    { value: "FR", label: "🇫🇷 France" },
    { value: "JP", label: "🇯🇵 Japan" },
    { value: "IN", label: "🇮🇳 India" },
    { value: "BR", label: "🇧🇷 Brazil" },
    { value: "CN", label: "🇨🇳 China" },
    { value: "RU", label: "🇷🇺 Russia" },
    { value: "KR", label: "🇰🇷 South Korea" },
    { value: "IT", label: "🇮🇹 Italy" },
    { value: "ES", label: "🇪🇸 Spain" },
  ]

  const handleVisualReport = useCallback(async () => {
    if (!searchTerm.trim()) return
    setVisualReportLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchTerm,
        timeframe: timeframe,
        geo: geo === "worldwide" ? "US" : geo  // Default to US for visual report
      })
      const response = await fetch(`${API_BASE_URL}/google-trends/visual-report?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (data.success) {
        setResults(data)
        if (data.trending_searches) {
          setRealTimeTrends(data.trending_searches)
        }
      } else {
        setError(data.error || "Failed to generate visual report")
      }
    } catch (error) {
      console.error("Visual report error:", error)
      setError("Failed to generate visual report. Please try again.")
    } finally {
      setVisualReportLoading(false)
    }
  }, [searchTerm, timeframe, geo])

  const handleSearch = useCallback(async () => {
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
        // Update real-time trends if available
        if (data.trending_searches) {
          setRealTimeTrends(data.trending_searches)
        }
      } else {
        setError(data.error || "Failed to fetch Google Trends data")
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to fetch trends data. Please check if the backend is running and try again.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, timeframe, geo])

  useEffect(() => {
    if (autoRefresh && results) {
      const interval = setInterval(() => {
        handleSearch()
      }, 300000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh, results, handleSearch])

  const handleExport = () => {
    if (!results) return
    const dataStr = exportFormat === "json" ? JSON.stringify(results, null, 2) : convertToCSV(results)
    const dataBlob = new Blob([dataStr], { type: exportFormat === "json" ? "application/json" : "text/csv" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `trends-data-${Date.now()}.${exportFormat}`
    link.click()
  }

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for demo
    return "Date,Keyword,Interest\n" // Placeholder for actual CSV conversion logic
  }

  const getFirstSummary = (): SummaryData | null => {
    if (!results?.summary) return null
    const summaryValues = Object.values(results.summary)
    return summaryValues.length > 0 ? summaryValues[0] : null
  }

  const renderAdvancedCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Interest Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Interest Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={results?.chart_data?.line_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {results?.keywords.map((keyword, index) => (
                <Line 
                  key={keyword} 
                  type="monotone" 
                  dataKey={keyword} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Regional Interest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Regional Interest (Top 15)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results?.chart_data?.bar_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      {results?.seasonal_patterns?.monthly_patterns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seasonal Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={results.seasonal_patterns.monthly_patterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {results?.keywords.map((keyword, index) => (
                  <Area
                    key={keyword}
                    type="monotone"
                    dataKey={keyword}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Market Share Analysis */}
      {results?.competitor_analysis?.market_share && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Market Share Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={results.competitor_analysis.market_share}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {results.competitor_analysis.market_share.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Market Share']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance Comparison */}
      {results?.competitor_analysis?.performance_comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.competitor_analysis.performance_comparison).map(([keyword, data]: [string, any]) => (
                <div key={keyword} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{keyword}</Badge>
                    <span className="text-sm font-medium">Current: {data.current_position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${data.trend_7d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.trend_7d > 0 ? '↗' : '↘'} {Math.abs(data.trend_7d).toFixed(1)}
                    </span>
                    <Badge variant="secondary">#{data.volatility_rank}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Regional Breakdown */}
      {results?.regional_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.regional_breakdown).map(([keyword, data]: [string, any]) => (
                <div key={keyword} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{keyword}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Average Interest</p>
                      <p className="font-medium">{data.average_interest?.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Active Regions</p>
                      <p className="font-medium">{data.regions_with_data}/{data.total_regions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderRealTimeTrends = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Real-Time Trending Searches
          {autoRefresh && (
            <Badge variant="secondary" className="ml-2">
              Auto-refresh ON
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Live trending searches updated every 5 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {realTimeTrends.map((trend, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{trend.title}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {trend.relatedQueries.slice(0, 3).map((query, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {query}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="default">{trend.formattedTraffic}</Badge>
                <div className="text-sm text-muted-foreground mt-1">searches</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderKeywordSuggestions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Keyword Suggestions
        </CardTitle>
        <CardDescription>Related keywords to expand your analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {results?.keyword_suggestions?.map((keyword, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm((prev) => (prev ? `${prev}, ${keyword}` : keyword))}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {keyword}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderAlertSystem = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Trend Alerts
        </CardTitle>
        <CardDescription>Get notified when search interest crosses your threshold</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Alert Threshold</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-20"
              min="1"
              max="100"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <Progress value={alertThreshold} className="w-full" />
        <div className="flex items-center justify-between">
          <span className="text-sm">Email notifications</span>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">SMS alerts</span>
          <Switch />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Advanced Google Trends Analytics</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comprehensive trend analysis with real-time insights, predictive analytics, and automated reporting
          </p>
        </div>
        {/* Enhanced Search Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Search Configuration
            </CardTitle>
            <CardDescription>Configure your analysis with advanced filters and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Terms</label>
                <Input
                  placeholder="e.g., react, vue, angular"
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-refresh</label>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Comparison Mode</label>
                <Switch checked={comparisonMode} onCheckedChange={setComparisonMode} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()} className="flex-1 md:flex-none">
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
              <Button 
                onClick={handleVisualReport} 
                disabled={visualReportLoading || !searchTerm.trim()}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                {visualReportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Visual Report
                  </>
                )}
              </Button>
              {results && (
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Real-time Trending Searches */}
        <div className="mb-8">{renderRealTimeTrends()}</div>
        {results && (
          <div className="space-y-8">
            {/* Enhanced Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Peak Interest</p>
                      <p className="text-2xl font-bold">{getFirstSummary()?.max_interest || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Peak: {getFirstSummary()?.peak_date || 'N/A'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Interest</p>
                      <p className="text-2xl font-bold">{getFirstSummary()?.average_interest?.toFixed(1) || "0"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Growth: {getFirstSummary()?.growth_rate?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Volatility</p>
                      <p className="text-2xl font-bold">{getFirstSummary()?.volatility?.toFixed(1) || "0"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Consistency: {((getFirstSummary()?.consistency || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Momentum</p>
                      <p className="text-2xl font-bold">{getFirstSummary()?.momentum?.toFixed(1) || "0"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trend: {getFirstSummary()?.trend_direction || 'N/A'}
                      </p>
                    </div>
                    {getFirstSummary()?.trend_direction === 'increasing' ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Advanced Visualizations */}
            <div className="space-y-6">{renderAdvancedCharts()}</div>
            {/* Enhanced Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detailed Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visual">Visual Report</TabsTrigger>
                    <TabsTrigger value="queries">Related Queries</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="api">API</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-6">
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Comprehensive Overview</h3>
                      <p className="text-muted-foreground mb-4">
                        All your trend data visualized in interactive charts above
                      </p>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline">Keywords: {results.keywords.join(", ")}</Badge>
                        <Badge variant="outline">Timeframe: {results.timeframe}</Badge>
                        <Badge variant="outline">Region: {results.geo || "Worldwide"}</Badge>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="visual" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Visual Google Trends Report
                        </CardTitle>
                        <CardDescription>
                          Comprehensive visual analysis mimicking the Python script functionality
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Chart 1: Interest Over Time */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">📈 [1] Interest Over Time Chart</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={results?.chart_data?.line_chart || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis label={{ value: 'Relative Search Interest', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                {results?.keywords.map((keyword, index) => (
                                  <Line 
                                    key={keyword} 
                                    type="monotone" 
                                    dataKey={keyword} 
                                    stroke={COLORS[index % COLORS.length]} 
                                    strokeWidth={3}
                                    dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                                  />
                                ))}
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Chart 2: Regional Interest */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">
                            🌍 [2] Interest by Region (Top 15 for "{results?.keywords[0]}")
                          </h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={results?.chart_data?.bar_chart || []} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" label={{ value: 'Relative Search Interest', position: 'insideBottom', offset: -10 }} />
                                <YAxis type="category" dataKey="region" width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4F46E5" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Table 3: Related Queries */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">🔍 [3] Related Queries</h3>
                          <div className="grid gap-6">
                            {Object.entries(results.related_queries || {}).map(([keyword, data]: [string, any]) => (
                              <Card key={keyword}>
                                <CardHeader>
                                  <CardTitle className="text-base">For keyword: '{keyword}'</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-3 text-green-600">TOP Related Queries:</h4>
                                      {data.top && data.top.length > 0 ? (
                                        <div className="space-y-2">
                                          {data.top.slice(0, 10).map((query: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                              <span className="text-sm">{query.query}</span>
                                              <Badge variant="outline">{query.value}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No TOP Related Queries found.</p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3 text-blue-600">RISING Related Queries:</h4>
                                      {data.rising && data.rising.length > 0 ? (
                                        <div className="space-y-2">
                                          {data.rising.slice(0, 10).map((query: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                              <span className="text-sm">{query.query}</span>
                                              <Badge variant="secondary">{query.value}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No RISING Related Queries found.</p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Table 4: Related Topics */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">📚 [4] Related Topics</h3>
                          <div className="grid gap-6">
                            {Object.entries(results.related_topics || {}).map(([keyword, data]: [string, any]) => (
                              <Card key={keyword}>
                                <CardHeader>
                                  <CardTitle className="text-base">For keyword: '{keyword}'</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-3 text-purple-600">TOP Related Topics:</h4>
                                      {data.top && data.top.length > 0 ? (
                                        <div className="space-y-2">
                                          {data.top.slice(0, 10).map((topic: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                              <span className="text-sm">{topic.topic_title || topic.title}</span>
                                              <Badge variant="outline">{topic.value}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No TOP Related Topics found.</p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3 text-orange-600">RISING Related Topics:</h4>
                                      {data.rising && data.rising.length > 0 ? (
                                        <div className="space-y-2">
                                          {data.rising.slice(0, 10).map((topic: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                              <span className="text-sm">{topic.topic_title || topic.title}</span>
                                              <Badge variant="secondary">{topic.value}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No RISING Related Topics found.</p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="text-center pt-6">
                          <Badge variant="default" className="text-lg p-2">
                            ✅ Visual report completed
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="queries" className="space-y-4">
                    {Object.entries(results.related_queries || {}).map(([keyword, data]: [string, any]) => (
                      <Card key={keyword}>
                        <CardHeader>
                          <CardTitle className="text-lg">{keyword}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Top Queries
                              </h4>
                              <div className="space-y-2">
                                {data.top?.slice(0, 5).map((query: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                  >
                                    <span className="text-sm font-medium">{query.query}</span>
                                    <Badge variant="outline">{query.value}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Rising Queries
                              </h4>
                              <div className="space-y-2">
                                {data.rising?.slice(0, 5).map((query: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                  >
                                    <span className="text-sm font-medium">{query.query}</span>
                                    <Badge variant="secondary">{query.value}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="suggestions" className="space-y-4">
                    {renderKeywordSuggestions()}
                  </TabsContent>
                  <TabsContent value="alerts" className="space-y-4">
                    {renderAlertSystem()}
                  </TabsContent>
                  <TabsContent value="reports" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Automated Reports
                        </CardTitle>
                        <CardDescription>Schedule and customize your trend reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Report Frequency</label>
                            <Select defaultValue="weekly">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Report Format</label>
                            <Select defaultValue="pdf">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF Report</SelectItem>
                                <SelectItem value="email">Email Summary</SelectItem>
                                <SelectItem value="dashboard">Dashboard Link</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Recipients</label>
                          <Textarea placeholder="Enter email addresses separated by commas" />
                        </div>
                        <Button className="w-full">
                          <Bell className="mr-2 h-4 w-4" />
                          Schedule Report
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="api" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>API Integration</CardTitle>
                        <CardDescription>Integrate trends data into your applications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">API Endpoint</label>
                            <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm">
                              GET /google-trends?query={searchTerm}&timeframe={timeframe}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Sample Response</label>
                            <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-40">
                              {JSON.stringify(
                                {
                                  success: true,
                                  keywords: ["react"],
                                  data: {
                                    interest_over_time: "...",
                                    related_queries: "...",
                                    summary: "...",
                                  },
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                          <Button variant="outline" className="w-full bg-transparent">
                            <Download className="mr-2 h-4 w-4" />
                            Download API Documentation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
