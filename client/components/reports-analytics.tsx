"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Download, FileText, TrendingUp, TrendingDown, Users, AlertTriangle, MapPin } from "lucide-react"

const monthlyIncidents = [
  { month: "Jan", incidents: 45, resolved: 42, pending: 3 },
  { month: "Feb", incidents: 52, resolved: 48, pending: 4 },
  { month: "Mar", incidents: 38, resolved: 36, pending: 2 },
  { month: "Apr", incidents: 61, resolved: 55, pending: 6 },
  { month: "May", incidents: 73, resolved: 68, pending: 5 },
  { month: "Jun", incidents: 89, resolved: 82, pending: 7 },
  { month: "Jul", incidents: 95, resolved: 88, pending: 7 },
  { month: "Aug", incidents: 87, resolved: 81, pending: 6 },
  { month: "Sep", incidents: 76, resolved: 72, pending: 4 },
  { month: "Oct", incidents: 68, resolved: 64, pending: 4 },
  { month: "Nov", incidents: 59, resolved: 56, pending: 3 },
  { month: "Dec", incidents: 42, resolved: 40, pending: 2 },
]

const touristFlow = [
  { time: "00:00", tourists: 120 },
  { time: "04:00", tourists: 80 },
  { time: "08:00", tourists: 450 },
  { time: "12:00", tourists: 890 },
  { time: "16:00", tourists: 1200 },
  { time: "20:00", tourists: 950 },
  { time: "23:59", tourists: 320 },
]

const incidentTypes = [
  { name: "Medical Emergency", value: 35, color: "#ef4444" },
  { name: "Lost Tourist", value: 28, color: "#f97316" },
  { name: "Panic Button", value: 18, color: "#eab308" },
  { name: "Theft/Crime", value: 12, color: "#8b5cf6" },
  { name: "Suspicious Activity", value: 7, color: "#06b6d4" },
]

const locationHotspots = [
  { location: "Marina Beach", incidents: 45, risk: "High", tourists: 2500 },
  { location: "Fort Kochi", incidents: 32, risk: "Medium", tourists: 1800 },
  { location: "Mysore Palace", incidents: 28, risk: "Medium", tourists: 2200 },
  { location: "Goa Beaches", incidents: 38, risk: "High", tourists: 3200 },
  { location: "Kerala Backwaters", incidents: 15, risk: "Low", tourists: 1200 },
  { location: "Hampi Ruins", incidents: 22, risk: "Medium", tourists: 1600 },
]

const responseMetrics = [
  { metric: "Average Response Time", value: "4.2 min", trend: "down", change: "-12%" },
  { metric: "Resolution Rate", value: "94.2%", trend: "up", change: "+3.1%" },
  { metric: "Tourist Satisfaction", value: "4.7/5", trend: "up", change: "+0.2" },
  { metric: "Active Officers", value: "156", trend: "up", change: "+8" },
]

export function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [reportType, setReportType] = useState("overview")

  const exportReport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting ${reportType} report as ${format}`)
    // In a real app, this would generate and download the file
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="incidents">Incident Analysis</SelectItem>
              <SelectItem value="tourists">Tourist Flow</SelectItem>
              <SelectItem value="locations">Location Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport("pdf")} className="hover-lift">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport("csv")} className="hover-lift">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {responseMetrics.map((metric, index) => (
          <Card key={index} className="hover-lift shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <p className="text-2xl font-bold text-card-foreground">{metric.value}</p>
                </div>
                <div className={`flex items-center gap-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {metric.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incident Trends</TabsTrigger>
          <TabsTrigger value="flow">Tourist Flow</TabsTrigger>
          <TabsTrigger value="types">Incident Types</TabsTrigger>
          <TabsTrigger value="locations">Location Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-6">
          <Card className="hover-lift shadow-soft">
            <CardHeader className="gradient-header">
              <CardTitle className="flex items-center gap-2 text-primary-foreground">
                <BarChart className="w-5 h-5" />
                Monthly Incident Trends
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Track incident patterns and resolution rates over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyIncidents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" fill="hsl(var(--primary))" name="Total Incidents" />
                  <Bar dataKey="resolved" fill="hsl(var(--accent))" name="Resolved" />
                  <Bar dataKey="pending" fill="hsl(var(--secondary))" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-6">
          <Card className="hover-lift shadow-soft">
            <CardHeader className="gradient-header">
              <CardTitle className="flex items-center gap-2 text-primary-foreground">
                <Users className="w-5 h-5" />
                Daily Tourist Flow Pattern
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Monitor tourist density throughout the day for resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={touristFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="tourists"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                    name="Active Tourists"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover-lift shadow-soft">
              <CardHeader className="gradient-header">
                <CardTitle className="flex items-center gap-2 text-primary-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  Incident Type Distribution
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Breakdown of incident categories for resource planning
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incidentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Incident Statistics
                </CardTitle>
                <CardDescription>Detailed breakdown by incident type</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {incidentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{type.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((type.value / 100) * 150)} cases
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card className="hover-lift shadow-soft">
            <CardHeader className="gradient-header">
              <CardTitle className="flex items-center gap-2 text-primary-foreground">
                <MapPin className="w-5 h-5" />
                Location Risk Analysis
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Identify high-risk areas and tourist hotspots for patrol optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {locationHotspots.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover-lift"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{location.location}</h3>
                        <Badge
                          variant={
                            location.risk === "High"
                              ? "destructive"
                              : location.risk === "Medium"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {location.risk} Risk
                        </Badge>
                      </div>
                      <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                        <span>{location.incidents} incidents</span>
                        <span>{location.tourists.toLocaleString()} tourists/day</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-card-foreground">
                        {((location.incidents / location.tourists) * 1000).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">incidents/1k tourists</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
