"use client"

import { useState } from "react"
import SimilarWebResults from "./similarweb-results"
import BuiltWithResultsFlow from "./builtwith-results-flow"
import GoogleTrendsFlow from "./google-trends-flow"
import ChatSystem from "./chat-system"

interface SimpleAnalysisFlowProps {
  domain: string
  competitors: string[]
  onBackToSearch: () => void
}

type FlowStep = "similarweb" | "builtwith" | "trends" | "chat"

interface AnalysisDataStore {
  domain: string
  competitors: string[]
  similarWebData?: any
  builtWithData?: any
  trendsData?: any
}

export default function SimpleAnalysisFlow({ 
  domain, 
  competitors, 
  onBackToSearch 
}: SimpleAnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("similarweb")
  const [analysisData, setAnalysisData] = useState<AnalysisDataStore>({
    domain,
    competitors
  })

  // Handle completion of SimilarWeb analysis and auto-proceed to BuiltWith
  const handleSimilarWebComplete = (data: any) => {
    console.log("SimilarWeb completed with data:", data)
    setAnalysisData(prev => ({
      ...prev,
      similarWebData: data,
      competitors: data.competitors || prev.competitors // Update competitors from analysis
    }))
    setCurrentStep("builtwith")
  }

  // Handle completion of BuiltWith analysis and auto-proceed to Trends
  const handleBuiltWithComplete = (data: any) => {
    console.log("BuiltWith completed with data:", data)
    setAnalysisData(prev => ({
      ...prev,
      builtWithData: data
    }))
    setCurrentStep("trends")
  }

  // Handle completion of Trends analysis and auto-proceed to Chat
  const handleTrendsComplete = (data: any) => {
    console.log("Trends completed with data:", data)
    setAnalysisData(prev => ({
      ...prev,
      trendsData: data
    }))
    setCurrentStep("chat")
  }

  // Handle direct jump to chat (skip other steps)
  const handleDirectJumpToChat = () => {
    setCurrentStep("chat")
  }

  // Handle step navigation (for back buttons, etc.)
  const handleStepNavigation = (step: FlowStep) => {
    setCurrentStep(step)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "similarweb":
        return (
          <SimilarWebResults
            domain={analysisData.domain}
            competitors={analysisData.competitors}
            onSwitchToBuiltWith={() => handleStepNavigation("builtwith")}
            onSwitchToChat={handleDirectJumpToChat}
            onBackToSearch={onBackToSearch}
            onAnalysisComplete={handleSimilarWebComplete}
            showNextButton={true}
          />
        )
      
      case "builtwith":
        return (
          <BuiltWithResultsFlow
            domain={analysisData.domain}
            competitors={analysisData.competitors}
            onSwitchToSimilarWeb={() => handleStepNavigation("similarweb")}
            onSwitchToChat={handleDirectJumpToChat}
            onBackToSearch={onBackToSearch}
            onAnalysisComplete={handleBuiltWithComplete}
            showNextButton={true}
          />
        )
      
      case "trends":
        return (
          <GoogleTrendsFlow
            domain={analysisData.domain}
            competitors={analysisData.competitors}
            onBackToSearch={onBackToSearch}
            onSwitchToChat={handleDirectJumpToChat}
            onAnalysisComplete={handleTrendsComplete}
            showNextButton={true}
          />
        )
      
      case "chat":
        return (
          <ChatSystem
            analysisData={{
              domain: analysisData.domain,
              competitors: analysisData.competitors,
              similarWebData: analysisData.similarWebData,
              builtWithData: analysisData.builtWithData
            }}
            onBackToSearch={onBackToSearch}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {/* Optional: Add step indicator */}
      <div className="hidden">
        Current step: {currentStep}
        <br />
        Domain: {analysisData.domain}
        <br />
        Competitors: {analysisData.competitors.join(", ")}
      </div>
      
      {renderCurrentStep()}
    </div>
  )
}
