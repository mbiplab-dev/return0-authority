"use client"

import { useState, useEffect, useCallback } from "react"
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
import { toast } from "@/components/ui/use-toast"
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
  RefreshCw,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { useAuthorityApi } from "@/hooks/useAuthorityApi"

// Types (matching the hook)
interface Alert {
  id: string;
  complaintId: string;
  type: "panic_button" | "medical_emergency" | "lost_tourist" | "suspicious_activity" | "theft" | "accident";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved" | "escalated";
  touristId: string;
  touristName: string;
  touristEmail?: string;
  touristPhone?: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  timestamp: string;
  description: string;
  title: string;
  contactInfo: string;
  reportedBy: string;
  assignedOfficer?: string;
  assignedDepartment?: string;
  responseTime?: string;
  notes?: string;
  isEmergencySOS: boolean;
  sosActivatedAt?: string;
}

export function AlertsNotifications() {
  const {
    loading,
    error,
    fetchComplaints,
    fetchComplaintStats,
    acknowledgeComplaint,
    resolveComplaint,
    escalateToFIR,
    addCommunication,
  } = useAuthorityApi();

  // State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    critical: 0,
    averageResponseTime: 0,
    resolutionRate: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Dialog states
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState("");
  const [communicationDialog, setCommunicationDialog] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load complaints with current filters
  const loadComplaints = useCallback(async (showLoadingState = true) => {
    try {
      if (!showLoadingState) setActionLoading(true);

      const filters = {
        page: currentPage,
        limit: pageSize,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(severityFilter !== 'all' && { urgency: severityFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const response = await fetchComplaints(filters);
      
      if (response.data) {
        setAlerts(response.data.complaints);
        setFilteredAlerts(response.data.complaints);
        setPagination(response.data.pagination);
        setLastRefresh(new Date());
      }

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      if (!showLoadingState) setActionLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, severityFilter, searchTerm, fetchComplaints]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetchComplaintStats('24h');
      if (response.data) {
        setStats({
          active: response.data.stats.summary.active,
          critical: response.data.stats.summary.critical,
          averageResponseTime: response.data.stats.summary.averageResponseTime,
          resolutionRate: response.data.stats.summary.resolutionRate,
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [fetchComplaintStats]);

  // Initial load
  useEffect(() => {
    loadComplaints();
    loadStats();
  }, [loadComplaints, loadStats]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadComplaints(false);
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadComplaints, loadStats]);

  // Handle filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, severityFilter]);

  // Load complaints when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== 'all' || severityFilter !== 'all') {
        loadComplaints();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, severityFilter, loadComplaints]);

  // Utility functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "acknowledged":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "escalated":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "panic_button":
        return <Zap className="w-4 h-4" />;
      case "medical_emergency":
        return <Phone className="w-4 h-4" />;
      case "lost_tourist":
        return <Search className="w-4 h-4" />;
      case "suspicious_activity":
        return <Shield className="w-4 h-4" />;
      case "theft":
        return <AlertTriangle className="w-4 h-4" />;
      case "accident":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Action handlers
  const handleAcknowledge = async (alertId: string) => {
    try {
      setActionLoading(true);
      const response = await acknowledgeComplaint(alertId, "Current Officer");
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Complaint acknowledged successfully",
        });
        loadComplaints(false);
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to acknowledge complaint",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      setActionLoading(true);
      const response = await resolveComplaint(
        alertId,
        "Complaint resolved by authority",
        "Issue addressed and resolved",
        "Current Officer"
      );
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Complaint resolved successfully",
        });
        loadComplaints(false);
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to resolve complaint",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateToFIR = async () => {
    if (!selectedAlert || !escalationNotes.trim()) return;

    try {
      setActionLoading(true);
      const response = await escalateToFIR(
        selectedAlert.id,
        escalationNotes,
        "Current Officer"
      );
      
      if (response.data) {
        toast({
          title: "Success",
          description: `Complaint escalated to FIR: ${response.data.complaint.firNumber}`,
        });
        setEscalationDialog(false);
        setEscalationNotes("");
        setSelectedAlert(null);
        loadComplaints(false);
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to escalate complaint",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCommunication = async () => {
    if (!selectedAlert || !communicationMessage.trim()) return;

    try {
      setActionLoading(true);
      const response = await addCommunication(
        selectedAlert.id,
        communicationMessage,
        "Current Officer"
      );
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        setCommunicationDialog(false);
        setCommunicationMessage("");
        setSelectedAlert(null);
        loadComplaints(false);
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

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
            <div className="text-2xl font-bold text-red-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Zap className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Highest priority incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageResponseTime.toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadComplaints()}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
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

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadComplaints()} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Management ({pagination.total})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading alerts...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts found matching your criteria
            </div>
          ) : (
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
                          {alert.isEmergencySOS && (
                            <Badge variant="destructive" className="text-xs">
                              EMERGENCY SOS
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            ID: {alert.complaintId}
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
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Contact: {alert.contactInfo}</span>
                          <span>Reported by: {alert.reportedBy}</span>
                          {alert.assignedOfficer && <span>Assigned to: {alert.assignedOfficer}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.status === "active" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setEscalationDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Escalate to FIR
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setCommunicationDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Send Message
                          </Button>
                        </>
                      )}
                      {alert.status === "acknowledged" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleResolve(alert.id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setEscalationDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Escalate to FIR
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setCommunicationDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Send Message
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog} onOpenChange={setEscalationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to FIR</DialogTitle>
            <DialogDescription>
              This will create a formal FIR (First Information Report) for complaint {selectedAlert?.complaintId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalation-notes">Additional Notes *</Label>
              <Textarea
                id="escalation-notes"
                placeholder="Provide additional details for the FIR..."
                value={escalationNotes}
                onChange={(e) => setEscalationNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
            {selectedAlert && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Alert Details:</p>
                <p className="text-sm text-muted-foreground">Tourist: {selectedAlert.touristName}</p>
                <p className="text-sm text-muted-foreground">Location: {selectedAlert.location}</p>
                <p className="text-sm text-muted-foreground">Description: {selectedAlert.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleEscalateToFIR} 
              disabled={!escalationNotes.trim() || actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Create FIR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={communicationDialog} onOpenChange={setCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Tourist</DialogTitle>
            <DialogDescription>
              Send a message regarding complaint {selectedAlert?.complaintId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="communication-message">Message *</Label>
              <Textarea
                id="communication-message"
                placeholder="Type your message to the tourist..."
                value={communicationMessage}
                onChange={(e) => setCommunicationMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
            {selectedAlert && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Sending to:</p>
                <p className="text-sm text-muted-foreground">Tourist: {selectedAlert.touristName}</p>
                <p className="text-sm text-muted-foreground">Contact: {selectedAlert.contactInfo}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommunicationDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCommunication} 
              disabled={!communicationMessage.trim() || actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}