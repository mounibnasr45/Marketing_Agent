"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
export type AnalysisState = "idle" | "loading" | "similarweb" | "analyzing-competitors" | "builtwith" | "chat" | "error"

export interface AnalysisData {
  domain: string
  competitors: string[]
  similarWebData: any
  builtWithData: any
  apiResponse?: any
}

export interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export interface ChatSession {
  sessionId: string
  messages: Message[]
  analysisData: AnalysisData
  createdAt: Date
  lastActivity: Date
}

export interface AppState {
  // Current session data
  currentSession: {
    domain: string
    analysisState: AnalysisState
    analysisData: AnalysisData | null
    apiResponse: any
    competitors: string[]
    messages: Message[]
    progress: number
    competitorProgress: number
    currentCompetitor: string
    error: string
    analysisType: "similarweb" | "builtwith" | "both"
  }
  
  // Session history
  sessionHistory: ChatSession[]
  
  // Settings
  settings: {
    saveToLocalStorage: boolean
    maxSessions: number
    userId: string
  }
}

// Action types
export type AppAction =
  | { type: 'SET_DOMAIN'; payload: string }
  | { type: 'SET_ANALYSIS_STATE'; payload: AnalysisState }
  | { type: 'SET_ANALYSIS_DATA'; payload: AnalysisData }
  | { type: 'SET_API_RESPONSE'; payload: any }
  | { type: 'SET_COMPETITORS'; payload: string[] }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_COMPETITOR_PROGRESS'; payload: number }
  | { type: 'SET_CURRENT_COMPETITOR'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_ANALYSIS_TYPE'; payload: "similarweb" | "builtwith" | "both" }
  | { type: 'RESET_SESSION' }
  | { type: 'SAVE_SESSION' }
  | { type: 'LOAD_SESSION'; payload: string }
  | { type: 'RESTORE_STATE'; payload: AppState }
  | { type: 'CLEAR_ALL_SESSIONS' }

// Initial state
const initialState: AppState = {
  currentSession: {
    domain: "",
    analysisState: "idle",
    analysisData: null,
    apiResponse: null,
    competitors: [],
    messages: [],
    progress: 0,
    competitorProgress: 0,
    currentCompetitor: "",
    error: "",
    analysisType: "both"
  },
  sessionHistory: [],
  settings: {
    saveToLocalStorage: true,
    maxSessions: 10,
    userId: ""
  }
}

// Generate consistent user ID
const generateUserId = (): string => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('builtwith_user_id')
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('builtwith_user_id', userId)
    }
    return userId
  }
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_DOMAIN':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          domain: action.payload
        }
      }
    
    case 'SET_ANALYSIS_STATE':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          analysisState: action.payload
        }
      }
    
    case 'SET_ANALYSIS_DATA':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          analysisData: action.payload
        }
      }
    
    case 'SET_API_RESPONSE':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          apiResponse: action.payload
        }
      }
    
    case 'SET_COMPETITORS':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          competitors: action.payload
        }
      }
    
    case 'SET_MESSAGES':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: action.payload
        }
      }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: [...state.currentSession.messages, action.payload]
        }
      }
    
    case 'SET_PROGRESS':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: action.payload
        }
      }
    
    case 'SET_COMPETITOR_PROGRESS':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          competitorProgress: action.payload
        }
      }
    
    case 'SET_CURRENT_COMPETITOR':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentCompetitor: action.payload
        }
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          error: action.payload
        }
      }
    
    case 'SET_ANALYSIS_TYPE':
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          analysisType: action.payload
        }
      }
    
    case 'RESET_SESSION':
      return {
        ...state,
        currentSession: {
          ...initialState.currentSession,
          domain: "",
          analysisState: "idle"
        }
      }
    
    case 'SAVE_SESSION':
      if (state.currentSession.analysisData && state.currentSession.domain) {
        const newSession: ChatSession = {
          sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          messages: state.currentSession.messages,
          analysisData: state.currentSession.analysisData,
          createdAt: new Date(),
          lastActivity: new Date()
        }
        
        const updatedHistory = [newSession, ...state.sessionHistory.slice(0, state.settings.maxSessions - 1)]
        
        return {
          ...state,
          sessionHistory: updatedHistory
        }
      }
      return state
    
    case 'LOAD_SESSION':
      const sessionToLoad = state.sessionHistory.find(s => s.sessionId === action.payload)
      if (sessionToLoad) {
        return {
          ...state,
          currentSession: {
            ...state.currentSession,
            domain: sessionToLoad.analysisData.domain,
            analysisData: sessionToLoad.analysisData,
            competitors: sessionToLoad.analysisData.competitors,
            messages: sessionToLoad.messages,
            analysisState: "chat" // Load directly into chat view
          }
        }
      }
      return state
    
    case 'RESTORE_STATE':
      return {
        ...action.payload,
        settings: {
          ...action.payload.settings,
          userId: generateUserId()
        }
      }
    
    case 'CLEAR_ALL_SESSIONS':
      return {
        ...state,
        sessionHistory: [],
        currentSession: {
          ...initialState.currentSession
        }
      }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider component
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    settings: {
      ...initialState.settings,
      userId: generateUserId()
    }
  })

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.settings.saveToLocalStorage && typeof window !== 'undefined') {
      const stateToSave = {
        ...state,
        currentSession: {
          ...state.currentSession,
          // Don't save loading/error states
          analysisState: state.currentSession.analysisState === 'loading' || 
                        state.currentSession.analysisState === 'error' ? 'idle' : state.currentSession.analysisState,
          error: '',
          progress: 0,
          competitorProgress: 0,
          currentCompetitor: ''
        }
      }
      localStorage.setItem('builtwith_app_state', JSON.stringify(stateToSave))
      console.log('💾 State saved to localStorage')
    }
  }, [state])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('builtwith_app_state')
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState)
          // Restore timestamps as Date objects
          const restoredState = {
            ...parsedState,
            sessionHistory: parsedState.sessionHistory?.map((session: any) => ({
              ...session,
              createdAt: new Date(session.createdAt),
              lastActivity: new Date(session.lastActivity),
              messages: session.messages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })) || []
            })) || [],
            currentSession: {
              ...parsedState.currentSession,
              messages: parsedState.currentSession?.messages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })) || []
            }
          }
          dispatch({ type: 'RESTORE_STATE', payload: restoredState })
          console.log('📂 State restored from localStorage')
        } catch (error) {
          console.error('❌ Error restoring state from localStorage:', error)
        }
      }
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

// Helper hooks for specific state slices
export const useCurrentSession = () => {
  const { state } = useAppState()
  return state.currentSession
}

export const useSessionHistory = () => {
  const { state } = useAppState()
  return state.sessionHistory
}

export const useSettings = () => {
  const { state } = useAppState()
  return state.settings
}
