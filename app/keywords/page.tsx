"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

interface KeywordResult {
  keyword: string;
  competition: string;
  search_volume: number;
  cpc: number | null;
  low_top_of_page_bid: number | null;
  high_top_of_page_bid: number | null;
  monthly_searches: MonthlySearch[];
}

interface ApiResponse {
  tasks: {
    result: KeywordResult[];
  }[];
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("US");
  const [language, setLanguage] = useState("en");
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
  if (!keywords.trim()) {
    setError("Please enter at least one keyword.");
    return;
  }

  setIsLoading(true);
  setError(null);
  setResults([]);

  try {
    const response = await fetch("/api/keyword_search_volume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: keywords.split(",").map((k) => k.trim()),
        location: location,
        language_code: language,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch keyword data.");
      } else {
        const text = await response.text();
        console.error("Received HTML instead of JSON:", text.substring(0, 100));
        throw new Error(`Server returned status ${response.status}: Not a valid JSON response`);
      }
    }

    const data: ApiResponse = await response.json();
    console.log("API Response:", data); // Log the full response for debugging

    if (data.tasks?.[0]?.result) {
      setResults(data.tasks[0].result);
    } else {
      setError("No results found for the given keywords.");
    }
  } catch (err: any) {
    console.error("Error fetching keyword data:", err);
    setError(err.message || "Failed to process request");
  } finally {
    setIsLoading(false);
  }
};

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Enter keywords (comma-separated)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              placeholder="Location (e.g., US)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              placeholder="Language (e.g., en)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="mt-4">
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <p className="mt-2 text-sm text-gray-500">
              Please check your keywords and try again. Make sure you're entering valid search terms.
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>Low Bid</TableHead>
                  <TableHead>High Bid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.keyword}>
                    <TableCell>{result.keyword}</TableCell>
                    <TableCell>{result.search_volume?.toLocaleString()}</TableCell>
                    <TableCell>{result.competition}</TableCell>
                    <TableCell>${result.cpc?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>${result.low_top_of_page_bid?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>${result.high_top_of_page_bid?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {results.map((result) => (
        <Card key={result.keyword + "-chart"}>
          <CardHeader>
            <CardTitle>Monthly Search Trend: "{result.keyword}"</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={result.monthly_searches.map((ms) => ({
                  name: `${monthNames[ms.month - 1]} ${ms.year}`,
                  volume: ms.search_volume,
                })).reverse()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#8884d8" name="Search Volume" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}