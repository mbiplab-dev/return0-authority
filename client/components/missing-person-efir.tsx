"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  FileText,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Download,
  Plus,
  Eye,
  Shield,
  Activity,
} from "lucide-react"

interface MissingPersonCase {
  id: string
  caseNumber: string
  touristInfo: {
    id: string
    name: string
    age: number
    nationality: string
    photo: string
    passportNumber: string
    phone: string
    email: string
  }
  caseDetails: {
    reportedDate: string
    lastSeenDate: string
    lastSeenLocation: string
    lastSeenCoordinates: { lat: number; lng: number }
    reportedBy: string
    reporterContact: string
    circumstances: string
    description: string
  }
  investigation: {
    assignedOfficer: string
    priority: "low" | "medium" | "high" | "critical"
    status: "open" | "in_investigation" | "closed" | "resolved"
    updates: Array<{
      date: string
      officer: string
      update: string
      type: "info" | "lead" | "evidence" | "contact"
    }>
  }
  contacts: {
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email: string
    }
    localContacts: Array<{
      name: string
      phone: string
      relationship: string
    }>
  }
  firDetails?: {
    firNumber: string
    filedDate: string
    station: string
    sections: string[]
    status: "filed" | "under_investigation" | "chargesheet_filed" | "closed"
  }
}

export function MissingPersonEFir() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<MissingPersonCase | null>(null)
  const [caseDialog, setCaseDialog] = useState(false)
  const [updateDialog, setUpdateDialog] = useState(false)
  const [newUpdate, setNewUpdate] = useState("")
  const [updateType, setUpdateType] = useState<"info" | "lead" | "evidence" | "contact">("info")

  // Mock missing person cases data
  const [cases, setCases] = useState<MissingPersonCase[]>([
    {
      id: "MP-2024-001",
      caseNumber: "MP/CHN/2024/001",
      touristInfo: {
        id: "TID-2024-003",
        name: "Mike Chen",
        age: 35,
        nationality: "Australia",
        photo: "/tourist-3.jpg",
        passportNumber: "AU456789123",
        phone: "+61-2-9876-5432",
        email: "mike.chen@email.com",
      },
      caseDetails: {
        reportedDate: "2024-01-15T14:00:00Z",
        lastSeenDate: "2024-01-15T13:45:00Z",
        lastSeenLocation: "Mysore Palace, Karnataka",
        lastSeenCoordinates: { lat: 12.3052, lng: 76.6551 },
        reportedBy: "Tour Guide - Ramesh Kumar",
        reporterContact: "+91-98765-43210",
        circumstances:
          "Tourist separated from group during palace tour. Last seen near the main entrance around 1:45 PM.",
        description:
          "Male, 35 years, 5'8\" height, wearing blue shirt and khaki pants, carrying a black backpack with camera equipment.",
      },
      investigation: {
        assignedOfficer: "Inspector Priya Sharma",
        priority: "high",
        status: "in_investigation",
        updates: [
          {
            date: "2024-01-15T14:30:00Z",
            officer: "Inspector Priya Sharma",
            update: "Case registered. Initial search of palace premises conducted. CCTV footage being reviewed.",
            type: "info",
          },
          {
            date: "2024-01-15T16:00:00Z",
            officer: "Constable Raj Kumar",
            update: "CCTV shows tourist leaving palace at 2:10 PM through east gate. Appeared to be following someone.",
            type: "evidence",
          },
          {
            date: "2024-01-15T18:30:00Z",
            officer: "Inspector Priya Sharma",
            update:
              "Local taxi drivers questioned. One driver remembers dropping a foreign tourist matching description at railway station.",
            type: "lead",
          },
        ],
      },
      contacts: {
        emergencyContact: {
          name: "Lisa Chen",
          relationship: "Sister",
          phone: "+61-2-9876-5433",
          email: "lisa.chen@email.com",
        },
        localContacts: [
          {
            name: "ITC Grand Chola Reception",
            phone: "+91-44-2220-0000",
            relationship: "Hotel",
          },
        ],
      },
      firDetails: {
        firNumber: "FIR/MYS/2024/0156",
        filedDate: "2024-01-15T15:00:00Z",
        station: "Mysore Palace Police Station",
        sections: ["Section 365 IPC - Kidnapping", "Section 506 IPC - Criminal Intimidation"],
        status: "under_investigation",
      },
    },
    {
      id: "MP-2024-002",
      caseNumber: "MP/GOA/2024/002",
      touristInfo: {
        id: "TID-2024-005",
        name: "Emma Wilson",
        age: 28,
        nationality: "United Kingdom",
        photo: "/tourist-4.jpg",
        passportNumber: "UK789123456",
        phone: "+44-20-7946-0958",
        email: "emma.wilson@email.com",
      },
      caseDetails: {
        reportedDate: "2024-01-14T20:00:00Z",
        lastSeenDate: "2024-01-14T18:30:00Z",
        lastSeenLocation: "Anjuna Beach, Goa",
        lastSeenCoordinates: { lat: 15.5736, lng: 73.7349 },
        reportedBy: "Friend - Sarah Thompson",
        reporterContact: "+44-20-7946-0959",
        circumstances: "Tourist went for evening walk on beach and didn't return to hotel. Phone found on beach.",
        description:
          "Female, 28 years, 5'6\" height, blonde hair, wearing white dress and sandals, has a small tattoo on left wrist.",
      },
      investigation: {
        assignedOfficer: "Inspector Arjun Desai",
        priority: "critical",
        status: "resolved",
        updates: [
          {
            date: "2024-01-14T21:00:00Z",
            officer: "Inspector Arjun Desai",
            update: "Search operation initiated. Coast guard and local fishermen alerted.",
            type: "info",
          },
          {
            date: "2024-01-15T06:00:00Z",
            officer: "Constable Maria Fernandes",
            update: "Tourist found safe at nearby village. Had helped injured local and stayed overnight.",
            type: "info",
          },
          {
            date: "2024-01-15T08:00:00Z",
            officer: "Inspector Arjun Desai",
            update: "Case resolved. Tourist reunited with friend. Medical check-up completed.",
            type: "info",
          },
        ],
      },
      contacts: {
        emergencyContact: {
          name: "James Wilson",
          relationship: "Father",
          phone: "+44-20-7946-0960",
          email: "james.wilson@email.com",
        },
        localContacts: [
          {
            name: "Sarah Thompson",
            phone: "+44-20-7946-0959",
            relationship: "Travel Companion",
          },
        ],
      },
    },
  ])

  const [filteredCases, setFilteredCases] = useState<MissingPersonCase[]>(cases)

  // Filter cases based on search and filters
  useEffect(() => {
    const filtered = cases.filter((case_) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        case_.touristInfo.name.toLowerCase().includes(searchLower) ||
        case_.caseNumber.toLowerCase().includes(searchLower) ||
        case_.touristInfo.id.toLowerCase().includes(searchLower) ||
        case_.caseDetails.lastSeenLocation.toLowerCase().includes(searchLower)

      const matchesStatus = statusFilter === "all" || case_.investigation.status === statusFilter
      const matchesPriority = priorityFilter === "all" || case_.investigation.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort by reported date (newest first)
    filtered.sort(
      (a, b) => new Date(b.caseDetails.reportedDate).getTime() - new Date(a.caseDetails.reportedDate).getTime(),
    )
    setFilteredCases(filtered)
  }, [cases, searchTerm, statusFilter, priorityFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in_investigation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getFirStatusColor = (status: string) => {
    switch (status) {
      case "filed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "under_investigation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "chargesheet_filed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const addCaseUpdate = () => {
    if (!selectedCase || !newUpdate.trim()) return

    const update = {
      date: new Date().toISOString(),
      officer: "Current Officer",
      update: newUpdate,
      type: updateType,
    }

    setCases((prev) =>
      prev.map((case_) =>
        case_.id === selectedCase.id
          ? {
              ...case_,
              investigation: {
                ...case_.investigation,
                updates: [...case_.investigation.updates, update],
              },
            }
          : case_,
      ),
    )

    setNewUpdate("")
    setUpdateDialog(false)
  }

  const updateCaseStatus = (caseId: string, newStatus: MissingPersonCase["investigation"]["status"]) => {
    setCases((prev) =>
      prev.map((case_) =>
        case_.id === caseId
          ? {
              ...case_,
              investigation: {
                ...case_.investigation,
                status: newStatus,
              },
            }
          : case_,
      ),
    )
  }

  const exportCaseReport = (case_: MissingPersonCase) => {
    // In a real application, this would generate and download a PDF report
    const reportData = {
      caseNumber: case_.caseNumber,
      touristName: case_.touristInfo.name,
      reportedDate: case_.caseDetails.reportedDate,
      status: case_.investigation.status,
      updates: case_.investigation.updates,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${case_.caseNumber}_report.json`
    link.click()
  }

  const openCases = cases.filter((c) => c.investigation.status === "open").length
  const inInvestigationCases = cases.filter((c) => c.investigation.status === "in_investigation").length
  const resolvedCases = cases.filter((c) => c.investigation.status === "resolved").length
  const criticalCases = cases.filter((c) => c.investigation.priority === "critical").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openCases}</div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inInvestigationCases}</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCases}</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
            <Shield className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{criticalCases}</div>
            <p className="text-xs text-muted-foreground">Highest priority cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Case Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-80">
              <Label htmlFor="case-search">Search Cases</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="case-search"
                  placeholder="Search by name, case number, tourist ID, or location..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_investigation">In Investigation</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Missing Person Cases ({filteredCases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCases.map((case_) => (
              <div key={case_.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={case_.touristInfo.photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {case_.touristInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-card-foreground">{case_.touristInfo.name}</h4>
                      <Badge className={getStatusColor(case_.investigation.status)}>
                        {case_.investigation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(case_.investigation.priority)}>
                        {case_.investigation.priority.toUpperCase()}
                      </Badge>
                      {case_.firDetails && (
                        <Badge className={getFirStatusColor(case_.firDetails.status)}>
                          FIR: {case_.firDetails.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {case_.caseNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        ID: {case_.touristInfo.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {case_.caseDetails.lastSeenLocation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(case_.caseDetails.reportedDate)}
                      </div>
                    </div>

                    <div className="text-sm text-card-foreground mb-2">
                      <strong>Assigned Officer:</strong> {case_.investigation.assignedOfficer}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <strong>Circumstances:</strong> {case_.caseDetails.circumstances}
                    </div>

                    {case_.firDetails && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <strong>FIR Number:</strong> {case_.firDetails.firNumber} |<strong> Station:</strong>{" "}
                        {case_.firDetails.station}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCase(case_)
                        setCaseDialog(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportCaseReport(case_)}>
                      <Download className="w-4 h-4 mr-1" />
                      Export Report
                    </Button>
                    {case_.investigation.status !== "resolved" && case_.investigation.status !== "closed" && (
                      <Button size="sm" variant="outline" onClick={() => updateCaseStatus(case_.id, "resolved")}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      <Dialog open={caseDialog} onOpenChange={setCaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Case Details: {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>Complete case information and investigation timeline</DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tourist">Tourist Info</TabsTrigger>
                <TabsTrigger value="investigation">Investigation</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="fir">FIR Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedCase.touristInfo.photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedCase.touristInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCase.touristInfo.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getStatusColor(selectedCase.investigation.status)}>
                        {selectedCase.investigation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(selectedCase.investigation.priority)}>
                        {selectedCase.investigation.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Case Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.caseNumber}</p>
                  </div>
                  <div>
                    <Label>Reported Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedCase.caseDetails.reportedDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Last Seen Location</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.caseDetails.lastSeenLocation}</p>
                  </div>
                  <div>
                    <Label>Last Seen Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedCase.caseDetails.lastSeenDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Reported By</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.caseDetails.reportedBy}</p>
                  </div>
                  <div>
                    <Label>Assigned Officer</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.investigation.assignedOfficer}</p>
                  </div>
                </div>

                <div>
                  <Label>Circumstances</Label>
                  <p className="text-sm text-muted-foreground">{selectedCase.caseDetails.circumstances}</p>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedCase.caseDetails.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="tourist" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tourist ID</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.id}</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.age} years</p>
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.nationality}</p>
                  </div>
                  <div>
                    <Label>Passport Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.passportNumber}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.phone}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedCase.touristInfo.email}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investigation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Investigation Timeline</h4>
                  <Button size="sm" onClick={() => setUpdateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Update
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedCase.investigation.updates.map((update, index) => (
                    <div key={index} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{update.type.toUpperCase()}</Badge>
                          <span className="text-sm font-medium">{update.officer}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(update.date)}</span>
                      </div>
                      <p className="text-sm text-card-foreground">{update.update}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Emergency Contact</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm text-muted-foreground">{selectedCase.contacts.emergencyContact.name}</p>
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedCase.contacts.emergencyContact.relationship}
                      </p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm text-muted-foreground">{selectedCase.contacts.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">{selectedCase.contacts.emergencyContact.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Local Contacts</Label>
                  <div className="space-y-2 mt-2">
                    {selectedCase.contacts.localContacts.map((contact, index) => (
                      <div key={index} className="border border-border rounded p-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Name</Label>
                            <p className="text-sm text-muted-foreground">{contact.name}</p>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                          <div>
                            <Label>Relationship</Label>
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fir" className="space-y-4">
                {selectedCase.firDetails ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>FIR Number</Label>
                        <p className="text-sm text-muted-foreground">{selectedCase.firDetails.firNumber}</p>
                      </div>
                      <div>
                        <Label>Filed Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(selectedCase.firDetails.filedDate)}
                        </p>
                      </div>
                      <div>
                        <Label>Police Station</Label>
                        <p className="text-sm text-muted-foreground">{selectedCase.firDetails.station}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge className={getFirStatusColor(selectedCase.firDetails.status)}>
                          {selectedCase.firDetails.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Sections Applied</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedCase.firDetails.sections.map((section, index) => (
                          <Badge key={index} variant="outline">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No FIR filed for this case</p>
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      File FIR
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedCase && exportCaseReport(selectedCase)}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Investigation Update</DialogTitle>
            <DialogDescription>Add a new update to the case investigation timeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-type">Update Type</Label>
              <Select value={updateType} onValueChange={(value: any) => setUpdateType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="update-text">Update Details</Label>
              <Textarea
                id="update-text"
                placeholder="Enter investigation update details..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addCaseUpdate}>Add Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
