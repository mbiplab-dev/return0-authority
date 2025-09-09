"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RealTimeMap } from "@/components/real-time-map"
import { AlertsNotifications } from "@/components/alerts-notifications"
import { TouristIdManagement } from "@/components/tourist-id-management"
import { MissingPersonEFir } from "@/components/missing-person-efir"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { HighRiskZones } from "@/components/high-risk-zones"
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
} from "lucide-react"
import { useTheme } from "next-themes"

export default function TouristSafetyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const { theme, setTheme } = useTheme()

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "map", label: "Real-Time Map", icon: MapPin },
    { id: "clusters", label: "Tourist Clusters & Heatmaps", icon: Users },
    { id: "high-risk", label: "High-Risk Zones", icon: Shield },
    { id: "alerts", label: "Alerts & Notifications", icon: AlertTriangle },
    { id: "records", label: "Digital Tourist ID Records", icon: FileText },
    { id: "missing", label: "Missing Person / E-FIR Cases", icon: Search },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  ]

  const quickStats = [
    {
      title: "Total Active Tourists",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Alerts Today",
      value: "23",
      change: "+5",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Missing Cases Logged",
      value: "3",
      change: "0",
      icon: Search,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "High-Risk Area Warnings",
      value: "7",
      change: "-2",
      icon: Shield,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ]

  const recentAlerts = [
    {
      id: 1,
      type: "Panic Button",
      location: "Marina Beach",
      time: "2 min ago",
      severity: "high",
      touristId: "TID-2024-001",
    },
    {
      id: 2,
      type: "Medical Emergency",
      location: "Fort Kochi",
      time: "15 min ago",
      severity: "medium",
      touristId: "TID-2024-002",
    },
    {
      id: 3,
      type: "Lost Tourist",
      location: "Mysore Palace",
      time: "32 min ago",
      severity: "low",
      touristId: "TID-2024-003",
    },
    {
      id: 4,
      type: "Suspicious Activity",
      location: "Goa Beach",
      time: "1 hour ago",
      severity: "medium",
      touristId: "TID-2024-004",
    },
  ]

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
              <p className="text-sm text-muted-foreground">Real-time incident response and monitoring system</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative hover-lift">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground pulse-alert">
                5
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
                      Latest panic button activations and incidents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {recentAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border border-border hover-lift ${alert.severity === "high" ? "pulse-alert" : ""}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              alert.severity === "high"
                                ? "bg-red-500"
                                : alert.severity === "medium"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-card-foreground">{alert.type}</p>
                              <Badge
                                variant={alert.severity === "high" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{alert.location}</p>
                            <p className="text-xs text-muted-foreground">ID: {alert.touristId}</p>
                            <p className="text-xs text-muted-foreground">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Dedicated Real-Time Map section */}
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

          {/* High-Risk Zones section */}
          {activeSection === "high-risk" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">High-Risk Zones Management</h2>
                  <p className="text-muted-foreground">
                    Mark, monitor, and manage high-risk areas with interactive zone mapping and activity logging
                  </p>
                </div>
              </div>
              <HighRiskZones />
            </div>
          )}

          {/* Alerts & Notifications section */}
          {activeSection === "alerts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Alerts & Notifications</h2>
                  <p className="text-muted-foreground">
                    Manage tourist safety alerts, panic button activations, and incident responses
                  </p>
                </div>
              </div>
              <AlertsNotifications />
            </div>
          )}

          {/* Digital Tourist ID Records section */}
          {activeSection === "records" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Digital Tourist ID Records</h2>
                  <p className="text-muted-foreground">
                    Search and manage tourist profiles, documents, and safety information
                  </p>
                </div>
              </div>
              <TouristIdManagement />
            </div>
          )}

          {/* Missing Person / E-FIR Cases section */}
          {activeSection === "missing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Missing Person / E-FIR Cases</h2>
                  <p className="text-muted-foreground">
                    Manage missing person cases, investigation timeline, and FIR documentation
                  </p>
                </div>
              </div>
              <MissingPersonEFir />
            </div>
          )}

          {/* Reports & Analytics section */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Reports & Analytics</h2>
                  <p className="text-muted-foreground">
                    Comprehensive analytics, trends, and exportable reports for decision making
                  </p>
                </div>
              </div>
              <ReportsAnalytics />
            </div>
          )}

          {/* Placeholder for other sections */}
          {!["dashboard", "map", "clusters", "high-risk", "alerts", "records", "missing", "reports"].includes(
            activeSection,
          ) && (
            <Card className="hover-lift shadow-soft">
              <CardHeader className="gradient-header">
                <CardTitle className="text-primary-foreground">
                  {navigationItems.find((item) => item.id === activeSection)?.label}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  This section will be implemented in the next phase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
