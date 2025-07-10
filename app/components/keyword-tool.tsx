"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Loader2, Plus, Copy, ArrowUpDown, Trash2, Download, X, ExternalLink } from "lucide-react"

// Types and Interfaces
export interface KeywordData {
  id: string
  keyword: string
  volume: number
  cpc: number
  competition: number
  trend: number[]
  platform: string
}

export interface SearchParams {
  seed: string
  platform: string
  language: string
  location: string
  type: "suggestions" | "questions"
}

interface CompetitorKeyword extends KeywordData {
  position: number
  url: string
  traffic: number
}

// Constants
const platforms = [
  { value: "google", label: "Google" },
  { value: "youtube", label: "YouTube" },
  { value: "bing", label: "Bing" },
  { value: "amazon", label: "Amazon" },
  { value: "ebay", label: "eBay" },
  { value: "pinterest", label: "Pinterest" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "appstore", label: "App Store" },
  { value: "playstore", label: "Play Store" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
]

const locations = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "BR", label: "Brazil" },
  { value: "JP", label: "Japan" },
]

// Mock data for demonstration
const generateMockKeywords = (seed: string, count: number = 50): KeywordData[] => {
  const suggestions = [
    `${seed} best`,
    `${seed} guide`,
    `${seed} tutorial`,
    `${seed} review`,
    `${seed} comparison`,
    `${seed} tips`,
    `${seed} benefits`,
    `${seed} alternatives`,
    `${seed} pricing`,
    `${seed} free`,
    `best ${seed}`,
    `how to ${seed}`,
    `${seed} vs`,
    `${seed} software`,
    `${seed} tool`,
    `${seed} online`,
    `${seed} download`,
    `${seed} app`,
    `${seed} service`,
    `${seed} platform`,
  ]

  return Array.from({ length: count }, (_, i) => {
    const keyword = suggestions[i % suggestions.length] || `${seed} ${i + 1}`
    return {
      id: `kw-${i}`,
      keyword,
      volume: Math.floor(Math.random() * 50000) + 100,
      cpc: Math.random() * 10 + 0.1,
      competition: Math.random(),
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      platform: "google",
    }
  })
}

// Trend Chart Component
function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 15
      return `${x},${y}`
    })
    .join(" ")

  const isUpward = data[data.length - 1] > data[0]
  const color = isUpward ? "#10b981" : "#ef4444"

  return (
    <svg width="60" height="20" className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  )
}

// Search Interface Component
function SearchInterface({
  onSearch,
  isLoading,
  searchParams,
}: {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
  searchParams: SearchParams
}) {
  const [formData, setFormData] = useState<SearchParams>(searchParams)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.seed.trim()) {
      onSearch(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="seed">Seed Keyword</Label>
        <div className="relative">
          <Input
            id="seed"
            type="text"
            placeholder="Enter your seed keyword (e.g., vegan protein)"
            value={formData.seed}
            onChange={(e) => setFormData({ ...formData, seed: e.target.value })}
            className="pr-12"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            disabled={isLoading || !formData.seed.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Search Type</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: "suggestions" | "questions") => setFormData({ ...formData, type: value })}
          className="flex space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="suggestions" id="suggestions" />
            <Label htmlFor="suggestions">Suggestions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="questions" id="questions" />
            <Label htmlFor="questions">Questions</Label>
          </div>
        </RadioGroup>
      </div>
    </form>
  )
}

// Results Table Component
function ResultsTable({
  results,
  onAddToBasket,
  basket,
}: {
  results: KeywordData[]
  onAddToBasket: (keyword: KeywordData) => void
  basket: KeywordData[]
}) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<keyof KeywordData>("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState({
    minVolume: "",
    maxVolume: "",
    minCpc: "",
    maxCpc: "",
    competition: "all",
  })

  const isInBasket = (keywordId: string) => basket.some((item) => item.id === keywordId)

  const handleSort = (column: keyof KeywordData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeywords(results.map((r) => r.id))
    } else {
      setSelectedKeywords([])
    }
  }

  const handleSelectKeyword = (keywordId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords([...selectedKeywords, keywordId])
    } else {
      setSelectedKeywords(selectedKeywords.filter((id) => id !== keywordId))
    }
  }

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword)
  }

  const copyKeywordWithVolume = (keyword: string, volume: number) => {
    navigator.clipboard.writeText(`${keyword} (${volume.toLocaleString()})`)
  }

  const addSelectedToBasket = () => {
    const selectedResults = results.filter((r) => selectedKeywords.includes(r.id))
    selectedResults.forEach((keyword) => onAddToBasket(keyword))
    setSelectedKeywords([])
  }

  const getCompetitionColor = (competition: number) => {
    if (competition < 0.3) return "bg-green-100 text-green-800"
    if (competition < 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getCompetitionLabel = (competition: number) => {
    if (competition < 0.3) return "Low"
    if (competition < 0.7) return "Medium"
    return "High"
  }

  const filteredResults = results.filter((result) => {
    const volumeMin = filters.minVolume ? Number.parseInt(filters.minVolume) : 0
    const volumeMax = filters.maxVolume ? Number.parseInt(filters.maxVolume) : Number.POSITIVE_INFINITY
    const cpcMin = filters.minCpc ? Number.parseFloat(filters.minCpc) : 0
    const cpcMax = filters.maxCpc ? Number.parseFloat(filters.maxCpc) : Number.POSITIVE_INFINITY

    return (
      result.volume >= volumeMin &&
      result.volume <= volumeMax &&
      result.cpc >= cpcMin &&
      result.cpc <= cpcMax &&
      (filters.competition === "all" ||
        (filters.competition === "low" && result.competition < 0.3) ||
        (filters.competition === "medium" && result.competition >= 0.3 && result.competition < 0.7) ||
        (filters.competition === "high" && result.competition >= 0.7))
    )
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Keyword Suggestions ({sortedResults.length})</h2>
        {selectedKeywords.length > 0 && (
          <Button onClick={addSelectedToBasket} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Selected to Basket ({selectedKeywords.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium mb-1 block">Min Volume</label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minVolume}
            onChange={(e) => setFilters({ ...filters, minVolume: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Max Volume</label>
          <Input
            type="number"
            placeholder="∞"
            value={filters.maxVolume}
            onChange={(e) => setFilters({ ...filters, maxVolume: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Min CPC</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filters.minCpc}
            onChange={(e) => setFilters({ ...filters, minCpc: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Max CPC</label>
          <Input
            type="number"
            step="0.01"
            placeholder="∞"
            value={filters.maxCpc}
            onChange={(e) => setFilters({ ...filters, maxCpc: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Competition</label>
          <Select value={filters.competition} onValueChange={(value) => setFilters({ ...filters, competition: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedKeywords.length === sortedResults.length && sortedResults.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("keyword")} className="h-auto p-0 font-semibold">
                  Keyword <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("volume")} className="h-auto p-0 font-semibold">
                  Volume <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("cpc")} className="h-auto p-0 font-semibold">
                  CPC <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("competition")} className="h-auto p-0 font-semibold">
                  Competition <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((result) => (
              <TableRow key={result.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedKeywords.includes(result.id)}
                    onCheckedChange={(checked) => handleSelectKeyword(result.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{result.keyword}</TableCell>
                <TableCell>{result.volume.toLocaleString()}</TableCell>
                <TableCell>${result.cpc.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getCompetitionColor(result.competition)}>
                    {getCompetitionLabel(result.competition)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TrendChart data={result.trend} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyKeyword(result.keyword)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyKeywordWithVolume(result.keyword, result.volume)}
                      className="h-8 px-2"
                    >
                      Copy+Vol
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAddToBasket(result)}
                      disabled={isInBasket(result.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Keyword Basket Component
function KeywordBasket({
  basket,
  onRemove,
  onClear,
  onExport,
}: {
  basket: KeywordData[]
  onRemove: (keywordId: string) => void
  onClear: () => void
  onExport: () => void
}) {
  const totalVolume = basket.reduce((sum, item) => sum + item.volume, 0)
  const avgCpc = basket.length > 0 ? basket.reduce((sum, item) => sum + item.cpc, 0) / basket.length : 0

  const copyKeywords = () => {
    const keywords = basket.map((item) => item.keyword).join("\n")
    navigator.clipboard.writeText(keywords)
  }

  const copyKeywordsWithVolume = () => {
    const keywords = basket.map((item) => `${item.keyword}\t${item.volume}`).join("\n")
    navigator.clipboard.writeText(keywords)
  }

  const copyFullData = () => {
    const header = "Keyword\tVolume\tCPC\tCompetition\tPlatform"
    const data = basket
      .map((item) => `${item.keyword}\t${item.volume}\t${item.cpc}\t${item.competition}\t${item.platform}`)
      .join("\n")
    navigator.clipboard.writeText(`${header}\n${data}`)
  }

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Keyword Basket</CardTitle>
          <Badge variant="secondary">{basket.length}</Badge>
        </div>
        {basket.length > 0 && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>Total Volume: {totalVolume.toLocaleString()}</div>
            <div>Avg CPC: ${avgCpc.toFixed(2)}</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {basket.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Add keywords to your basket to get started</p>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {basket.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.keyword}</div>
                    <div className="text-gray-500 text-xs">
                      {item.volume.toLocaleString()} • ${item.cpc.toFixed(2)}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)} className="h-6 w-6 p-0 ml-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Quick Copy:</div>
              <div className="grid grid-cols-1 gap-2">
                <Button size="sm" variant="outline" onClick={copyKeywords} className="justify-start bg-transparent">
                  <Copy className="h-3 w-3 mr-2" />
                  Keywords Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyKeywordsWithVolume}
                  className="justify-start bg-transparent"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Keywords + Volume
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyFullData}
                  className="justify-start bg-transparent"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Full Data
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={onExport} className="flex-1">
                <Download className="h-3 w-3 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={onClear} className="flex-1">
                <Trash2 className="h-3 w-3 mr-2" />
                Clear
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Main Keyword Tool Component
export default function KeywordTool() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    seed: "",
    platform: "google",
    language: "en",
    location: "US",
    type: "suggestions",
  })
  const [results, setResults] = useState<KeywordData[]>([])
  const [basket, setBasket] = useState<KeywordData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setSearchParams(params)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Generate mock results
    const mockResults = generateMockKeywords(params.seed)
    setResults(mockResults)
    setIsLoading(false)
  }

  const handleAddToBasket = (keyword: KeywordData) => {
    if (!basket.some((item) => item.id === keyword.id)) {
      setBasket([...basket, keyword])
    }
  }

  const handleRemoveFromBasket = (keywordId: string) => {
    setBasket(basket.filter((item) => item.id !== keywordId))
  }

  const handleClearBasket = () => {
    setBasket([])
  }

  const handleExportBasket = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Keyword,Volume,CPC,Competition,Platform\n" +
      basket.map(item => `${item.keyword},${item.volume},${item.cpc},${item.competition},${item.platform}`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "keywords.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Keyword Research Tool</h1>
          <SearchInterface onSearch={handleSearch} isLoading={isLoading} searchParams={searchParams} />
        </div>

        {(results.length > 0 || isLoading) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Searching for keywords...</span>
                </div>
              ) : (
                <ResultsTable results={results} onAddToBasket={handleAddToBasket} basket={basket} />
              )}
            </div>

            <div className="lg:col-span-1">
              <KeywordBasket
                basket={basket}
                onRemove={handleRemoveFromBasket}
                onClear={handleClearBasket}
                onExport={handleExportBasket}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
