"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, AlertCircle, Code } from "lucide-react"
import BuiltWithResults from "../components/builtwith-results"

export default function BuiltWithPage() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)

  const API_BASE_URL = "http://localhost:8000"

  const handleAnalyze = async () => {
    if (!domain.trim()) return

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-tech-stack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websites: [domain.trim()],
          userId: 'user-123' // You can make this dynamic later
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || "Failed to analyze website technologies")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setError("Failed to analyze website. Please check if the backend is running and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">BuiltWith Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Discover the technologies and tools used to build websites
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technology Stack Analysis</CardTitle>
            <CardDescription>
              Enter a domain name to discover the technologies used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !domain.trim()}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
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
            <BuiltWithResults 
              domain={domain}
              competitors={[]}
              onSwitchToSimilarWeb={() => {}}
              onSwitchToChat={() => {}}
              onBackToSearch={() => {}}
              apiData={results}
            />
          </div>
        )}
      </div>
    </div>
  )
}