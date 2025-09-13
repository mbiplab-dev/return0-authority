"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Clock,
  MapPin,
  User,
  CheckCircle,
  FileText,
  Filter,
  Search,
  Bell,
  Zap,
  Phone,
  Shield,
} from "lucide-react"

interface Alert {
  id: string
  type: "panic_button" | "medical_emergency" | "lost_tourist" | "suspicious_activity" | "theft" | "accident"
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "acknowledged" | "resolved" | "escalated"
  touristId: string
  touristName: string
  location: string
  coordinates: { lat: number; lng: number }
  timestamp: string
  description: string
  reportedBy: string
  assignedOfficer?: string
  responseTime?: string
  notes?: string
}

export function AlertsNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "ALT-2024-001",
      type: "panic_button",
      severity: "critical",
      status: "active",
      touristId: "TID-2024-001",
      touristName: "John Smith",
      location: "Marina Beach, Chennai",
      coordinates: { lat: 13.0827, lng: 80.2707 },
      timestamp: "2024-01-15T14:30:00Z",
      description: "Tourist activated panic button. No response to initial contact attempts.",
      reportedBy: "Automated System",
    },
    {
      id: "ALT-2024-002",
      type: "medical_emergency",
      severity: "high",
      status: "acknowledged",
      touristId: "TID-2024-002",
      touristName: "Sarah Johnson",
      location: "Fort Kochi, Kerala",
      coordinates: { lat: 9.9312, lng: 76.2673 },
      timestamp: "2024-01-15T14:15:00Z",
      description: "Tourist reported chest pain and difficulty breathing.",
      reportedBy: "Tourist Companion",
      assignedOfficer: "Officer Raj Kumar",
    },
    {
      id: "ALT-2024-003",
      type: "lost_tourist",
      severity: "medium",
      status: "active",
      touristId: "TID-2024-003",
      touristName: "Mike Chen",
      location: "Mysore Palace, Karnataka",
      coordinates: { lat: 12.3052, lng: 76.6551 },
      timestamp: "2024-01-15T13:45:00Z",
      description: "Tourist separated from group during palace tour. Last seen near the main entrance.",
      reportedBy: "Tour Guide",
    },
    {
      id: "ALT-2024-004",
      type: "suspicious_activity",
      severity: "medium",
      status: "resolved",
      touristId: "TID-2024-004",
      touristName: "Emma Wilson",
      location: "Goa Beach, Goa",
      coordinates: { lat: 15.2993, lng: 74.124 },
      timestamp: "2024-01-15T12:30:00Z",
      description: "Tourist reported being followed by unknown individuals.",
      reportedBy: "Tourist",
      assignedOfficer: "Officer Priya Sharma",
      responseTime: "8 minutes",
    },
  ])

  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [escalationDialog, setEscalationDialog] = useState(false)
  const [escalationNotes, setEscalationNotes] = useState("")

  // Filter alerts based on search and filters
  useEffect(() => {
    const filtered = alerts.filter((alert) => {
      const matchesSearch =
        alert.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.touristId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || alert.status === statusFilter
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter

      return matchesSearch && matchesStatus && matchesSeverity
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, statusFilter, severityFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-orange-500 text-white"
      case "low":
        return "bg-yellow-500 text-black"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "acknowledged":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "escalated":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "panic_button":
        return <Zap className="w-4 h-4" />
      case "medical_emergency":
        return <Phone className="w-4 h-4" />
      case "lost_tourist":
        return <Search className="w-4 h-4" />
      case "suspicious_activity":
        return <Shield className="w-4 h-4" />
      case "theft":
        return <AlertTriangle className="w-4 h-4" />
      case "accident":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const updateAlertStatus = (alertId: string, newStatus: Alert["status"], notes?: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: newStatus,
              notes: notes || alert.notes,
              assignedOfficer: newStatus === "acknowledged" ? "Current Officer" : alert.assignedOfficer,
            }
          : alert,
      ),
    )
  }

  const escalateToFIR = (alertId: string) => {
    updateAlertStatus(alertId, "escalated", escalationNotes)
    setEscalationDialog(false)
    setEscalationNotes("")
    setSelectedAlert(null)
  }

  const activeAlertsCount = alerts.filter((alert) => alert.status === "active").length
  const criticalAlertsCount = alerts.filter((alert) => alert.severity === "critical").length

  return (
    <div className="space-y-6">
      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Zap className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{criticalAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Highest priority incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6.2 min</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Alert Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search Alerts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by tourist name, ID, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity-filter">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alert Management ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-card-foreground">{alert.touristName}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                        <Badge variant="outline" className={getStatusColor(alert.status)}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          ID: {alert.touristId}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-card-foreground mb-2">{alert.description}</p>
                      {alert.assignedOfficer && (
                        <p className="text-xs text-muted-foreground">Assigned to: {alert.assignedOfficer}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {alert.status === "active" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "acknowledged")}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAlert(alert)
                            setEscalationDialog(true)
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Escalate to FIR
                        </Button>
                      </>
                    )}
                    {alert.status === "acknowledged" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "resolved")}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAlert(alert)
                            setEscalationDialog(true)
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Escalate to FIR
                        </Button>
                      </>
                    )}
                    {alert.status === "resolved" && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                    {alert.status === "escalated" && (
                      <Badge variant="outline" className="text-purple-600">
                        <FileText className="w-3 h-3 mr-1" />
                        FIR Created
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog} onOpenChange={setEscalationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to FIR</DialogTitle>
            <DialogDescription>
              This will create a formal FIR (First Information Report) for alert {selectedAlert?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalation-notes">Additional Notes</Label>
              <Textarea
                id="escalation-notes"
                placeholder="Provide additional details for the FIR..."
                value={escalationNotes}
                onChange={(e) => setEscalationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAlert && escalateToFIR(selectedAlert.id)}>Create FIR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
