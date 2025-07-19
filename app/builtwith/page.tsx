// page.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Globe,
  BarChart3,
  CheckCircle,
  Copy,
  ExternalLink,
  Zap,
  Filter,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const COUNTRY_LIST = [
  { name: "ANY", code: "ANY" },
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "American Samoa", code: "AS" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Anguilla", code: "AI" },
  { name: "Antarctica", code: "AQ" },
  { name: "Antigua and Barbuda", code: "AG" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Aruba", code: "AW" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Barbados", code: "BB" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Belize", code: "BZ" },
  { name: "Benin", code: "BJ" },
  { name: "Bermuda", code: "BM" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Bouvet Island", code: "BV" },
  { name: "Brazil", code: "BR" },
  { name: "British Indian Ocean Territory", code: "IO" },
  { name: "British Virgin Islands", code: "VG" },
  { name: "Brunei", code: "BN" },
  { name: "Bulgaria", code: "BG" },
  { name: "Burkina Faso", code: "BF" },
  { name: "Burundi", code: "BI" },
  { name: "Cabo Verde", code: "CV" },
  { name: "Cambodia", code: "KH" },
  { name: "Cameroon", code: "CM" },
  { name: "Canada", code: "CA" },
  { name: "Caribbean Netherlands", code: "BQ" },
  { name: "Cayman Islands", code: "KY" },
  { name: "Central African Republic", code: "CF" },
  { name: "Chad", code: "TD" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Christmas Island", code: "CX" },
  { name: "Cocos (Keeling) Islands", code: "CC" },
  { name: "Colombia", code: "CO" },
  { name: "Comoros", code: "KM" },
  { name: "Cook Islands", code: "CK" },
  { name: "Costa Rica", code: "CR" },
  { name: "Cote d'Ivoire", code: "CI" },
  { name: "Croatia", code: "HR" },
  { name: "Curacao", code: "CW" },
  { name: "Cyprus", code: "CY" },
  { name: "Czechia", code: "CZ" },
  { name: "Democratic Republic of the Congo", code: "CD" },
  { name: "Denmark", code: "DK" },
  { name: "Djibouti", code: "DJ" },
  { name: "Dominica", code: "DM" },
  { name: "Dominican Republic", code: "DO" },
  { name: "Ecuador", code: "EC" },
  { name: "Egypt", code: "EG" },
  { name: "El Salvador", code: "SV" },
  { name: "Equatorial Guinea", code: "GQ" },
  { name: "Eritrea", code: "ER" },
  { name: "Estonia", code: "EE" },
  { name: "Eswatini", code: "SZ" },
  { name: "Ethiopia", code: "ET" },
  { name: "Falkland Islands (Islas Malvinas)", code: "FK" },
  { name: "Faroe Islands", code: "FO" },
  { name: "Fiji", code: "FJ" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "French Guiana", code: "GF" },
  { name: "French Polynesia", code: "PF" },
  { name: "French Southern and Antarctic Lands", code: "TF" },
  { name: "Gabon", code: "GA" },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Gibraltar", code: "GI" },
  { name: "Greece", code: "GR" },
  { name: "Greenland", code: "GL" },
  { name: "Grenada", code: "GD" },
  { name: "Guadeloupe", code: "GP" },
  { name: "Guam", code: "GU" },
  { name: "Guatemala", code: "GT" },
  { name: "Guernsey", code: "GG" },
  { name: "Guinea", code: "GN" },
  { name: "Guinea-Bissau", code: "GW" },
  { name: "Guyana", code: "GY" },
  { name: "Haiti", code: "HT" },
  { name: "Heard Island and McDonald Islands", code: "HM" },
  { name: "Honduras", code: "HN" },
  { name: "Hong Kong", code: "HK" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Isle of Man", code: "IM" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" },
  { name: "Jersey", code: "JE" },
  { name: "Jordan", code: "JO" },
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kiribati", code: "KI" },
  { name: "Kuwait", code: "KW" },
  { name: "Kyrgyzstan", code: "KG" },
  { name: "Laos", code: "LA" },
  { name: "Latvia", code: "LV" },
  { name: "Lebanon", code: "LB" },
  { name: "Lesotho", code: "LS" },
  { name: "Liberia", code: "LR" },
  { name: "Libya", code: "LY" },
  { name: "Liechtenstein", code: "LI" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },
  { name: "Macao", code: "MO" },
  { name: "Madagascar", code: "MG" },
  { name: "Malawi", code: "MW" },
  { name: "Malaysia", code: "MY" },
  { name: "Maldives", code: "MV" },
  { name: "Mali", code: "ML" },
  { name: "Malta", code: "MT" },
  { name: "Marshall Islands", code: "MH" },
  { name: "Martinique", code: "MQ" },
  { name: "Mauritania", code: "MR" },
  { name: "Mauritius", code: "MU" },
  { name: "Mayotte", code: "YT" },
  { name: "Mexico", code: "MX" },
  { name: "Micronesia", code: "FM" },
  { name: "Moldova", code: "MD" },
  { name: "Monaco", code: "MC" },
  { name: "Mongolia", code: "MN" },
  { name: "Montenegro", code: "ME" },
  { name: "Montserrat", code: "MS" },
  { name: "Morocco", code: "MA" },
  { name: "Mozambique", code: "MZ" },
  { name: "Myanmar (Burma)", code: "MM" },
  { name: "Namibia", code: "NA" },
  { name: "Nauru", code: "NR" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Caledonia", code: "NC" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nicaragua", code: "NI" },
  { name: "Niger", code: "NE" },
  { name: "Nigeria", code: "NG" },
  { name: "Niue", code: "NU" },
  { name: "Norfolk Island", code: "NF" },
  { name: "North Macedonia", code: "MK" },
  { name: "Northern Mariana Islands", code: "MP" },
  { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" },
  { name: "Pakistan", code: "PK" },
  { name: "Palau", code: "PW" },
  { name: "Palestine", code: "PS" },
  { name: "Panama", code: "PA" },
  { name: "Papua New Guinea", code: "PG" },
  { name: "Paraguay", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Philippines", code: "PH" },
  { name: "Pitcairn Islands", code: "PN" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Puerto Rico", code: "PR" },
  { name: "Qatar", code: "QA" },
  { name: "Republic of the Congo", code: "CG" },
  { name: "Reunion", code: "RE" },
  { name: "Romania", code: "RO" },
  { name: "Rwanda", code: "RW" },
  { name: "Saint Barthelemy", code: "BL" },
  { name: "Saint Helena, Ascension and Tristan da Cunha", code: "SH" },
  { name: "Saint Kitts and Nevis", code: "KN" },
  { name: "Saint Lucia", code: "LC" },
  { name: "Saint Martin", code: "MF" },
  { name: "Saint Pierre and Miquelon", code: "PM" },
  { name: "Saint Vincent and the Grenadines", code: "VC" },
  { name: "Samoa", code: "WS" },
  { name: "San Marino", code: "SM" },
  { name: "Sao Tome and Principe", code: "ST" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" },
  { name: "Serbia", code: "RS" },
  { name: "Seychelles", code: "SC" },
  { name: "Sierra Leone", code: "SL" },
  { name: "Singapore", code: "SG" },
  { name: "Sint Maarten", code: "SX" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Solomon Islands", code: "SB" },
  { name: "Somalia", code: "SO" },
  { name: "South Africa", code: "ZA" },
  { name: "South Georgia and the South Sandwich Islands", code: "GS" },
  { name: "South Korea", code: "KR" },
  { name: "South Sudan", code: "SS" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sudan", code: "SD" },
  { name: "Suriname", code: "SR" },
  { name: "Svalbard and Jan Mayen", code: "SJ" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Taiwan", code: "TW" },
  { name: "Tajikistan", code: "TJ" },
  { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" },
  { name: "Timor-Leste", code: "TL" },
  { name: "Togo", code: "TG" },
  { name: "Tokelau", code: "TK" },
  { name: "Tonga", code: "TO" },
  { name: "Trinidad and Tobago", code: "TT" },
  { name: "Tunisia", code: "TN" },
  { name: "Turkiye", code: "TR" },
  { name: "Turkmenistan", code: "TM" },
  { name: "Turks and Caicos Islands", code: "TC" },
  { name: "Tuvalu", code: "TV" },
  { name: "U.S. Virgin Islands", code: "VI" },
  { name: "Uganda", code: "UG" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "United States Minor Outlying Islands", code: "UM" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Vanuatu", code: "VU" },
  { name: "Vatican City", code: "VA" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Wallis and Futuna", code: "WF" },
  { name: "Western Sahara", code: "EH" },
  { name: "Yemen", code: "YE" },
  { name: "Zambia", code: "ZM" },
  { name: "Zimbabwe", code: "ZW" },
];


export default function BuiltWithPage() {
  const [activeEndpoint, setActiveEndpoint] = useState("domain-technologies")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [domain, setDomain] = useState("dataforseo.com")
  const [technologies, setTechnologies] = useState("Nginx")
  const [keywords, setKeywords] = useState("WordPress")
  const [countryCode, setCountryCode] = useState("US")
  const [domainRank, setDomainRank] = useState("800")
  const [limit, setLimit] = useState("10")
  const [orderBy, setOrderBy] = useState("last_visited,desc")
  const [mode, setMode] = useState("entry")

  const endpoints = [
    {
      id: "domain-technologies",
      name: "Domain Technologies",
      icon: Zap,
      description: "Identify technologies used by a specific domain",
      apiUrl: "/api/domain-analytics/domain-technologies",
    },
    {
      id: "domains-by-technology",
      name: "Domains by Technology",
      icon: Filter,
      description: "Find domains using specific technologies with filters",
      apiUrl: "/api/domain-analytics/domains-by-technology",
    },
    // {
    //   id: "technologies-summary",
    //   name: "Technologies Summary",
    //   icon: BarChart3,
    //   description: "Get statistics on technology usage across websites",
    //   apiUrl: "/api/domain-analytics/technologies-summary",
    // },
  ]

  const handleSubmit = async () => {
    const currentEndpoint = endpoints.find((e) => e.id === activeEndpoint)
    if (!currentEndpoint) return

    setLoading(true)
    setResults(null)
    setError(null)

    let requestBody: any = {}

    switch (activeEndpoint) {
      case "domain-technologies":
        requestBody = { target: domain }
        break
      case "domains-by-technology":
        requestBody = {
          technologies: [technologies],
          country_iso_code: countryCode,
          domain_rank_min: parseInt(domainRank),
          order_by: orderBy,
          limit: parseInt(limit),
        }
        break
      // case "technologies-summary":
      //   requestBody = {
      //     technologies: technologies.split("\n").map(t => t.trim()).filter(Boolean),
      //     keywords: keywords.split("\n").map(k => k.trim()).filter(Boolean),
      //     country_iso_code: countryCode,
      //     domain_rank_min: parseInt(domainRank),
      //     mode: mode,
      //   }
      //   break
    }
    
    try {
      const response = await fetch(currentEndpoint.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "An unknown error occurred.")
      }

      setResults(data)
    } catch (err: any) {
      console.error("API call failed:", err)
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
          {activeEndpoint === "domain-technologies" && (
            <div>
              <Label htmlFor="domain">Target Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="dataforseo.com"
              />
            </div>
          )}

          {activeEndpoint === "domains-by-technology" && (
            <>
              <div>
                <Label htmlFor="technologies">Technology</Label>
                 <Input
                    id="technologies"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g., Nginx, React"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country Code</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                      {COUNTRY_LIST.map((country) => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="domainRank">Min Domain Rank</Label>
                  <Input
                    id="domainRank"
                    type="number"
                    value={domainRank}
                    onChange={(e) => setDomainRank(e.target.value)}
                    placeholder="800"
                  />
                </div>
              </div>
            </>
          )}

          {/*
          {activeEndpoint === "technologies-summary" && (
            <>
              <div>
                <Label htmlFor="tech-summary">Technologies (one per line)</Label>
                <Textarea
                  id="tech-summary"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Nginx\nWordPress"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="keywords-summary">Keywords (one per line)</Label>
                <Textarea
                  id="keywords-summary"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e-commerce\nanalytics"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country-summary">Country Code</Label>
                     <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {COUNTRY_LIST.map((country) => (
                          <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                 <div>
                    <Label htmlFor="domainRank-summary">Min Domain Rank</Label>
                    <Input
                      id="domainRank-summary"
                      type="number"
                      value={domainRank}
                      onChange={(e) => setDomainRank(e.target.value)}
                      placeholder="800"
                    />
                  </div>
              </div>
              <div>
                <Label htmlFor="mode">Analysis Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Mode</SelectItem>
                    <SelectItem value="advanced">Advanced Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          */}
          
          {activeEndpoint !== 'technologies-summary' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="limit">Results Limit</Label>
                  <Select value={limit} onValueChange={setLimit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeEndpoint === "domains-by-technology" && (
                  <div>
                    <Label htmlFor="orderBy">Order By</Label>
                    <Select value={orderBy} onValueChange={setOrderBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_visited,desc">Last Visited (Recent)</SelectItem>
                        <SelectItem value="last_visited,asc">Last Visited (Oldest)</SelectItem>
                        <SelectItem value="domain_rank,desc">Domain Rank (High to Low)</SelectItem>
                        <SelectItem value="domain_rank,asc">Domain Rank (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
          )}


          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderResults = () => {
     if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <pre className="text-xs whitespace-pre-wrap">{error}</pre>
          </AlertDescription>
        </Alert>
      )
    }
    
    if (!results) return null

    const taskResult = results?.tasks?.[0]?.result?.[0] ?? {}

    // --- Fix: Transform objects to arrays for technologies-summary ---
    let countriesArr: any[] = [];
    let languagesArr: any[] = [];
    let keywordsArr: any[] = [];
    if (activeEndpoint === "technologies-summary") {
      if (taskResult.countries && typeof taskResult.countries === "object" && !Array.isArray(taskResult.countries)) {
        const total = Object.values(taskResult.countries).reduce((a, b) => Number(a) + Number(b), 0) || 1;
        countriesArr = Object.entries(taskResult.countries).map(([country_iso_code, count]: [string, any]) => ({
          country_iso_code,
          count,
          percentage: Math.round((Number(count) / Number(total)) * 1000) / 10, // 1 decimal
        }));
      } else if (Array.isArray(taskResult.countries)) {
        countriesArr = taskResult.countries;
      }
      if (taskResult.languages && typeof taskResult.languages === "object" && !Array.isArray(taskResult.languages)) {
        const total = Object.values(taskResult.languages).reduce((a, b) => Number(a) + Number(b), 0) || 1;
        languagesArr = Object.entries(taskResult.languages).map(([language_code, count]: [string, any]) => ({
          language_code,
          count,
          percentage: Math.round((Number(count) / Number(total)) * 1000) / 10,
        }));
      } else if (Array.isArray(taskResult.languages)) {
        languagesArr = taskResult.languages;
      }
      if (taskResult.keywords && typeof taskResult.keywords === "object" && !Array.isArray(taskResult.keywords)) {
        const total = Object.values(taskResult.keywords).reduce((a, b) => Number(a) + Number(b), 0) || 1;
        keywordsArr = Object.entries(taskResult.keywords).map(([keyword, count]: [string, any]) => ({
          keyword,
          count,
          percentage: Math.round((Number(count) / Number(total)) * 1000) / 10,
        }));
      } else if (Array.isArray(taskResult.keywords)) {
        keywordsArr = taskResult.keywords;
      }
    }
    // --- End Fix ---

    if (results.tasks_error > 0 || results.tasks[0].status_code !== 20000) {
       return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error: {results.tasks[0].status_code}</AlertTitle>
            <AlertDescription>
                <p>{results.tasks[0].status_message}</p>
                 <pre className="mt-4 text-xs bg-muted p-4 rounded overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
            </AlertDescription>
        </Alert>
       )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Analysis Results
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Status: {results.status_message} ({results.status_code})</span>
            <span>Cost: ${results.cost}</span>
            <span>Time: {results.time}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="formatted">
            <TabsList>
              <TabsTrigger value="formatted">Formatted Results</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="formatted" className="mt-4 space-y-4">
              {activeEndpoint === "domain-technologies" && (
                <div className="space-y-6">
                  {/* Domain Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Domain Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">{taskResult.domain}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{taskResult.title}</p>
                          <p className="text-xs text-muted-foreground">{taskResult.description}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4" />
                            <span>Domain Rank: {taskResult.domain_rank}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>Country: {taskResult.country_iso_code}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>Last Visited: {new Date(taskResult.last_visited).toLocaleDateString()}</span>
                          </div>
                          {taskResult.emails?.[0] && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" />
                              <span>{taskResult.emails[0]}</span>
                            </div>
                          )}
                          {taskResult.phone_numbers?.[0] && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4" />
                              <span>{taskResult.phone_numbers[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technologies */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Technology Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(taskResult.technologies || {}).map(([category, techs]: [string, any]) => (
                          <div key={category}>
                            <h4 className="font-semibold mb-2 capitalize">{category.replace(/_/g, " ")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(techs).map(([subcat, items]: [string, any]) => (
                                <div key={subcat} className="p-3 border rounded">
                                  <h5 className="text-sm font-medium mb-1 capitalize">{subcat.replace(/_/g, " ")}</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {(items || []).map((item: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeEndpoint === "domains-by-technology" && (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                        Domains using {technologies} ({taskResult.total_count?.toLocaleString()} total)
                        </h3>
                        <Badge variant="outline">{taskResult.items_count} shown</Badge>
                    </div>
                    {taskResult.items && taskResult.items.length > 0 ? (
                        <div className="space-y-2">
                        {taskResult.items.map((item: any, idx: number) => (
                            <Card key={idx}>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-semibold">{item.domain}</h4>
                                    <a href={`http://${item.domain}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </a>
                                </div>
                                <Badge variant="outline">Rank: {item.domain_rank}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{item.title}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Country:</span>
                                    <p className="font-medium">{item.country_iso_code}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Last Visited:</span>
                                    <p className="font-medium">{new Date(item.last_visited).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium break-all">{item.emails?.[0] || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Phone:</span>
                                    <p className="font-medium">{item.phone_numbers?.[0] || "N/A"}</p>
                                </div>
                                </div>
                            </CardContent>
                            </Card>
                        ))}
                        </div>
                    ) : (
                        <p>No items found for the specified criteria.</p>
                    )}
                 </div>
              )}

              {/*
              {activeEndpoint === "technologies-summary" && (
                <div className="space-y-6">
                 {countriesArr.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribution by Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {countriesArr.map((country: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 text-sm font-medium">{country.country_iso_code}</div>
                            <Progress value={country.percentage} className="flex-1" />
                            <div className="w-16 text-sm text-right">{country.percentage}%</div>
                            <div className="w-20 text-sm text-right text-muted-foreground">
                              {country.count.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  )}

                 {languagesArr.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribution by Language</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {languagesArr.map((lang: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 text-sm font-medium uppercase">{lang.language_code}</div>
                            <Progress value={lang.percentage} className="flex-1" />
                            <div className="w-16 text-sm text-right">{lang.percentage}%</div>
                            <div className="w-20 text-sm text-right text-muted-foreground">
                              {lang.count.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                 )}

                  {keywordsArr.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Keyword Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {keywordsArr.map((kw: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-24 text-sm font-medium">{kw.keyword}</div>
                              <Progress value={kw.percentage} className="flex-1" />
                              <div className="w-16 text-sm text-right">{kw.percentage}%</div>
                              <div className="w-20 text-sm text-right text-muted-foreground">
                                {kw.count.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {countriesArr.length === 0 && languagesArr.length === 0 && keywordsArr.length === 0 && (
                      <p>No summary data found for the specified criteria.</p>
                  )}
                </div>
              )}
              */}
            </TabsContent>

            <TabsContent value="raw">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 z-10"
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
          <h1 className="text-3xl font-bold mb-2">BuiltWith Technology Profiler</h1>
          <p className="text-muted-foreground">Discover what technologies websites are built with using the DataForSEO API</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {endpoints.map((endpoint) => (
                  <Button
                    key={endpoint.id}
                    variant={activeEndpoint === endpoint.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => {
                        setActiveEndpoint(endpoint.id);
                        setResults(null); // Clear results when switching tools
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
            {loading && (
                 <div className="flex justify-center items-center p-8">
                    <p>Loading...</p>
                </div>
            )}
            {!loading && (results || error) && renderResults()}
          </div>
        </div>
      </div>
    </div>
  )
}