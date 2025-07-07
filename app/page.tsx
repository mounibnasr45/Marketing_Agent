"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, BarChart3, Code, MessageCircle, TrendingUp, ArrowRight, Users, Search, Brain, Play } from "lucide-react"
import AnalysisFlow from "./components/analysis-flow"

export default function DashboardPage() {
  const [showAnalysisFlow, setShowAnalysisFlow] = useState(false)
  const [domain, setDomain] = useState("")

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setShowAnalysisFlow(false)
    setDomain("")
  }

  // If analysis flow is active, show it
  if (showAnalysisFlow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AnalysisFlow 
          domain={domain} 
          setDomain={setDomain}
        />
      </div>
    )
  }

  const features = [
    {
      id: 1,
      title: "SimilarWeb Analysis",
      description: "Analyze website traffic, engagement metrics, and competitive intelligence",
      icon: BarChart3,
      href: "/similarweb",
      color: "bg-blue-500",
      features: ["Traffic Analysis", "Audience Insights", "Competitive Analysis", "Market Share"]
    },
    {
      id: 2,
      title: "BuiltWith Analysis", 
      description: "Discover technologies, frameworks, and tools used by websites",
      icon: Code,
      href: "/builtwith",
      color: "bg-green-500",
      features: ["Tech Stack Detection", "CMS Analysis", "Framework Identification", "Tool Discovery"]
    },
    {
      id: 3,
      title: "Google Trends",
      description: "Analyze search trends and popularity patterns over time",
      icon: TrendingUp,
      href: "/google-trends",
      color: "bg-purple-500",
      features: ["Search Trends", "Geographic Data", "Related Queries", "Trend Analysis"]
    },
    {
      id: 4,
      title: "AI Chat Assistant",
      description: "Get insights and answers about your website analysis data",
      icon: MessageCircle,
      href: "/chat",
      color: "bg-orange-500",
      features: ["AI-Powered Insights", "Data Interpretation", "Recommendations", "Q&A Support"]
    }
  ]

  if (showAnalysisFlow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AnalysisFlow 
          domain={domain} 
          setDomain={setDomain}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Globe className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Website Analyzer</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive website analysis platform with traffic insights, technology detection, 
            trend analysis, and AI-powered recommendations
          </p>
        </div>

        {/* Quick Start Analysis Flow */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-6 w-6" />
              <span>Complete Analysis Flow</span>
            </CardTitle>
            <CardDescription>
              Run all analysis steps in sequence for comprehensive insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>SimilarWeb</span>
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Code className="h-3 w-3" />
                    <span>BuiltWith</span>
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Trends</span>
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>AI Chat</span>
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setShowAnalysisFlow(true)}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Complete Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Or Choose Individual Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card key={feature.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${feature.color} p-2 rounded-lg text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                      <Link href={feature.href}>
                        <Button className="w-full group-hover:bg-primary/90 transition-colors">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold">100+</h3>
              </div>
              <p className="text-sm text-muted-foreground">Websites Analyzed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold">50+</h3>
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold">1000+</h3>
              </div>
              <p className="text-sm text-muted-foreground">AI Insights Generated</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Website?</h2>
            <p className="text-muted-foreground mb-6">
              Start with our comprehensive analysis flow or choose individual tools to gain valuable insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAnalysisFlow(true)}
                className="w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                Complete Analysis Flow
              </Button>
              <Link href="/similarweb">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  SimilarWeb Only
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
