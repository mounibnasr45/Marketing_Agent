"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Globe, BarChart3, MessageCircle, Code, History, TrendingUp, Search } from "lucide-react"

const NavigationHeader = () => {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/similarweb", label: "SimilarWeb", icon: BarChart3 },
    { href: "/builtwith", label: "BuiltWith", icon: Code },
    { href: "/google-trends", label: "Trends", icon: TrendingUp },
    { href: "/keywords", label: "Keywords", icon: Search },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/history", label: "History", icon: History },
  ]

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Website Analyzer</span>
          </div>
          
          <nav className="flex space-x-2">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default NavigationHeader