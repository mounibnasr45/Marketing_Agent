"use client"

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Code,
  Globe,
  Clock,
  MousePointer,
  Search,
  Building,
  Eye,
  Target,
  Award,
  BarChart3,
  MessageCircle,
} from "lucide-react"

interface SimilarWebResultsProps {
  domain: string
  competitors: string[]
  onSwitchToBuiltWith: () => void
  onSwitchToChat: () => void
  onBackToSearch: () => void
  onAnalysisComplete?: (data: any) => void
  showNextButton?: boolean
  apiData?: any
}

// Simplified mock data
const mockData = {
  globalRank: 27,
  monthlyVisits: "2.5B",
  avgDuration: "8:45",
  bounceRate: "35%",
  companyName: "LinkedIn Corporation",
  founded: 2003,
  employees: "10K-50K",
  trafficSources: [
    { name: "Direct", percentage: 45, color: "bg-blue-500" },
    { name: "Organic Search", percentage: 35, color: "bg-green-500" },
    { name: "Referrals", percentage: 10, color: "bg-purple-500" },
    { name: "Social", percentage: 5, color: "bg-pink-500" },
    { name: "Other", percentage: 5, color: "bg-gray-500" },
  ],
  topCountries: [
    { name: "United States", flag: "🇺🇸", percentage: 42 },
    { name: "India", flag: "🇮🇳", percentage: 15 },
    { name: "United Kingdom", flag: "🇬🇧", percentage: 8 },
    { name: "Brazil", flag: "🇧🇷", percentage: 6 },
    { name: "Canada", flag: "🇨🇦", percentage: 4 },
  ],
  topKeywords: [
    { keyword: "linkedin", volume: "50M", value: "$45M" },
    { keyword: "linkedin login", volume: "25M", value: "$20M" },
    { keyword: "jobs", volume: "15M", value: "$12M" },
    { keyword: "linkedin profile", volume: "8M", value: "$6M" },
    { keyword: "career", volume: "5M", value: "$4M" },
  ],
  competitors: [
    { domain: "indeed.com", visits: "1.8B", similarity: "85%" },
    { domain: "glassdoor.com", visits: "500M", similarity: "75%" },
    { domain: "monster.com", visits: "300M", similarity: "65%" },
    { domain: "ziprecruiter.com", visits: "250M", similarity: "60%" },
  ],
}

export default function SimilarWebResults({
  domain,
  competitors,
  onSwitchToBuiltWith,
  onSwitchToChat,
  onBackToSearch,
  onAnalysisComplete,
  showNextButton = false,
  apiData,
}: SimilarWebResultsProps) {
  // Use API data if available, otherwise fall back to mock data
  const websiteData = apiData?.data?.[0] || mockData
  
  // Transform API data to match component expectations
  const displayData = {
    globalRank: websiteData.globalRank || mockData.globalRank,
    monthlyVisits: websiteData.totalVisits ? 
      (websiteData.totalVisits > 1000000000 ? 
        `${(websiteData.totalVisits / 1000000000).toFixed(1)}B` : 
        `${(websiteData.totalVisits / 1000000).toFixed(0)}M`) : 
      mockData.monthlyVisits,
    avgDuration: websiteData.avgVisitDuration || mockData.avgDuration,
    bounceRate: websiteData.bounceRate ? `${(websiteData.bounceRate * 100).toFixed(0)}%` : mockData.bounceRate,
    companyName: websiteData.companyName || mockData.companyName,
    founded: websiteData.companyYearFounded || mockData.founded,
    employees: websiteData.companyEmployeesMin && websiteData.companyEmployeesMax ? 
      `${websiteData.companyEmployeesMin}-${websiteData.companyEmployeesMax}` :
      websiteData.companyEmployeesMin ? `${websiteData.companyEmployeesMin}+` :
      mockData.employees,
    trafficSources: websiteData.trafficSources ? [
      { name: "Direct", percentage: Math.round(websiteData.trafficSources.directVisitsShare * 100), color: "bg-blue-500" },
      { name: "Organic Search", percentage: Math.round(websiteData.trafficSources.organicSearchVisitsShare * 100), color: "bg-green-500" },
      { name: "Referrals", percentage: Math.round(websiteData.trafficSources.referralVisitsShare * 100), color: "bg-purple-500" },
      { name: "Social", percentage: Math.round(websiteData.trafficSources.socialNetworksVisitsShare * 100), color: "bg-pink-500" },
      { name: "Other", percentage: Math.round((websiteData.trafficSources.mailVisitsShare + websiteData.trafficSources.paidSearchVisitsShare + websiteData.trafficSources.adsVisitsShare) * 100), color: "bg-gray-500" },
    ] : mockData.trafficSources,
    topCountries: websiteData.topCountries?.slice(0, 5).map((country: any) => ({
      name: country.countryAlpha2Code === "US" ? "United States" :
            country.countryAlpha2Code === "IN" ? "India" :
            country.countryAlpha2Code === "GB" ? "United Kingdom" :
            country.countryAlpha2Code === "BR" ? "Brazil" :
            country.countryAlpha2Code === "CA" ? "Canada" :
            country.countryAlpha2Code,
      flag: country.countryAlpha2Code === "US" ? "🇺🇸" :
            country.countryAlpha2Code === "IN" ? "🇮🇳" :
            country.countryAlpha2Code === "GB" ? "🇬🇧" :
            country.countryAlpha2Code === "BR" ? "🇧🇷" :
            country.countryAlpha2Code === "CA" ? "🇨🇦" : "🌍",
      percentage: Math.round(country.visitsShare * 100)
    })) || mockData.topCountries,
    topKeywords: websiteData.topKeywords?.slice(0, 5).map((keyword: any) => ({
      keyword: keyword.name,
      volume: keyword.volume > 1000000 ? `${(keyword.volume / 1000000).toFixed(0)}M` : `${(keyword.volume / 1000).toFixed(0)}K`,
      value: `$${keyword.estimatedValue > 1000000 ? (keyword.estimatedValue / 1000000).toFixed(0) + 'M' : (keyword.estimatedValue / 1000).toFixed(0) + 'K'}`
    })) || mockData.topKeywords,
    competitors: websiteData.topSimilarityCompetitors?.slice(0, 4).map((comp: any) => ({
      domain: comp.domain,
      visits: comp.visitsTotalCount > 1000000000 ? 
        `${(comp.visitsTotalCount / 1000000000).toFixed(1)}B` : 
        `${(comp.visitsTotalCount / 1000000).toFixed(0)}M`,
      similarity: `${Math.round(comp.affinity * 100)}%`
    })) || mockData.competitors,
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Simple Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToSearch} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Traffic Analysis</h1>
              <p className="text-gray-600">{domain}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSwitchToChat} size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
            <Button onClick={onSwitchToBuiltWith} variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              Tech Stack
            </Button>
          </div>
        </div>

        {/* Key Metrics - Simple Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">#{displayData.globalRank}</div>
              <div className="text-sm text-gray-600">Global Rank</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{displayData.monthlyVisits}</div>
              <div className="text-sm text-gray-600">Monthly Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{displayData.avgDuration}</div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MousePointer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{displayData.bounceRate}</div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Company Info - Simple */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Company</div>
                <div className="font-semibold">{displayData.companyName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Founded</div>
                <div className="font-semibold">{displayData.founded}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Employees</div>
                <div className="font-semibold">{displayData.employees}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources - Simple */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData.trafficSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{source.percentage}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${source.color}`}
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries - Simple */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.topCountries.map((country: any) => (
                  <div key={country.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{country.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Keywords - Simple */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Top Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.topKeywords.map((keyword: any, index: any) => (
                  <div key={keyword.keyword} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{keyword.keyword}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">{keyword.volume}</div>
                      <div className="text-gray-500">{keyword.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitors - Simple */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Competitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayData.competitors.map((competitor: any, index: any) => (
                <div key={competitor.domain} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <span className="font-semibold">{competitor.domain}</span>
                    </div>
                    <Badge variant="secondary">{competitor.similarity}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{competitor.visits}</span> monthly visits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section - Simple */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready for Technology Analysis?</h3>
                <p className="text-blue-700">
                  Discover the technology stack behind {domain} and {competitors.length} competitors.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSwitchToChat} variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
                <Button onClick={onSwitchToBuiltWith}>
                  <Code className="h-4 w-4 mr-2" />
                  Analyze Tech Stack
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
