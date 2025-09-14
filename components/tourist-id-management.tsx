"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { toast } from "@/components/ui/use-toast"
import {
  Search,
  User,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Globe,
  Users,
  Loader2,
  Flag,
  RefreshCw,
} from "lucide-react"

// Import the custom hook
import { useTouristManagementApi } from "@/hooks/useTouristManagementApi"

export function TouristIdManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchFilter, setSearchFilter] = useState("all")
  const [selectedTourist, setSelectedTourist] = useState<any>(null)
  const [profileDialog, setProfileDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Use the API hook
  const {
    loading,
    error,
    fetchTourists,
    fetchTouristProfile,
    updateTouristProfile,
    flagTourist,
    trackLocation,
    fetchTouristStats,
  } = useTouristManagementApi()

  // State for data
  const [tourists, setTourists] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [stats, setStats] = useState<any>({})

  // Load initial data
  useEffect(() => {
    loadTourists()
    loadStats()
  }, [currentPage, searchFilter, sortBy, sortOrder])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        loadTourists()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadTourists = async () => {
    try {
      const response = await fetchTourists({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: searchFilter === "all" ? undefined : searchFilter,
        sortBy,
        sortOrder,
      })
      setTourists(response.tourists || [])
      setPagination(response.pagination || {})
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load tourists",
        variant: "destructive",
      })
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetchTouristStats("30d")
      setStats(response.statistics || {})
    } catch (err) {
      console.error("Failed to load stats:", err)
    }
  }

  const handleViewProfile = async (touristId: string) => {
    try {
      const response = await fetchTouristProfile(touristId)
      setSelectedTourist(response.tourist)
      setProfileDialog(true)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load tourist profile",
        variant: "destructive",
      })
    }
  }

  const handleFlagTourist = async (touristId: string, flag: boolean, reason?: string) => {
    try {
      await flagTourist(touristId, flag, reason)
      toast({
        title: "Success",
        description: `Tourist ${flag ? "flagged" : "unflagged"} successfully`,
      })
      loadTourists() // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${flag ? "flag" : "unflag"} tourist`,
        variant: "destructive",
      })
    }
  }

  const handleTrackLocation = async (touristId: string, coordinates: { lat: number; lng: number }, address: string) => {
    try {
      await trackLocation(touristId, coordinates, address, "Location tracked by authority")
      toast({
        title: "Success",
        description: "Location tracked successfully",
      })
      loadTourists() // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to track location",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "departed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "missing":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "flagged":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (error && !tourists.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadTourists}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tourists</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.overview?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tourists</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.overview?.active || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in country</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tourist Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-80">
              <Label htmlFor="tourist-search">Search Tourists</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="tourist-search"
                  placeholder="Search by name, ID, passport, Aadhaar, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={searchFilter} onValueChange={setSearchFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="departed">Departed</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Registration Date</SelectItem>
                  <SelectItem value="username">Name</SelectItem>
                  <SelectItem value="profile.nationality">Nationality</SelectItem>
                  <SelectItem value="lastLogin">Last Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadTourists} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourist List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Tourist Records ({pagination.total || 0})
            {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tourists.map((tourist) => (
              <div key={tourist._id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={tourist.profile?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback>
                      {tourist.username?.substring(0, 2)?.toUpperCase() || "TU"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-card-foreground">
                        {tourist.profile?.firstName && tourist.profile?.lastName
                          ? `${tourist.profile.firstName} ${tourist.profile.lastName}`
                          : tourist.username}
                      </h4>
                      <Badge className={getStatusColor(tourist.status)}>{tourist.status.toUpperCase()}</Badge>
                      {tourist.status === "missing" && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          URGENT
                        </Badge>
                      )}
                      {tourist.status === "flagged" && tourist.profile?.flagReason && (
                        <Badge variant="outline">
                          <Flag className="w-3 h-3 mr-1" />
                          {tourist.profile.flagReason}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        ID: {tourist._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {tourist.profile?.passportNumber || "No passport"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {tourist.profile?.nationality || "Unknown"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Age: {calculateAge(tourist.profile?.dateOfBirth)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tourist.profile?.lastKnownLocation?.address || "Location unknown"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {tourist.phone || "No phone"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last seen: {tourist.lastLogin ? formatDateTime(tourist.lastLogin) : "Never"}
                      </div>
                    </div>

                    <div className="text-sm text-card-foreground">
                      <strong>Email:</strong> {tourist.email} |
                      <strong> Verified:</strong> {tourist.isEmailVerified ? "Yes" : "No"} |
                      <strong> Complaints:</strong> {tourist.stats?.totalComplaints || 0}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProfile(tourist._id)}
                      disabled={loading}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // For demo purposes, using current location
                        const coords = { lat: 13.0827, lng: 80.2707 }
                        handleTrackLocation(tourist._id, coords, "Chennai, India")
                      }}
                      disabled={loading}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Track Location
                    </Button>
                    {tourist.status !== "flagged" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlagTourist(tourist._id, true, "Manual flag by authority")}
                        disabled={loading}
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        Flag Tourist
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlagTourist(tourist._id, false)}
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Remove Flag
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tourist Profile Dialog */}
      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tourist Profile: {selectedTourist?.profile?.firstName && selectedTourist?.profile?.lastName
                ? `${selectedTourist.profile.firstName} ${selectedTourist.profile.lastName}`
                : selectedTourist?.username}
            </DialogTitle>
            <DialogDescription>Complete tourist information and safety details</DialogDescription>
          </DialogHeader>

          {selectedTourist && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedTourist.profile?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedTourist.username?.substring(0, 2)?.toUpperCase() || "TU"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedTourist.profile?.firstName && selectedTourist.profile?.lastName
                        ? `${selectedTourist.profile.firstName} ${selectedTourist.profile.lastName}`
                        : selectedTourist.username}
                    </h3>
                    <Badge className={getStatusColor(selectedTourist.status)}>
                      {selectedTourist.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.username}</p>
                  </div>
                  <div>
                    <Label>Registration Date</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedTourist.createdAt)}</p>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTourist.profile?.dateOfBirth ? formatDate(selectedTourist.profile.dateOfBirth) : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(selectedTourist.profile?.dateOfBirth)} years
                    </p>
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.profile?.nationality || "Not provided"}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.profile?.gender || "Not provided"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Passport Number</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTourist.profile?.passportNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>Passport Expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTourist.profile?.passportExpiry 
                        ? formatDate(selectedTourist.profile.passportExpiry)
                        : "Not provided"}
                    </p>
                  </div>
                  {selectedTourist.profile?.visaNumber && (
                    <>
                      <div>
                        <Label>Visa Number</Label>
                        <p className="text-sm text-muted-foreground">{selectedTourist.profile.visaNumber}</p>
                      </div>
                      <div>
                        <Label>Visa Expiry</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.visaExpiry 
                            ? formatDate(selectedTourist.profile.visaExpiry)
                            : "Not provided"}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedTourist.profile?.aadhaarNumber && (
                    <div>
                      <Label>Aadhaar Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.profile.aadhaarNumber}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.email}</p>
                  </div>
                  <div>
                    <Label>Email Verified</Label>
                    <Badge variant={selectedTourist.isEmailVerified ? "default" : "secondary"}>
                      {selectedTourist.isEmailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label>Phone Verified</Label>
                    <Badge variant={selectedTourist.isPhoneVerified ? "default" : "secondary"}>
                      {selectedTourist.isPhoneVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>

                {selectedTourist.profile?.emergencyContact && (
                  <div>
                    <Label className="text-base font-semibold">Emergency Contact</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.emergencyContact.name}
                        </p>
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.emergencyContact.relationship}
                        </p>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.emergencyContact.phone}
                        </p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.emergencyContact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                {selectedTourist.profile?.lastKnownLocation && (
                  <div>
                    <Label className="text-base font-semibold">Last Known Location</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Address</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.lastKnownLocation.address}
                        </p>
                      </div>
                      <div>
                        <Label>Timestamp</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(selectedTourist.profile.lastKnownLocation.timestamp)}
                        </p>
                      </div>
                      <div>
                        <Label>Coordinates</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.lastKnownLocation.coordinates?.lat?.toFixed(4)},{" "}
                          {selectedTourist.profile.lastKnownLocation.coordinates?.lng?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTourist.profile?.medicalConditions && (
                  <div>
                    <Label>Medical Conditions</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.profile.medicalConditions}</p>
                  </div>
                )}

                {selectedTourist.profile?.allergies && (
                  <div>
                    <Label>Allergies</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.profile.allergies}</p>
                  </div>
                )}

                {selectedTourist.profile?.medications && (
                  <div>
                    <Label>Current Medications</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.profile.medications}</p>
                  </div>
                )}

                {selectedTourist.profile?.insuranceProvider && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Insurance Provider</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.profile.insuranceProvider}</p>
                    </div>
                    <div>
                      <Label>Insurance Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.profile.insuranceNumber}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-base font-semibold">Safety Statistics</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Total Complaints</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.stats?.totalComplaints || 0}</p>
                    </div>
                    <div>
                      <Label>Last Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.lastLogin ? formatDateTime(selectedTourist.lastLogin) : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTourist.status === "flagged" && selectedTourist.profile?.flagReason && (
                  <div>
                    <Label className="text-base font-semibold text-red-600">Flag Information</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Reason</Label>
                        <p className="text-sm text-muted-foreground">{selectedTourist.profile.flagReason}</p>
                      </div>
                      <div>
                        <Label>Flagged Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.profile.flaggedAt ? formatDateTime(selectedTourist.profile.flaggedAt) : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialog(false)}>
              Close
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}