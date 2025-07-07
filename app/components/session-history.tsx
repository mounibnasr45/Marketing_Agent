"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  MessageSquare, 
  Globe, 
  Trash2, 
  RotateCcw, 
  Calendar,
  Users,
  Activity
} from "lucide-react"
import { useAppState, ChatSession } from "@/lib/state-context"

interface SessionHistoryProps {
  onRestoreSession: (sessionId: string) => void
  onClose: () => void
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onRestoreSession, onClose }) => {
  const { state, dispatch } = useAppState()

  const handleRestoreSession = (sessionId: string) => {
    dispatch({ type: 'LOAD_SESSION', payload: sessionId })
    onRestoreSession(sessionId)
  }

  const handleClearAllSessions = () => {
    dispatch({ type: 'CLEAR_ALL_SESSIONS' })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
      return 'just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getSessionSummary = (session: ChatSession) => {
    const messageCount = session.messages.length
    const competitorCount = session.analysisData.competitors.length
    const hasBuiltWith = session.analysisData.builtWithData && Object.keys(session.analysisData.builtWithData).length > 0
    const hasSimilarWeb = session.analysisData.similarWebData && Object.keys(session.analysisData.similarWebData).length > 0
    
    return {
      messageCount,
      competitorCount,
      hasBuiltWith,
      hasSimilarWeb
    }
  }

  if (state.sessionHistory.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
          <CardDescription>
            Your previous searches and analyses will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No previous sessions found</p>
            <p className="text-sm">Start analyzing websites to build your session history</p>
          </div>
          <Button onClick={onClose} variant="outline" className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session History
            </CardTitle>
            <CardDescription>
              {state.sessionHistory.length} saved analysis sessions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAllSessions}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-4">
            {state.sessionHistory.map((session) => {
              const summary = getSessionSummary(session)
              return (
                <Card key={session.sessionId} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {session.analysisData.domain}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.createdAt)}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => handleRestoreSession(session.sessionId)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.messageCount} messages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{summary.competitorCount} competitors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {summary.hasSimilarWeb ? (
                          <Badge variant="secondary" className="text-xs">
                            SimilarWeb
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs opacity-50">
                            No SimilarWeb
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {summary.hasBuiltWith ? (
                          <Badge variant="secondary" className="text-xs">
                            BuiltWith
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs opacity-50">
                            No BuiltWith
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {session.analysisData.competitors.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Competitors analyzed:</p>
                        <div className="flex flex-wrap gap-1">
                          {session.analysisData.competitors.slice(0, 3).map((competitor) => (
                            <Badge key={competitor} variant="outline" className="text-xs">
                              {competitor}
                            </Badge>
                          ))}
                          {session.analysisData.competitors.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{session.analysisData.competitors.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {session.messages.length > 1 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Last conversation:</p>
                        <p className="text-sm mt-1 line-clamp-2">
                          {session.messages[session.messages.length - 1]?.content || 'No messages'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default SessionHistory
