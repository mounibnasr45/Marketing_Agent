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
  domain: "linkedin.com",
  monthlyVisits: "1.8B",
  averageVisitDuration: "8:45",
  pagesPerVisit: 4.2,
  bounceRate: "35%",
  rank: {
    global: 12,
    category: 1,
    country: 8,
  },
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
    { name: "Canada", flag: "🇨🇦", percentage: 6 },
    { name: "Brazil", flag: "🇧🇷", percentage: 5 },
  ],
  competitors: [
    { domain: "indeed.com", similarity: 92, visits: "1.2B" },
    { domain: "glassdoor.com", similarity: 88, visits: "500M" },
    { domain: "monster.com", similarity: 85, visits: "300M" },
    { domain: "ziprecruiter.com", similarity: 82, visits: "250M" },
  ],
  categories: [
    { name: "Jobs and Career", rank: 1 },
    { name: "Professional Networks", rank: 2 },
    { name: "Business and Industry", rank: 3 },
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
  const websiteData = apiData?.data || mockData

  // Extract competitors from the analysis for the flow
  const extractedCompetitors = websiteData?.competitors?.map((comp: any) => comp.domain) || 
                             mockData.competitors.map((comp: any) => comp.domain)

  // Handle analysis completion for the flow
  const handleContinueToBuiltWith = () => {
    if (onAnalysisComplete) {
      onAnalysisComplete({
        domain: domain,
        competitors: extractedCompetitors,
        trafficData: websiteData,
        rawData: websiteData
      })
    } else {
      onSwitchToBuiltWith()
    }
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
              <p className="text-gray-600">
                {domain} performance overview
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {showNextButton ? (
              <Button onClick={handleContinueToBuiltWith} size="sm">
                <Code className="h-4 w-4 mr-2" />
                Continue to Tech Analysis
              </Button>
            ) : (
              <>
                <Button onClick={onSwitchToChat} size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
                <Button onClick={onSwitchToBuiltWith} variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  Tech Analysis
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{websiteData.monthlyVisits}</div>
              <div className="text-sm text-gray-600">Monthly Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{websiteData.averageVisitDuration}</div>
              <div className="text-sm text-gray-600">Avg. Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MousePointer className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{websiteData.pagesPerVisit}</div>
              <div className="text-sm text-gray-600">Pages/Visit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{websiteData.bounceRate}</div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Global Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">#{websiteData.rank.global}</div>
                <div className="text-sm text-gray-600">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">#{websiteData.rank.category}</div>
                <div className="text-sm text-gray-600">Category Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">#{websiteData.rank.country}</div>
                <div className="text-sm text-gray-600">Country Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {websiteData.trafficSources.map((source: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${source.color}`} />
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${source.color}`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[3rem]">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websiteData.topCountries.map((country: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[3rem]">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websiteData.competitors.map((competitor: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{competitor.domain}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold">{competitor.visits}</div>
                      <div className="text-xs text-gray-500">Monthly visits</div>
                    </div>
                    <Badge variant="secondary">{competitor.similarity}% similar</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Category Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websiteData.categories.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="outline">#{category.rank}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {showNextButton ? "Continue to Technology Analysis" : "Ready for Technology Analysis?"}
                </h3>
                <p className="text-blue-700">
                  {showNextButton 
                    ? "We found your competitors. Let's analyze the technology stack next."
                    : `Discover the technology stack behind ${domain} and ${extractedCompetitors.length} competitors.`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                {showNextButton ? (
                  <Button onClick={handleContinueToBuiltWith} size="lg">
                    <Code className="h-4 w-4 mr-2" />
                    Continue to Tech Analysis
                  </Button>
                ) : (
                  <>
                    <Button onClick={onSwitchToChat} variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                    <Button onClick={onSwitchToBuiltWith}>
                      <Code className="h-4 w-4 mr-2" />
                      Analyze Tech Stack
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
