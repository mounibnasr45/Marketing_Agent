"use client"

import ChatSystem from "@/app/components/chat-system"

export default function ChatPage() {
  const defaultAnalysisData = {
    domain: "example.com",
    competitors: ["competitor1.com", "competitor2.com", "competitor3.com"],
    similarWebData: null,
    builtWithData: null
  }

  const handleBackToSearch = () => {
    window.history.back()
  }

  return (
    <ChatSystem 
      analysisData={defaultAnalysisData}
      onBackToSearch={handleBackToSearch}
    />
  )
}