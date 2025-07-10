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

// Mock data sets for different industries
const mockDataSets = {
  "digital marketing": [
    {
      id: "dm-1",
      keyword: "digital marketing strategy",
      volume: 27100,
      cpc: 4.25,
      competition: 0.82,
      trend: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
      platform: "google",
    },
    {
      id: "dm-2", 
      keyword: "SEO optimization",
      volume: 49500,
      cpc: 6.85,
      competition: 0.91,
      trend: [120, 118, 125, 132, 128, 140, 145, 138, 150, 155, 162, 158],
      platform: "google",
    },
    {
      id: "dm-3",
      keyword: "content marketing tips",
      volume: 18900,
      cpc: 3.45,
      competition: 0.67,
      trend: [85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140],
      platform: "google",
    },
    {
      id: "dm-4",
      keyword: "social media advertising",
      volume: 33200,
      cpc: 5.12,
      competition: 0.78,
      trend: [110, 115, 108, 122, 118, 135, 140, 132, 148, 152, 145, 160],
      platform: "google",
    },
    {
      id: "dm-5",
      keyword: "email marketing automation",
      volume: 22800,
      cpc: 7.95,
      competition: 0.74,
      trend: [95, 102, 98, 115, 112, 125, 130, 128, 135, 142, 138, 145],
      platform: "google",
    },
  ],
  "fitness": [
    {
      id: "fit-1",
      keyword: "home workout routine",
      volume: 74000,
      cpc: 2.15,
      competition: 0.56,
      trend: [80, 85, 120, 180, 220, 200, 185, 175, 190, 195, 185, 175],
      platform: "google",
    },
    {
      id: "fit-2",
      keyword: "protein powder reviews",
      volume: 41200,
      cpc: 3.85,
      competition: 0.83,
      trend: [100, 105, 110, 115, 118, 122, 125, 128, 132, 135, 138, 140],
      platform: "google",
    },
    {
      id: "fit-3",
      keyword: "weight loss meal plan",
      volume: 58600,
      cpc: 4.25,
      competition: 0.72,
      trend: [120, 140, 160, 180, 200, 185, 170, 160, 165, 170, 175, 180],
      platform: "google",
    },
    {
      id: "fit-4",
      keyword: "yoga for beginners",
      volume: 67300,
      cpc: 1.95,
      competition: 0.48,
      trend: [90, 95, 105, 125, 145, 155, 150, 145, 140, 135, 130, 125],
      platform: "google",
    },
    {
      id: "fit-5",
      keyword: "muscle building supplements",
      volume: 29800,
      cpc: 5.45,
      competition: 0.89,
      trend: [105, 110, 108, 115, 120, 125, 130, 135, 132, 140, 145, 148],
      platform: "google",
    },
  ],
  "technology": [
    {
      id: "tech-1",
      keyword: "artificial intelligence trends",
      volume: 36500,
      cpc: 8.95,
      competition: 0.71,
      trend: [60, 75, 90, 110, 135, 160, 185, 210, 235, 260, 285, 310],
      platform: "google",
    },
    {
      id: "tech-2",
      keyword: "cloud computing services",
      volume: 45200,
      cpc: 12.45,
      competition: 0.95,
      trend: [100, 105, 112, 118, 125, 132, 140, 148, 155, 162, 170, 178],
      platform: "google",
    },
    {
      id: "tech-3",
      keyword: "cybersecurity solutions",
      volume: 28700,
      cpc: 15.25,
      competition: 0.88,
      trend: [85, 92, 98, 105, 112, 120, 128, 135, 142, 150, 158, 165],
      platform: "google",
    },
    {
      id: "tech-4",
      keyword: "mobile app development",
      volume: 52300,
      cpc: 9.75,
      competition: 0.79,
      trend: [95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150],
      platform: "google",
    },
    {
      id: "tech-5",
      keyword: "blockchain technology",
      volume: 41800,
      cpc: 11.85,
      competition: 0.65,
      trend: [200, 180, 160, 140, 120, 110, 105, 100, 98, 95, 92, 90],
      platform: "google",
    },
  ],
  "e-commerce": [
    {
      id: "ecom-1",
      keyword: "online store builder",
      volume: 33400,
      cpc: 7.25,
      competition: 0.85,
      trend: [90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
      platform: "google",
    },
    {
      id: "ecom-2",
      keyword: "dropshipping suppliers",
      volume: 24600,
      cpc: 4.95,
      competition: 0.73,
      trend: [110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165],
      platform: "google",
    },
    {
      id: "ecom-3",
      keyword: "payment gateway integration",
      volume: 18900,
      cpc: 9.85,
      competition: 0.81,
      trend: [85, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128],
      platform: "google",
    },
    {
      id: "ecom-4",
      keyword: "inventory management software",
      volume: 27500,
      cpc: 12.45,
      competition: 0.92,
      trend: [100, 102, 105, 108, 112, 116, 120, 124, 128, 132, 136, 140],
      platform: "google",
    },
    {
      id: "ecom-5",
      keyword: "customer review platform",
      volume: 15800,
      cpc: 6.75,
      competition: 0.68,
      trend: [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135],
      platform: "google",
    },
  ],
  "real estate": [
    {
      id: "re-1",
      keyword: "home buying process",
      volume: 45600,
      cpc: 8.45,
      competition: 0.77,
      trend: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
      platform: "google",
    },
    {
      id: "re-2",
      keyword: "property investment tips",
      volume: 29300,
      cpc: 11.25,
      competition: 0.84,
      trend: [90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
      platform: "google",
    },
    {
      id: "re-3",
      keyword: "mortgage calculator",
      volume: 67800,
      cpc: 15.95,
      competition: 0.96,
      trend: [110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165],
      platform: "google",
    },
    {
      id: "re-4",
      keyword: "real estate market trends",
      volume: 38500,
      cpc: 6.85,
      competition: 0.62,
      trend: [85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140],
      platform: "google",
    },
    {
      id: "re-5",
      keyword: "rental property management",
      volume: 22700,
      cpc: 9.75,
      competition: 0.79,
      trend: [95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150],
      platform: "google",
    },
  ],
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
            placeholder="Enter your seed keyword (e.g., digital marketing, fitness, technology)"
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
                      {item.volume.toLocaleString()} • ${item.cpc}
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
                <Button size="sm" variant="outline" onClick={copyFullData} className="justify-start bg-transparent">
                  <Copy className="h-3 w-3 mr-2" />
                  Full Data
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={onExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={onClear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Competitor Analysis Component
function CompetitorAnalysis({
  onAddToBasket,
}: {
  onAddToBasket: (keyword: KeywordData) => void
}) {
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CompetitorKeyword[]>([])

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!competitorUrl.trim()) return

    setIsLoading(true)

    // Mock API call - replace with actual competitor analysis API
    setTimeout(() => {
      const mockResults: CompetitorKeyword[] = [
        {
          id: "comp-1",
          keyword: "protein powder reviews",
          volume: 18000,
          cpc: 2.85,
          competition: 0.8,
          trend: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
          platform: "google",
          position: 3,
          url: "/protein-powder-reviews",
          traffic: 2400,
        },
        {
          id: "comp-2",
          keyword: "best whey protein",
          volume: 22000,
          cpc: 3.45,
          competition: 0.9,
          trend: [120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175],
          platform: "google",
          position: 1,
          url: "/best-whey-protein",
          traffic: 8800,
        },
        {
          id: "comp-3",
          keyword: "protein supplements guide",
          volume: 8500,
          cpc: 2.2,
          competition: 0.6,
          trend: [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135],
          platform: "google",
          position: 5,
          url: "/supplements-guide",
          traffic: 1200,
        },
        {
          id: "comp-4",
          keyword: "muscle building protein",
          volume: 15000,
          cpc: 3.1,
          competition: 0.7,
          trend: [90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
          platform: "google",
          position: 2,
          url: "/muscle-building",
          traffic: 4500,
        },
      ]
      setResults(mockResults)
      setIsLoading(false)
    }, 1500)
  }

  const getPositionColor = (position: number) => {
    if (position <= 3) return "bg-green-100 text-green-800"
    if (position <= 10) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const totalTraffic = results.reduce((sum, item) => sum + item.traffic, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Competitor Analysis</h2>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor-url">Competitor URL</Label>
            <div className="flex space-x-2">
              <Input
                id="competitor-url"
                type="url"
                placeholder="https://competitor.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !competitorUrl.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Analyze
              </Button>
            </div>
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Competitor Keywords ({results.length})</h3>
            <div className="text-sm text-gray-600">Total estimated traffic: {totalTraffic.toLocaleString()}/month</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>Traffic</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.keyword}</TableCell>
                    <TableCell>
                      <Badge className={getPositionColor(result.position)}>#{result.position}</Badge>
                    </TableCell>
                    <TableCell>{result.volume.toLocaleString()}</TableCell>
                    <TableCell>${result.cpc.toFixed(2)}</TableCell>
                    <TableCell>{result.traffic.toLocaleString()}</TableCell>
                    <TableCell>
                      <a
                        href={`${competitorUrl}${result.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {result.url}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => onAddToBasket(result)} className="h-8 w-8 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

// Export Modal Component
function ExportModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean
  onClose: () => void
  data: KeywordData[]
}) {
  const [format, setFormat] = useState<"csv" | "excel">("csv")
  const [includeFields, setIncludeFields] = useState({
    keyword: true,
    volume: true,
    cpc: true,
    competition: true,
    platform: true,
    trend: false,
  })

  const handleExport = () => {
    const headers = []
    if (includeFields.keyword) headers.push("Keyword")
    if (includeFields.volume) headers.push("Volume")
    if (includeFields.cpc) headers.push("CPC")
    if (includeFields.competition) headers.push("Competition")
    if (includeFields.platform) headers.push("Platform")
    if (includeFields.trend) headers.push("Trend Data")

    const rows = data.map((item) => {
      const row = []
      if (includeFields.keyword) row.push(item.keyword)
      if (includeFields.volume) row.push(item.volume.toString())
      if (includeFields.cpc) row.push(item.cpc.toString())
      if (includeFields.competition) row.push(item.competition.toString())
      if (includeFields.platform) row.push(item.platform)
      if (includeFields.trend) row.push(item.trend.join(","))
      return row
    })

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `keywords.${format}`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onClose()
  }

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Keywords</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: "csv" | "excel") => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Include Fields</Label>
            <div className="space-y-2">
              {Object.entries(includeFields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={() => toggleField(field as keyof typeof includeFields)}
                  />
                  <Label htmlFor={field} className="capitalize">
                    {field === "cpc" ? "CPC" : field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600">Exporting {data.length} keywords</div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get mock data based on seed keyword
function getMockDataForKeyword(seed: string, platform: string): KeywordData[] {
  const lowerSeed = seed.toLowerCase()
  
  // Check if seed matches any of our predefined categories
  for (const [category, data] of Object.entries(mockDataSets)) {
    if (lowerSeed.includes(category) || category.includes(lowerSeed)) {
      return data.map(item => ({ ...item, platform }))
    }
  }
  
  // Fallback to generic results based on seed
  return [
    {
      id: `${seed}-1`,
      keyword: `${seed} tips`,
      volume: Math.floor(Math.random() * 50000) + 5000,
      cpc: Math.round((Math.random() * 10 + 1) * 100) / 100,
      competition: Math.round(Math.random() * 100) / 100,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 50),
      platform,
    },
    {
      id: `${seed}-2`,
      keyword: `best ${seed}`,
      volume: Math.floor(Math.random() * 40000) + 8000,
      cpc: Math.round((Math.random() * 15 + 2) * 100) / 100,
      competition: Math.round(Math.random() * 100) / 100,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 60),
      platform,
    },
    {
      id: `${seed}-3`,
      keyword: `${seed} guide`,
      volume: Math.floor(Math.random() * 30000) + 3000,
      cpc: Math.round((Math.random() * 8 + 1.5) * 100) / 100,
      competition: Math.round(Math.random() * 100) / 100,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 40),
      platform,
    },
    {
      id: `${seed}-4`,
      keyword: `how to ${seed}`,
      volume: Math.floor(Math.random() * 25000) + 4000,
      cpc: Math.round((Math.random() * 6 + 1) * 100) / 100,
      competition: Math.round(Math.random() * 100) / 100,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 55),
      platform,
    },
    {
      id: `${seed}-5`,
      keyword: `${seed} review`,
      volume: Math.floor(Math.random() * 20000) + 2000,
      cpc: Math.round((Math.random() * 12 + 2) * 100) / 100,
      competition: Math.round(Math.random() * 100) / 100,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 45),
      platform,
    },
  ]
}

// Main Page Component
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
  const [showExportModal, setShowExportModal] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setSearchParams(params)

    // Simulate API call delay
    setTimeout(() => {
      const mockResults = getMockDataForKeyword(params.seed, params.platform)
      setResults(mockResults)
      setIsLoading(false)
    }, 1000)
  }

  const addToBasket = (keyword: KeywordData) => {
    if (!basket.find((item) => item.id === keyword.id)) {
      setBasket([...basket, keyword])
    }
  }

  const removeFromBasket = (keywordId: string) => {
    setBasket(basket.filter((item) => item.id !== keywordId))
  }

  const clearBasket = () => {
    setBasket([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyword Research Tool</h1>
          <p className="text-gray-600">Discover high-performing keywords across multiple platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">Keyword Research</TabsTrigger>
                <TabsTrigger value="competitor">Competitor Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-6">
                <Card className="p-6">
                  <SearchInterface onSearch={handleSearch} isLoading={isLoading} searchParams={searchParams} />
                </Card>

                {results.length > 0 && (
                  <Card className="p-6">
                    <ResultsTable results={results} onAddToBasket={addToBasket} basket={basket} />
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="competitor">
                <Card className="p-6">
                  <CompetitorAnalysis onAddToBasket={addToBasket} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <KeywordBasket
              basket={basket}
              onRemove={removeFromBasket}
              onClear={clearBasket}
              onExport={() => setShowExportModal(true)}
            />
          </div>
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} data={basket} />
    </div>
  )
}
