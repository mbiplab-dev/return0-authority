"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthorityApi } from "@/hooks/useAuthorityApi"
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
  LineChart,
  Line,
} from "recharts"
import { Download, FileText, TrendingUp, TrendingDown, Users, AlertTriangle, MapPin, RefreshCw } from "lucide-react"

interface AnalyticsData {
  monthlyIncidents: Array<{
    month: string
    incidents: number
    resolved: number
    pending: number
  }>
  incidentTypes: Array<{
    name: string
    value: number
    color: string
  }>
  locationHotspots: Array<{
    location: string
    incidents: number
    risk: string
    tourists: number
  }>
  responseMetrics: Array<{
    metric: string
    value: string
    trend: 'up' | 'down'
    change: string
  }>
  touristFlow: Array<{
    time: string
    tourists: number
  }>
}

export function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [reportType, setReportType] = useState("overview")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    loading,
    error: apiError,
    fetchComplaintStats,
    fetchComplaints,
  } = useAuthorityApi()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch complaint statistics
      const statsResponse = await fetchComplaintStats(timeRange)
      
      if (statsResponse.error) {
        throw new Error(statsResponse.error)
      }

      if (statsResponse.data) {
        const stats = statsResponse.data.stats

        // Fetch detailed complaints data for analysis
        const complaintsResponse = await fetchComplaints({
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        const complaints = complaintsResponse.data?.complaints || []

        // Transform data for charts
        const transformedData: AnalyticsData = {
          monthlyIncidents: generateMonthlyData(complaints),
          incidentTypes: Object.entries(stats.breakdown.byCategory || {}).map(([key, value], index) => ({
            name: formatCategoryName(key),
            value: value as number,
            color: getTypeColor(index)
          })),
          locationHotspots: generateLocationHotspots(complaints),
          responseMetrics: [
            {
              metric: "Resolution Rate", 
              value: `${stats.summary.resolutionRate.toFixed(1)}%`,
              trend: "up",
              change: "+3.1%"
            },
            {
              metric: "Tourist Satisfaction",
              value: "4.7/5",
              trend: "up", 
              change: "+0.2"
            },
            {
              metric: "Active Cases",
              value: stats.summary.active.toString(),
              trend: stats.summary.active < 10 ? "down" : "up",
              change: `${stats.summary.active < 10 ? '-' : '+'}${Math.abs(stats.summary.active - 8)}`
            }
          ],
          touristFlow: generateTouristFlow()
        }

        setAnalyticsData(transformedData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthlyData = (complaints: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const data = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = months[date.getMonth()]
      
      const monthComplaints = complaints.filter(c => {
        const complaintDate = new Date(c.timestamp)
        return complaintDate.getMonth() === date.getMonth() && 
               complaintDate.getFullYear() === date.getFullYear()
      })

      data.push({
        month: monthName,
        incidents: monthComplaints.length,
        resolved: monthComplaints.filter(c => c.status === 'resolved').length,
        pending: monthComplaints.filter(c => ['active', 'acknowledged'].includes(c.status)).length
      })
    }

    return data
  }

  const generateLocationHotspots = (complaints: any[]) => {
    const locationCounts: { [key: string]: number } = {}
    
    complaints.forEach(complaint => {
      if (complaint.location) {
        locationCounts[complaint.location] = (locationCounts[complaint.location] || 0) + 1
      }
    })

    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([location, incidents]) => ({
        location,
        incidents,
        risk: incidents > 20 ? "High" : incidents > 10 ? "Medium" : "Low",
        tourists: Math.floor(incidents * 50 + Math.random() * 1000) // Mock tourist count
      }))
  }

  const generateTouristFlow = () => {
    const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
    return times.map(time => ({
      time,
      tourists: Math.floor(Math.random() * 1000) + 200
    }))
  }

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTypeColor = (index: number) => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#06b6d4", "#10b981"]
    return colors[index % colors.length]
  }

  const exportReport = (format: string) => {
    const data = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analyticsData
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tourist-safety-report-${reportType}-${timeRange}.${format === 'pdf' ? 'json' : 'json'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading analytics data...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Error loading analytics: {error}</span>
              <Button variant="outline" size="sm" onClick={loadAnalyticsData} className="ml-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    )
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

          <Button 
            variant="outline" 
            onClick={loadAnalyticsData}
            disabled={loading}
            className="hover-lift"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
        {analyticsData.responseMetrics.map((metric, index) => (
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
                <BarChart data={analyticsData.monthlyIncidents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" fill="#f97316" name="Total Incidents" />
                  <Bar dataKey="resolved" fill="#eab308" name="Resolved" />
                  <Bar dataKey="pending" fill="#10b981" name="Pending" />
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
                <AreaChart data={analyticsData.touristFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="tourists"
                    stroke="#eab308"
                    fill="#10b981"
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
                      data={analyticsData.incidentTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.incidentTypes.map((entry, index) => (
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
                  {analyticsData.incidentTypes.map((type, index) => {
                    const total = analyticsData.incidentTypes.reduce((sum, t) => sum + t.value, 0)
                    const percentage = total > 0 ? (type.value / total * 100) : 0
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{percentage.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">{type.value} cases</div>
                        </div>
                      </div>
                    )
                  })}
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
                {analyticsData.locationHotspots.map((location, index) => (
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