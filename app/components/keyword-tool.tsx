"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Loader2, Plus, Copy, ArrowUpDown, Trash2, Download, X, ExternalLink, TrendingUp, CheckCircle, Globe, Key, Play, Clock, Info } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const endpoints = [
  {
    id: "search-volume",
    name: "Search Volume",
    icon: Search,
    description: "Get search volume, trends, and competition data for keywords",
    path: "/api/keywords/search_volume",
  },
  {
    id: "keywords-for-site",
    name: "Keywords For Site",
    icon: Globe,
    description: "Generate keyword ideas for a domain or URL",
    path: "/api/keywords/keywords_for_site",
  },
  {
    id: "keywords-for-keywords",
    name: "Keywords For Keywords",
    icon: Key,
    description: "Generate keyword ideas based on seed keywords",
    path: "/api/keywords/keywords_for_keywords",
  },
  {
    id: "ad-traffic",
    name: "Ad Traffic By Keywords",
    icon: TrendingUp,
    description: "Estimate ad performance metrics for keywords in the next month",
    path: "/api/keywords/ad_traffic",
  },
  {
    id: "bing-url-suggestions",
    name: "Bing Keyword Suggestions for URL",
    icon: Globe,
    description: "Get Bing Ads keyword suggestions for a webpage URL",
    path: "/api/keywords/bing/url-suggestions",
  },
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

// Add this mapping at the top, after imports
const countryToLocationCode = {
  "Afghanistan": 2004,
  "Albania": 2008,
  "Algeria": 2012,
  "American Samoa": 2016,
  "Andorra": 2020,
  "Angola": 2024,
  "Anguilla": 2660,
  "Antarctica": 2010,
  "Antigua and Barbuda": 2028,
  "Argentina": 2032,
  "Armenia": 2051,
  "Aruba": 2533,
  "Australia": 2036,
  "Austria": 2040,
  "Azerbaijan": 2031,
  "Bahrain": 2048,
  "Bangladesh": 2050,
  "Barbados": 2052,
  "Belgium": 2056,
  "Belize": 2084,
  "Benin": 2204,
  "Bermuda": 2060,
  "Bhutan": 2064,
  "Bolivia": 2068,
  "Bosnia and Herzegovina": 2070,
  "Botswana": 2072,
  "Bouvet Island": 2074,
  "Brazil": 2076,
  "British Indian Ocean Territory": 2086,
  "British Virgin Islands": 2092,
  "Brunei": 2096,
  "Bulgaria": 2100,
  "Burkina Faso": 2854,
  "Burundi": 2108,
  "Cabo Verde": 2132,
  "Cambodia": 2116,
  "Cameroon": 2120,
  "Canada": 2124,
  "Caribbean Netherlands": 2535,
  "Cayman Islands": 2136,
  "Central African Republic": 2140,
  "Chad": 2148,
  "Chile": 2152,
  "China": 2156,
  "Christmas Island": 2162,
  "Cocos (Keeling) Islands": 2166,
  "Colombia": 2170,
  "Comoros": 2174,
  "Cook Islands": 2184,
  "Costa Rica": 2188,
  "Cote d'Ivoire": 2384,
  "Croatia": 2191,
  "Curacao": 2531,
  "Cyprus": 2196,
  "Czechia": 2203,
  "Democratic Republic of the Congo": 2180,
  "Denmark": 2208,
  "Djibouti": 2262,
  "Dominica": 2212,
  "Dominican Republic": 2214,
  "Ecuador": 2218,
  "Egypt": 2818,
  "El Salvador": 2222,
  "Equatorial Guinea": 2226,
  "Eritrea": 2232,
  "Estonia": 2233,
  "Eswatini": 2748,
  "Ethiopia": 2231,
  "Falkland Islands (Islas Malvinas)": 2238,
  "Faroe Islands": 2234,
  "Fiji": 2242,
  "Finland": 2246,
  "France": 2250,
  "French Guiana": 2254,
  "French Polynesia": 2258,
  "French Southern and Antarctic Lands": 2260,
  "Gabon": 2266,
  "Georgia": 2268,
  "Germany": 2276,
  "Ghana": 2288,
  "Gibraltar": 2292,
  "Greece": 2300,
  "Greenland": 2304,
  "Grenada": 2308,
  "Guadeloupe": 2312,
  "Guam": 2316,
  "Guatemala": 2320,
  "Guernsey": 2831,
  "Guinea": 2324,
  "Guinea-Bissau": 2624,
  "Guyana": 2328,
  "Haiti": 2332,
  "Heard Island and McDonald Islands": 2334,
  "Honduras": 2340,
  "Hong Kong": 2344,
  "Hungary": 2348,
  "Iceland": 2352,
  "India": 2356,
  "Indonesia": 2360,
  "Iraq": 2368,
  "Ireland": 2372,
  "Isle of Man": 2833,
  "Israel": 2376,
  "Italy": 2380,
  "Jamaica": 2388,
  "Japan": 2392,
  "Jersey": 2832,
  "Jordan": 2400,
  "Kazakhstan": 2398,
  "Kenya": 2404,
  "Kiribati": 2296,
  "Kuwait": 2414,
  "Kyrgyzstan": 2417,
  "Laos": 2418,
  "Latvia": 2428,
  "Lebanon": 2422,
  "Lesotho": 2426,
  "Liberia": 2430,
  "Libya": 2434,
  "Liechtenstein": 2438,
  "Lithuania": 2440,
  "Luxembourg": 2442,
  "Macao": 2446,
  "Madagascar": 2450,
  "Malawi": 2454,
  "Malaysia": 2458,
  "Maldives": 2462,
  "Mali": 2466,
  "Malta": 2470,
  "Marshall Islands": 2584,
  "Martinique": 2474,
  "Mauritania": 2478,
  "Mauritius": 2480,
  "Mayotte": 2175,
  "Mexico": 2484,
  "Micronesia": 2583,
  "Moldova": 2498,
  "Monaco": 2492,
  "Mongolia": 2496,
  "Montenegro": 2499,
  "Montserrat": 2500,
  "Morocco": 2504,
  "Mozambique": 2508,
  "Myanmar (Burma)": 2104,
  "Namibia": 2516,
  "Nauru": 2520,
  "Nepal": 2524,
  "Netherlands": 2528,
  "New Caledonia": 2540,
  "New Zealand": 2554,
  "Nicaragua": 2558,
  "Niger": 2562,
  "Nigeria": 2566,
  "Niue": 2570,
  "Norfolk Island": 2574,
  "North Macedonia": 2807,
  "Northern Mariana Islands": 2580,
  "Norway": 2578,
  "Oman": 2512,
  "Pakistan": 2586,
  "Palau": 2585,
  "Palestine": 2275,
  "Panama": 2591,
  "Papua New Guinea": 2598,
  "Paraguay": 2600,
  "Peru": 2604,
  "Philippines": 2608,
  "Pitcairn Islands": 2612,
  "Poland": 2616,
  "Portugal": 2620,
  "Puerto Rico": 2630,
  "Qatar": 2634,
  "Republic of the Congo": 2178,
  "Reunion": 2638,
  "Romania": 2642,
  "Rwanda": 2646,
  "Saint Barthelemy": 2652,
  "Saint Helena, Ascension and Tristan da Cunha": 2654,
  "Saint Kitts and Nevis": 2659,
  "Saint Lucia": 2662,
  "Saint Martin": 2663,
  "Saint Pierre and Miquelon": 2666,
  "Saint Vincent and the Grenadines": 2670,
  "Samoa": 2882,
  "San Marino": 2674,
  "Sao Tome and Principe": 2678,
  "Saudi Arabia": 2682,
  "Senegal": 2686,
  "Serbia": 2688,
  "Seychelles": 2690,
  "Sierra Leone": 2694,
  "Singapore": 2702,
  "Sint Maarten": 2534,
  "Slovakia": 2703,
  "Slovenia": 2705,
  "Solomon Islands": 2090,
  "Somalia": 2706,
  "South Africa": 2710,
  "South Georgia and the South Sandwich Islands": 2239,
  "South Korea": 2410,
  "South Sudan": 2728,
  // ... (rest of the mapping from app/keywords/page.tsx) ...
}

// Main Keyword Tool Component
interface KeywordToolProps {
  onComplete?: (basket: KeywordData[]) => void;
  initialSeed?: string;
  initialBasket?: KeywordData[];
}

const KeywordTool: React.FC<KeywordToolProps> = ({ onComplete, initialSeed = "", initialBasket = [] }) => {
  // Endpoint selection and form state
  const [activeEndpoint, setActiveEndpoint] = useState("search-volume")
  const [method, setMethod] = useState<"live" | "standard">("live")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState("")
  // Form states
  const [keywords, setKeywords] = useState(initialSeed)
  const [locationCode, setLocationCode] = useState("2840")
  const [languageCode, setLanguageCode] = useState("en")
  const [target, setTarget] = useState(initialSeed)
  const [bid, setBid] = useState("999")
  const [match, setMatch] = useState("exact")
  // Bing
  const [bingUrl, setBingUrl] = useState(initialSeed)
  const [bingLang, setBingLang] = useState("en")
  const [bingExcludeBrands, setBingExcludeBrands] = useState(false)
  const [bingLoading, setBingLoading] = useState(false)
  const [bingResults, setBingResults] = useState<any>(null)
  const [bingError, setBingError] = useState<string | null>(null)
  // Basket for keyword endpoints
  const [basket, setBasket] = useState<KeywordData[]>(initialBasket)

  // --- API Handlers ---
  const handleSubmit = async () => {
    const currentEndpoint = endpoints.find((e) => e.id === activeEndpoint)
    if (!currentEndpoint) return
    setLoading(true)
    setResults(null)
    setError(null)
    setTaskId("")
    const requestData: any = {
      method: method,
      location_code: Number.parseInt(locationCode),
      language_code: languageCode,
      tag: `frontend-ui-task-${Date.now()}`
    }
    const keywordsList = keywords.split("\n").map((k) => k.trim()).filter((k) => k)
    switch (activeEndpoint) {
      case "search-volume":
        requestData.keywords = keywordsList
        requestData.search_partners = true
        break
      case "keywords-for-site":
        requestData.target = target
        requestData.target_type = "site"
        break
      case "keywords-for-keywords":
        requestData.keywords = keywordsList.slice(0, 20)
        break
      case "ad-traffic":
        requestData.keywords = keywordsList
        requestData.bid = Number.parseInt(bid)
        requestData.match = match
        requestData.date_interval = "next_month"
        break
    }
    try {
      const response = await fetch(`${API_BASE_URL}${currentEndpoint.path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.detail || "An unknown error occurred.")
      setResults(responseData)
      if (method === "standard" && responseData.tasks?.[0]?.id) {
        setTaskId(responseData.tasks[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBingLoading(true)
    setBingResults(null)
    setBingError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/keywords/bing/url-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: bingUrl,
          language_code: bingLang,
          exclude_brands: bingExcludeBrands,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Unknown error")
      setBingResults(data.tasks?.[0]?.result || [])
    } catch (err: any) {
      setBingError(err.message)
    } finally {
      setBingLoading(false)
    }
  }

  // --- Basket logic for endpoints that return keyword lists ---
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
  const handleContinue = () => {
    if (onComplete) {
      onComplete(basket)
    }
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Top bar with Next button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              console.log('Next button clicked', { basket, activeEndpoint });
              handleContinue();
            }}
            // disabled={
            //   (activeEndpoint === "search-volume" || activeEndpoint === "keywords-for-site" || activeEndpoint === "keywords-for-keywords" || activeEndpoint === "bing-url-suggestions")
            //     ? basket.length === 0
            //     : false
            // }
          >
            Next
          </Button>
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {endpoints.map((endpoint) => (
                  <Button
                    key={endpoint.id}
                    variant={activeEndpoint === endpoint.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveEndpoint(endpoint.id)
                      setResults(null)
                      setError(null)
                    }}
                  >
                    {endpoint.icon && <endpoint.icon className="h-4 w-4 mr-2" />}
                    {endpoint.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
                </div>
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dynamic Form */}
            {activeEndpoint === "bing-url-suggestions" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Bing Ads Keyword Suggestions for URL</CardTitle>
                  <CardDescription>
                    Get keyword suggestions from Bing Ads based on a webpage URL. Enter a URL and language code.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="bing-url">Target URL</Label>
                      <Input
                        id="bing-url"
                        value={bingUrl}
                        onChange={e => setBingUrl(e.target.value)}
                        placeholder="e.g. dataforseo.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bing-lang">Language Code</Label>
                      <Input
                        id="bing-lang"
                        value={bingLang}
                        onChange={e => setBingLang(e.target.value)}
                        placeholder="e.g. en"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="bing-exclude-brands"
                        type="checkbox"
                        checked={bingExcludeBrands}
                        onChange={e => setBingExcludeBrands(e.target.checked)}
                      />
                      <Label htmlFor="bing-exclude-brands">Exclude Brand Keywords</Label>
                    </div>
                    {bingError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{bingError}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" disabled={bingLoading} className="w-full">
                      {bingLoading ? "Processing..." : "Get Bing Keyword Suggestions"}
                    </Button>
                  </form>
                  {/* Results */}
                  {bingResults && bingResults.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Keyword Suggestions</h4>
                      <div className="space-y-2">
                        {bingResults.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <span>{item.keyword}</span>
                            <span className="text-sm text-muted-foreground">Confidence: {item.confidence_score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {endpoints.find(e => e.id === activeEndpoint)?.icon &&
                      React.createElement(endpoints.find(e => e.id === activeEndpoint)!.icon, { className: "h-5 w-5" })}
                    {endpoints.find(e => e.id === activeEndpoint)?.name}
                  </CardTitle>
                  {activeEndpoint !== "ad-traffic" && (
                    <CardDescription>{endpoints.find(e => e.id === activeEndpoint)?.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeEndpoint === "ad-traffic" && (
                    <div className="mb-2 text-sm text-muted-foreground flex items-center gap-1">
                      Estimate ad performance metrics for keywords in the next month
                      <a
                        href="https://docs.dataforseo.com/v3/keywords_data/google_ads/ad_traffic_by_keywords/live/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline text-blue-600 hover:text-blue-800"
                        style={{ fontSize: '0.85em', verticalAlign: 'super' }}
                      >
                        [ref]
                      </a>
            </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Country</Label>
                      <Select value={locationCode} onValueChange={setLocationCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(countryToLocationCode).map(([country, code]) => (
                            <SelectItem key={code} value={code.toString()}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language Code</Label>
                      <Input
                        id="language"
                        value={languageCode}
                        onChange={(e) => setLanguageCode(e.target.value)}
                        placeholder="en"
                      />
                    </div>
                  </div>
                  {activeEndpoint === "keywords-for-site" && (
                    <div>
                      <Label htmlFor="target">Target Domain/URL</Label>
                      <Input
                        id="target"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="dataforseo.com"
                      />
                    </div>
                  )}
                  {(activeEndpoint === "search-volume" ||
                    activeEndpoint === "keywords-for-keywords" ||
                    activeEndpoint === "ad-traffic") && (
                    <div>
                      <Label htmlFor="keywords">Keywords (one per line)</Label>
                      <Textarea
                        id="keywords"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Enter keywords, one per line"
                        rows={4}
                      />
                    </div>
                  )}
                  {activeEndpoint === "ad-traffic" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bid">Bid Amount</Label>
                        <Input id="bid" value={bid} onChange={(e) => setBid(e.target.value)} placeholder="999" />
                      </div>
                      <div>
                        <Label htmlFor="match">Match Type</Label>
                        <Select value={match} onValueChange={setMatch}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exact">Exact</SelectItem>
                            <SelectItem value="phrase">Phrase</SelectItem>
                            <SelectItem value="broad">Broad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Label>Method:</Label>
                    <div className="flex gap-2">
                      <Button variant={method === "live" ? "default" : "outline"} size="sm" onClick={() => setMethod("live")}> <Play className="h-4 w-4 mr-1" /> Live </Button>
                      <Button variant={method === "standard" ? "default" : "outline"} size="sm" onClick={() => setMethod("standard")}> <Clock className="h-4 w-4 mr-1" /> Standard </Button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? "Processing..." : "Execute API Call"}
                  </Button>
                </CardContent>
              </Card>
            )}
            {/* Results */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    API Response
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Status: {results.status_code} ({results.status_message})</span>
                    <span>Cost: ${results.cost?.toFixed(4) || '0.0000'}</span>
                    <span>Results: {results.tasks?.[0]?.result?.length || 0}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {taskId && (
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Standard Task Submitted</AlertTitle>
                      <AlertDescription>
                        Your task has been created with ID: <code className="font-mono bg-muted p-1 rounded">{taskId}</code>.
                        Use the Standard Method Workflow steps to retrieve your results.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Tabs defaultValue="formatted">
                    <TabsList>
                      <TabsTrigger value="formatted">Formatted Results</TabsTrigger>
                      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="formatted" className="space-y-4">
                      {/* Render formatted results for each endpoint */}
                      {/* You can add basket logic for endpoints that return keyword lists */}
                      {/* ... (see /keywords/page.tsx for details) ... */}
                    </TabsContent>
                    <TabsContent value="raw">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 z-10 bg-transparent"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <ScrollArea className="h-96">
                          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            {/* Basket and Continue button for keyword endpoints */}
            {(activeEndpoint === "search-volume" || activeEndpoint === "keywords-for-site" || activeEndpoint === "keywords-for-keywords" || activeEndpoint === "bing-url-suggestions") && basket.length > 0 && (
              <div className="mt-6">
              <KeywordBasket
                basket={basket}
                onRemove={handleRemoveFromBasket}
                onClear={handleClearBasket}
                onExport={handleExportBasket}
              />
              <Button className="w-full mt-4" onClick={handleContinue} disabled={basket.length === 0}>
                Continue to Chat
              </Button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeywordTool
