"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Globe, Key, TrendingUp, Play, Clock, CheckCircle, Copy, AlertTriangle, Info } from "lucide-react"

// Define the base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Mapping of country names to location codes
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
  "Spain": 2724,
  "Sri Lanka": 2144,
  "Sudan": 2736,
  "Suriname": 2740,
  "Svalbard and Jan Mayen": 2744,
  "Sweden": 2752,
  "Switzerland": 2756,
  "Taiwan": 2158,
  "Tajikistan": 2762,
  "Tanzania": 2834,
  "Thailand": 2764,
  "The Bahamas": 2044,
  "The Gambia": 2270,
  "Timor-Leste": 2626,
  "Togo": 2768,
  "Tokelau": 2772,
  "Tonga": 2776,
  "Trinidad and Tobago": 2780,
  "Tunisia": 2788,
  "Turkiye": 2792,
  "Turkmenistan": 2795,
  "Turks and Caicos Islands": 2796,
  "Tuvalu": 2798,
  "U.S. Virgin Islands": 2850,
  "Uganda": 2800,
  "Ukraine": 2804,
  "United Arab Emirates": 2784,
  "United Kingdom": 2826,
  "United States": 2840,
  "United States Minor Outlying Islands": 2581,
  "Uruguay": 2858,
  "Uzbekistan": 2860,
  "Vanuatu": 2548,
  "Vatican City": 2336,
  "Venezuela": 2862,
  "Vietnam": 2704,
  "Wallis and Futuna": 2876,
  "Western Sahara": 2732,
  "Yemen": 2887,
  "Zambia": 2894,
  "Zimbabwe": 2716
}

export default function KeywordsDataAPIPage() {
  const [activeEndpoint, setActiveEndpoint] = useState("search-volume")
  const [method, setMethod] = useState<"live" | "standard">("live")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState("")
  // Form states
  const [keywords, setKeywords] = useState("buy laptop\ncheap laptops for sale\npurchase laptop")
  const [locationCode, setLocationCode] = useState("2840")
  const [languageCode, setLanguageCode] = useState("en")
  const [target, setTarget] = useState("dataforseo.com")
  const [bid, setBid] = useState("999")
  const [match, setMatch] = useState("exact")

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
      description: "Estimate ad performance metrics for keywords",
      path: "/api/keywords/ad_traffic",
    },
  ]

  const handleSubmit = async () => {
    const currentEndpoint = endpoints.find((e) => e.id === activeEndpoint)
    if (!currentEndpoint) return
    setLoading(true)
    setResults(null)
    setError(null)
    setTaskId("")
    // 1. Construct the request body based on the active endpoint
    // This now directly matches the Pydantic models in your FastAPI backend
    const requestData: any = {
      method: method,
      location_code: Number.parseInt(locationCode),
      language_code: languageCode,
      tag: `frontend-ui-task-${Date.now()}`
    }
    const keywordsList = keywords.split("\n").map((k) => k.trim()).filter((k) => k);
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
      // 2. Make the API call to your backend
      const response = await fetch(`${API_BASE_URL}${currentEndpoint.path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
      const responseData = await response.json()
      if (!response.ok) {
        // Handle API errors returned from FastAPI/DataForSEO
        throw new Error(responseData.detail || "An unknown error occurred.")
      }

      setResults(responseData)

      // If the method was 'standard', extract and set the task ID for user feedback
      if (method === "standard" && responseData.tasks?.[0]?.id) {
        setTaskId(responseData.tasks[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderForm = () => {
    const currentEndpoint = endpoints.find((e) => e.id === activeEndpoint)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentEndpoint?.icon && <currentEndpoint.icon className="h-5 w-5" />}
            {currentEndpoint?.name}
          </CardTitle>
          <CardDescription>{currentEndpoint?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Button variant={method === "live" ? "default" : "outline"} size="sm" onClick={() => setMethod("live")}>
                <Play className="h-4 w-4 mr-1" />
                Live
              </Button>
              <Button
                variant={method === "standard" ? "default" : "outline"}
                size="sm"
                onClick={() => setMethod("standard")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Standard
              </Button>
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
    )
  }

  const renderResults = () => {
    if (!results) return null
    const taskResults = results.tasks?.[0]?.result || []
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            API Response
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Status: {results.status_code} ({results.status_message})</span>
            <span>Cost: ${results.cost?.toFixed(4) || '0.0000'}</span>
            <span>Results: {taskResults.length}</span>
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
              {activeEndpoint === "search-volume" && (
                <div className="space-y-4">
                  {taskResults.map((item: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{item.keyword}</h4>
                          <Badge
                            variant={
                              item.competition === "HIGH"
                                ? "destructive"
                                : item.competition === "MEDIUM"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {item.competition}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Search Volume:</span>
                            <p className="font-medium">{item.search_volume?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CPC:</span>
                            <p className="font-medium">${item.cpc}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Competition Index:</span>
                            <p className="font-medium">{item.competition_index}/100</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{item.location_code}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {activeEndpoint === "ad-traffic" && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-4">Ad Traffic Forecast</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <span className="text-muted-foreground">Impressions:</span>
                        <p className="font-medium text-lg">{taskResults[0]?.impressions?.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clicks:</span>
                        <p className="font-medium text-lg">{taskResults[0]?.clicks?.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CTR:</span>
                        <p className="font-medium text-lg">{(taskResults[0]?.ctr * 100)?.toFixed(2)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg CPC:</span>
                        <p className="font-medium text-lg">${taskResults[0]?.average_cpc?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Cost:</span>
                        <p className="font-medium text-lg">${taskResults[0]?.cost?.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {(activeEndpoint === "keywords-for-site" || activeEndpoint === "keywords-for-keywords") && (
                <div className="space-y-2">
                  {taskResults.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{item.keyword}</span>
                        <div className="text-sm text-muted-foreground">
                          Volume: {item.search_volume?.toLocaleString()} | CPC: ${item.cpc?.toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.competition === "HIGH"
                            ? "destructive"
                            : item.competition === "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {item.competition}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="raw">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 z-10 bg-transparent"
                  onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Keywords Data API Dashboard</h1>
          <p className="text-muted-foreground">Technical interface for consuming Google Keywords Data API endpoints</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {endpoints.map((endpoint) => (
                  <Button
                    key={endpoint.id}
                    variant={activeEndpoint === endpoint.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveEndpoint(endpoint.id);
                      setResults(null);
                      setError(null);
                    }}
                  >
                    <endpoint.icon className="h-4 w-4 mr-2" />
                    {endpoint.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {renderForm()}
            {loading && <p>Loading...</p>}
            {results && renderResults()}
            {method === "standard" && (
              <Card>
                <CardHeader>
                  <CardTitle>Standard Method Workflow</CardTitle>
                  <CardDescription>For asynchronous processing, follow these steps:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">POST Task</p>
                      <p className="text-sm text-muted-foreground">Submit your request using the 'Standard' method button above.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Check Tasks Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Poll the `/tasks_ready` endpoint for your API to see if processing is complete.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Get Results</p>
                      <p className="text-sm text-muted-foreground">Retrieve final data using the `/task_get/{"{task_id}"}` endpoint.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
