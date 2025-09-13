"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RealTimeMap } from "@/components/real-time-map"
import { AlertsNotifications } from "@/components/alerts-notifications"
import { TouristIdManagement } from "@/components/tourist-id-management"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { HighRiskZones } from "@/components/high-risk-zones"
import { useAuthorityApi } from "@/hooks/useAuthorityApi"
import {
  MapPin,
  Users,
  AlertTriangle,
  FileText,
  Search,
  Bell,
  BarChart3,
  Shield,
  Menu,
  Sun,
  Moon,
  Settings,
  RefreshCw,
} from "lucide-react"
import { useTheme } from "next-themes"

interface DashboardStats {
  totalTourists: number
  alertsToday: number
  missingCases: number
  highRiskWarnings: number
  totalComplaints: number
  activeComplaints: number
  criticalComplaints: number
  emergencyComplaints: number
  resolvedComplaints: number
  resolutionRate: number
  averageResponseTime: number
}

export default function TouristSafetyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const { theme, setTheme } = useTheme()
  
  const {
    loading,
    error,
    fetchComplaints,
    fetchComplaintStats,
  } = useAuthorityApi()

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Fetch complaint statistics
      const statsResponse = await fetchComplaintStats('24h')
      if (statsResponse.data) {
        const stats = statsResponse.data.stats
        setDashboardStats({
          totalTourists: 2847, // This would come from user API
          alertsToday: stats.summary.total,
          missingCases: stats.breakdown.byCategory['missing_person'] || 0,
          highRiskWarnings: 7, // This would come from high-risk zones API
          totalComplaints: stats.summary.total,
          activeComplaints: stats.summary.active,
          criticalComplaints: stats.summary.critical,
          emergencyComplaints: stats.summary.emergency,
          resolvedComplaints: stats.summary.resolved,
          resolutionRate: stats.summary.resolutionRate,
          averageResponseTime: stats.summary.averageResponseTime,
        })
      }

      // Fetch recent alerts (complaints)
      const alertsResponse = await fetchComplaints({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      if (alertsResponse.data) {
        setRecentAlerts(alertsResponse.data.complaints.slice(0, 4))
      }
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "clusters", label: "Tourist Clusters", icon: Users },
    { id: "high-risk", label: "High-Risk Zones", icon: Shield },
    { id: "alerts", label: "Alerts & Notifications", icon: AlertTriangle },
    { id: "records", label: "Digital ID Records", icon: FileText },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  ]

  const quickStats = dashboardStats ? [
    {
      title: "Total Active Tourists",
      value: dashboardStats.totalTourists.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Alerts Today",
      value: dashboardStats.alertsToday.toString(),
      change: `+${Math.floor(Math.random() * 10)}`,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Missing Cases Active",
      value: dashboardStats.missingCases.toString(),
      change: "0",
      icon: Search,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Critical Incidents",
      value: dashboardStats.criticalComplaints.toString(),
      change: "-2",
      icon: Shield,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ] : []

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour(s) ago`
    return `${Math.floor(diffInMinutes / 1440)} day(s) ago`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col shadow-soft`}
      >
        <div className="p-4 border-b border-sidebar-border gradient-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-foreground/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-primary-foreground text-sm">Tourist Safety Dashboard</h1>
                <p className="text-xs text-primary-foreground/80">Police Officer</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200 hover-lift ${
                  activeSection === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-sidebar-border">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 hover-lift">
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover-lift">
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-card-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Tourist Safety Monitoring
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time incident response and monitoring system
                {dashboardStats && (
                  <span className="ml-2">
                    • Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadDashboardData}
              disabled={loading}
              className="hover-lift"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="relative hover-lift">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground pulse-alert">
                {dashboardStats?.alertsToday || 0}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover-lift"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Avatar className="hover-lift">
              <AvatarImage src="/police-officer.png" />
              <AvatarFallback>PO</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background to-muted/30">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Loading State */}
              {loading && !dashboardStats && (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading dashboard data...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Error loading dashboard data: {error}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadDashboardData}
                        className="ml-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="hover-lift shadow-soft">
                        <CardHeader
                          className={`flex flex-row items-center justify-between space-y-0 pb-2 ${stat.bgColor} rounded-t-lg`}
                        >
                          <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">
                            <span
                              className={
                                stat.change.startsWith("+")
                                  ? "text-green-600 dark:text-green-400"
                                  : stat.change === "0"
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "text-red-600 dark:text-red-400"
                              }
                            >
                              {stat.change}
                            </span>{" "}
                            from yesterday
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 hover-lift shadow-soft">
                  <CardHeader className="gradient-header">
                    <CardTitle className="flex items-center gap-2 text-primary-foreground">
                      <MapPin className="w-5 h-5" />
                      Live Tourist Safety Map
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Real-time tourist locations, clusters, and safety zones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <RealTimeMap />
                  </CardContent>
                </Card>

                <Card className="hover-lift shadow-soft">
                  <CardHeader className="gradient-header">
                    <CardTitle className="flex items-center gap-2 text-primary-foreground">
                      <AlertTriangle className="w-5 h-5" />
                      Recent Alerts
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Latest incidents and emergency reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {recentAlerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No recent alerts
                        </p>
                      ) : (
                        recentAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border border-border hover-lift ${alert.severity === "critical" ? "pulse-alert" : ""}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                alert.severity === "critical"
                                  ? "bg-red-500"
                                  : alert.severity === "high"
                                    ? "bg-orange-500"
                                    : alert.severity === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-card-foreground">
                                  {alert.title || alert.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                                <Badge
                                  className={getSeverityColor(alert.severity)}
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{alert.location}</p>
                              <p className="text-xs text-muted-foreground">
                                Tourist: {alert.touristName || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(alert.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover-lift shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardStats.resolutionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.resolvedComplaints} of {dashboardStats.totalComplaints} resolved
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardStats.averageResponseTime.toFixed(1)} min
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Emergency response time
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardStats.activeComplaints}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pending resolution
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Other Sections with API Integration */}
          {activeSection === "alerts" && <AlertsNotifications />}
          {activeSection === "records" && <TouristIdManagement />}
          {activeSection === "reports" && <ReportsAnalytics />}
          {activeSection === "high-risk" && <HighRiskZones />}
          
          {/* Placeholder sections */}
          {(activeSection === "map" || activeSection === "clusters") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Tourist Safety Map & Clusters</h2>
                  <p className="text-muted-foreground">
                    Monitor tourist locations, safety zones, and density patterns in real-time
                  </p>
                </div>
              </div>
              <RealTimeMap />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}