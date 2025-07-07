"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Filter, Calendar, Globe, BarChart3, Code, MessageCircle, Trash2 } from "lucide-react"

interface HistoryItem {
  id: string
  domain: string
  type: "similarweb" | "builtwith" | "chat" | "google-trends"
  timestamp: string
  status: "success" | "error" | "pending"
  results?: any
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockHistory: HistoryItem[] = [
      {
        id: "1",
        domain: "example.com",
        type: "similarweb",
        timestamp: "2024-01-15T10:30:00Z",
        status: "success"
      },
      {
        id: "2",
        domain: "github.com",
        type: "builtwith",
        timestamp: "2024-01-15T09:15:00Z",
        status: "success"
      },
      {
        id: "3",
        domain: "linkedin.com",
        type: "chat",
        timestamp: "2024-01-14T16:45:00Z",
        status: "success"
      },
      {
        id: "4",
        domain: "react",
        type: "google-trends",
        timestamp: "2024-01-14T14:20:00Z",
        status: "success"
      },
      {
        id: "5",
        domain: "stackoverflow.com",
        type: "similarweb",
        timestamp: "2024-01-14T11:10:00Z",
        status: "error"
      }
    ]
    setHistory(mockHistory)
    setFilteredHistory(mockHistory)
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = history

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType)
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    setFilteredHistory(filtered)
  }, [searchTerm, filterType, filterStatus, history])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "similarweb": return <BarChart3 className="h-4 w-4" />
      case "builtwith": return <Code className="h-4 w-4" />
      case "chat": return <MessageCircle className="h-4 w-4" />
      case "google-trends": return <Globe className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "similarweb": return "bg-blue-500"
      case "builtwith": return "bg-green-500"
      case "chat": return "bg-purple-500"
      case "google-trends": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const clearHistory = () => {
    setHistory([])
    setFilteredHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Analysis History</h1>
          </div>
          <p className="text-muted-foreground">
            View your past website analyses and results
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="similarweb">SimilarWeb</SelectItem>
                  <SelectItem value="builtwith">BuiltWith</SelectItem>
                  <SelectItem value="google-trends">Google Trends</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No history items found</p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-semibold">{item.domain}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="capitalize">
                        {item.type.replace("-", " ")}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}