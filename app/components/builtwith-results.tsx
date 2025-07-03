"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  BarChart3,
  Code,
  Server,
  Globe,
  Database,
  Cloud,
  Cpu,
  Search,
  Filter,
  Crown,
  Users,
  MessageCircle,
  Target,
} from "lucide-react"

interface BuiltWithResultsProps {
  domain: string
  competitors: string[]
  onSwitchToSimilarWeb: () => void
  onSwitchToChat: () => void
  onBackToSearch: () => void
  apiData?: any
}

interface Technology {
  name: string
  category: string
  version: string
  popularity: number
}

interface DomainData {
  domain: string
  isMain: boolean
  techScore: number
  technologies: Technology[]
}

// Simplified mock data
const mockDomains: DomainData[] = [
  {
    domain: "linkedin.com",
    isMain: true,
    techScore: 88,
    technologies: [
      { name: "React", category: "JavaScript Framework", version: "18.2.0", popularity: 88 },
      { name: "Node.js", category: "Runtime", version: "18.17.0", popularity: 82 },
      { name: "Nginx", category: "Web Server", version: "1.21.1", popularity: 85 },
      { name: "AWS", category: "Cloud Provider", version: "N/A", popularity: 75 },
      { name: "Google Analytics", category: "Analytics", version: "GA4", popularity: 95 },
    ],
  },
  {
    domain: "indeed.com",
    isMain: false,
    techScore: 72,
    technologies: [
      { name: "Java", category: "Programming Language", version: "17", popularity: 70 },
      { name: "Spring", category: "Framework", version: "6.0.0", popularity: 65 },
      { name: "Apache Tomcat", category: "Web Server", version: "10.1.0", popularity: 60 },
      { name: "MySQL", category: "Database", version: "8.0.33", popularity: 73 },
      { name: "Google Analytics", category: "Analytics", version: "GA4", popularity: 95 },
    ],
  },
  {
    domain: "glassdoor.com",
    isMain: false,
    techScore: 79,
    technologies: [
      { name: "Angular", category: "JavaScript Framework", version: "16.0.0", popularity: 72 },
      { name: "TypeScript", category: "Programming Language", version: "5.1.0", popularity: 80 },
      { name: "MongoDB", category: "Database", version: "7.0.0", popularity: 68 },
      { name: "Nginx", category: "Web Server", version: "1.21.1", popularity: 85 },
      { name: "Google Analytics", category: "Analytics", version: "GA4", popularity: 95 },
    ],
  },
  {
    domain: "monster.com",
    isMain: false,
    techScore: 65,
    technologies: [
      { name: "Vue.js", category: "JavaScript Framework", version: "3.3.0", popularity: 58 },
      { name: "PHP", category: "Programming Language", version: "8.2.0", popularity: 55 },
      { name: "MySQL", category: "Database", version: "8.0.33", popularity: 73 },
      { name: "Apache", category: "Web Server", version: "2.4.57", popularity: 50 },
      { name: "Google Analytics", category: "Analytics", version: "GA4", popularity: 95 },
    ],
  },
  {
    domain: "ziprecruiter.com",
    isMain: false,
    techScore: 81,
    technologies: [
      { name: "Python", category: "Programming Language", version: "3.11.0", popularity: 77 },
      { name: "Django", category: "Framework", version: "4.2.0", popularity: 62 },
      { name: "PostgreSQL", category: "Database", version: "15.3", popularity: 71 },
      { name: "Nginx", category: "Web Server", version: "1.21.1", popularity: 85 },
      { name: "Google Analytics", category: "Analytics", version: "GA4", popularity: 95 },
    ],
  },
]

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    "JavaScript Framework": Code,
    "Programming Language": Cpu,
    Runtime: Server,
    "Web Server": Server,
    "Cloud Provider": Cloud,
    Analytics: BarChart3,
    Framework: Code,
    Database: Database,
  }
  const Icon = icons[category] || Globe
  return <Icon className="h-4 w-4" />
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "JavaScript Framework": "bg-yellow-100 text-yellow-800",
    "Programming Language": "bg-blue-100 text-blue-800",
    Runtime: "bg-green-100 text-green-800",
    "Web Server": "bg-purple-100 text-purple-800",
    "Cloud Provider": "bg-indigo-100 text-indigo-800",
    Analytics: "bg-pink-100 text-pink-800",
    Framework: "bg-orange-100 text-orange-800",
    Database: "bg-teal-100 text-teal-800",
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

export default function BuiltWithResults({
  domain,
  competitors,
  onSwitchToSimilarWeb,
  onSwitchToChat,
  onBackToSearch,
  apiData,
}: BuiltWithResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Use API data if available, otherwise fall back to mock data
  const domainData = apiData?.data || mockDomains
  
  // Transform API data to match component expectations
  const transformedDomains = domainData.map((website: any, index: number) => {
    // Check if this is API data (has builtwith_result) or mock data
    if (website.builtwith_result) {
      return {
        domain: website.builtwith_result.domain || website.name?.toLowerCase().replace(' ', '') + '.com',
        isMain: index === 0, // First domain is the main one
        techScore: Math.min(95, Math.max(60, (website.builtwith_result.technologies?.length || 5) * 12)), // Calculate score based on tech count
        technologies: website.builtwith_result.technologies?.map((tech: any) => ({
          name: tech.name,
          category: tech.tag,
          version: tech.version || "N/A",
          popularity: tech.popularity || Math.floor(Math.random() * 40) + 60 // Random popularity if not provided
        })) || []
      }
    }
    // Return mock data as-is
    return website
  })

  const allDomains = transformedDomains.length > 0 ? transformedDomains : mockDomains
  
  // Get all technologies and categories
  const allTechnologies = allDomains.flatMap((d: any) => d.technologies)
  const allCategories = [...new Set(allTechnologies.map((t: any) => t.category))]

  // Count technology usage
  const techUsage = allTechnologies.reduce(
    (acc: any, tech: any) => {
      acc[tech.name] = (acc[tech.name] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const popularTechs = Object.entries(techUsage)
    .filter(([_, count]) => (count as number) > 1)
    .sort(([_, a], [__, b]) => (b as number) - (a as number))

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
              <h1 className="text-2xl font-bold text-gray-900">Technology Analysis</h1>
              <p className="text-gray-600">
                {domain} vs {competitors.length} competitors
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSwitchToChat} size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
            <Button onClick={onSwitchToSimilarWeb} variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Traffic Data
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{mockDomains.length}</div>
              <div className="text-sm text-gray-600">Websites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Code className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{allTechnologies.length}</div>
              <div className="text-sm text-gray-600">Technologies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{popularTechs.length}</div>
              <div className="text-sm text-gray-600">Shared Tech</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">A+</div>
              <div className="text-sm text-gray-600">Analysis</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((cat: any) => (
                    <SelectItem key={cat as string} value={cat as string}>
                      {cat as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Popular Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularTechs.map(([techName, count]) => {
                const tech = allTechnologies.find((t: any) => t.name === techName)!
                const percentage = ((count as number) / allDomains.length) * 100
                return (
                  <div key={techName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(tech.category)}
                      <div>
                        <div className="font-semibold">{techName}</div>
                        <Badge variant="secondary" className={getCategoryColor(tech.category)}>
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {count as number}/{allDomains.length} sites
                      </div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(0)}% adoption</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Domain Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={domain} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                {allDomains.map((d: any) => (
                  <TabsTrigger key={d.domain} value={d.domain} className="text-xs">
                    {d.isMain && <Crown className="h-3 w-3 mr-1" />}
                    {d.domain.replace(".com", "")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {allDomains.map((domainData: any) => (
                <TabsContent key={domainData.domain} value={domainData.domain} className="space-y-4">
                  {/* Domain Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{domainData.domain}</h3>
                        {domainData.isMain && <Badge className="bg-green-100 text-green-800">Your Domain</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{domainData.techScore}</div>
                      <div className="text-sm text-gray-600">Tech Score</div>
                    </div>
                  </div>

                  {/* Technologies List */}
                  <div className="space-y-2">
                    {domainData.technologies.map((tech: any) => (
                      <div key={tech.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(tech.category)}
                          <div>
                            <div className="font-semibold">{tech.name}</div>
                            <div className="text-sm text-gray-500">v{tech.version}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getCategoryColor(tech.category)}>
                            {tech.category}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{tech.popularity}%</div>
                            <div className="text-xs text-gray-500">popularity</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Get AI-Powered Insights</h3>
                <p className="text-green-700">
                  Ask our AI assistant about technology comparisons and strategic recommendations.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSwitchToSimilarWeb} variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Traffic Data
                </Button>
                <Button onClick={onSwitchToChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
