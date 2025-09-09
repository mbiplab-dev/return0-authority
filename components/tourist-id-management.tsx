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
import {
  Search,
  User,
  MapPin,
  Phone,
  Calendar,
  Dessert as Passport,
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
} from "lucide-react"

interface TouristProfile {
  id: string
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    gender: string
    photo: string
  }
  documents: {
    passportNumber: string
    passportExpiry: string
    visaNumber?: string
    visaExpiry?: string
    aadhaarNumber?: string
    drivingLicense?: string
  }
  contactInfo: {
    email: string
    phone: string
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email: string
    }
    localContact?: {
      name: string
      phone: string
      address: string
    }
  }
  travelInfo: {
    arrivalDate: string
    departureDate: string
    purpose: string
    accommodation: string
    itinerary: Array<{
      date: string
      location: string
      activity: string
      status: "planned" | "completed" | "cancelled"
    }>
  }
  safetyInfo: {
    lastKnownLocation: {
      lat: number
      lng: number
      address: string
      timestamp: string
    }
    medicalConditions?: string
    allergies?: string
    medications?: string
    insuranceProvider?: string
    insuranceNumber?: string
  }
  status: "active" | "departed" | "missing" | "flagged"
  registrationDate: string
  lastUpdated: string
}

export function TouristIdManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchFilter, setSearchFilter] = useState("all")
  const [selectedTourist, setSelectedTourist] = useState<TouristProfile | null>(null)
  const [profileDialog, setProfileDialog] = useState(false)

  // Mock tourist data
  const [tourists, setTourists] = useState<TouristProfile[]>([
    {
      id: "TID-2024-001",
      personalInfo: {
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: "1985-03-15",
        nationality: "United States",
        gender: "Male",
        photo: "/tourist-1.jpg",
      },
      documents: {
        passportNumber: "US123456789",
        passportExpiry: "2028-03-15",
        visaNumber: "V987654321",
        visaExpiry: "2024-12-31",
      },
      contactInfo: {
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        emergencyContact: {
          name: "Jane Smith",
          relationship: "Spouse",
          phone: "+1-555-0124",
          email: "jane.smith@email.com",
        },
        localContact: {
          name: "Raj Hotel Services",
          phone: "+91-98765-43210",
          address: "Marina Beach Road, Chennai",
        },
      },
      travelInfo: {
        arrivalDate: "2024-01-10",
        departureDate: "2024-01-25",
        purpose: "Tourism",
        accommodation: "Grand Marina Hotel, Chennai",
        itinerary: [
          { date: "2024-01-11", location: "Marina Beach", activity: "Beach visit", status: "completed" },
          { date: "2024-01-12", location: "Fort St. George", activity: "Historical tour", status: "completed" },
          { date: "2024-01-15", location: "Kapaleeshwarar Temple", activity: "Cultural visit", status: "planned" },
          { date: "2024-01-18", location: "Mahabalipuram", activity: "Day trip", status: "planned" },
        ],
      },
      safetyInfo: {
        lastKnownLocation: {
          lat: 13.0827,
          lng: 80.2707,
          address: "Marina Beach, Chennai",
          timestamp: "2024-01-15T14:30:00Z",
        },
        medicalConditions: "Diabetes Type 2",
        allergies: "Shellfish",
        medications: "Metformin 500mg",
        insuranceProvider: "Global Travel Insurance",
        insuranceNumber: "GTI-789456123",
      },
      status: "active",
      registrationDate: "2024-01-10T10:00:00Z",
      lastUpdated: "2024-01-15T14:30:00Z",
    },
    {
      id: "TID-2024-002",
      personalInfo: {
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: "1992-07-22",
        nationality: "Canada",
        gender: "Female",
        photo: "/tourist-2.jpg",
      },
      documents: {
        passportNumber: "CA987654321",
        passportExpiry: "2027-07-22",
        visaNumber: "V123456789",
        visaExpiry: "2024-08-31",
      },
      contactInfo: {
        email: "sarah.johnson@email.com",
        phone: "+1-416-555-0198",
        emergencyContact: {
          name: "Michael Johnson",
          relationship: "Father",
          phone: "+1-416-555-0199",
          email: "michael.johnson@email.com",
        },
      },
      travelInfo: {
        arrivalDate: "2024-01-12",
        departureDate: "2024-01-20",
        purpose: "Medical Tourism",
        accommodation: "Apollo Hospital Guest House, Chennai",
        itinerary: [
          { date: "2024-01-13", location: "Apollo Hospital", activity: "Medical consultation", status: "completed" },
          { date: "2024-01-15", location: "Apollo Hospital", activity: "Treatment", status: "planned" },
        ],
      },
      safetyInfo: {
        lastKnownLocation: {
          lat: 13.0878,
          lng: 80.2785,
          address: "Apollo Hospital, Chennai",
          timestamp: "2024-01-15T09:15:00Z",
        },
        medicalConditions: "Hypertension",
        insuranceProvider: "Canadian Health Plus",
        insuranceNumber: "CHP-456789123",
      },
      status: "active",
      registrationDate: "2024-01-12T08:30:00Z",
      lastUpdated: "2024-01-15T09:15:00Z",
    },
    {
      id: "TID-2024-003",
      personalInfo: {
        firstName: "Mike",
        lastName: "Chen",
        dateOfBirth: "1988-11-08",
        nationality: "Australia",
        gender: "Male",
        photo: "/tourist-3.jpg",
      },
      documents: {
        passportNumber: "AU456789123",
        passportExpiry: "2026-11-08",
        aadhaarNumber: "1234-5678-9012",
      },
      contactInfo: {
        email: "mike.chen@email.com",
        phone: "+61-2-9876-5432",
        emergencyContact: {
          name: "Lisa Chen",
          relationship: "Sister",
          phone: "+61-2-9876-5433",
          email: "lisa.chen@email.com",
        },
      },
      travelInfo: {
        arrivalDate: "2024-01-08",
        departureDate: "2024-02-05",
        purpose: "Business",
        accommodation: "ITC Grand Chola, Chennai",
        itinerary: [
          { date: "2024-01-09", location: "IT Park", activity: "Business meeting", status: "completed" },
          { date: "2024-01-15", location: "Mysore Palace", activity: "Weekend trip", status: "planned" },
        ],
      },
      safetyInfo: {
        lastKnownLocation: {
          lat: 12.3052,
          lng: 76.6551,
          address: "Mysore Palace, Karnataka",
          timestamp: "2024-01-15T13:45:00Z",
        },
      },
      status: "missing",
      registrationDate: "2024-01-08T14:20:00Z",
      lastUpdated: "2024-01-15T13:45:00Z",
    },
  ])

  const [filteredTourists, setFilteredTourists] = useState<TouristProfile[]>(tourists)

  // Filter tourists based on search
  useEffect(() => {
    const filtered = tourists.filter((tourist) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        tourist.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        tourist.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        tourist.id.toLowerCase().includes(searchLower) ||
        tourist.documents.passportNumber.toLowerCase().includes(searchLower) ||
        tourist.documents.aadhaarNumber?.toLowerCase().includes(searchLower) ||
        tourist.contactInfo.email.toLowerCase().includes(searchLower)

      const matchesFilter = searchFilter === "all" || tourist.status === searchFilter

      return matchesSearch && matchesFilter
    })

    setFilteredTourists(filtered)
  }, [tourists, searchTerm, searchFilter])

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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const activeCount = tourists.filter((t) => t.status === "active").length
  const missingCount = tourists.filter((t) => t.status === "missing").length
  const flaggedCount = tourists.filter((t) => t.status === "flagged").length

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
            <div className="text-2xl font-bold text-blue-600">{tourists.length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tourists</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently in country</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Tourists</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{missingCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Profiles</CardTitle>
            <Shield className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{flaggedCount}</div>
            <p className="text-xs text-muted-foreground">Under monitoring</p>
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
            <div className="flex items-end">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Register New Tourist
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
            Tourist Records ({filteredTourists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTourists.map((tourist) => (
              <div key={tourist.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={tourist.personalInfo.photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {tourist.personalInfo.firstName[0]}
                      {tourist.personalInfo.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-card-foreground">
                        {tourist.personalInfo.firstName} {tourist.personalInfo.lastName}
                      </h4>
                      <Badge className={getStatusColor(tourist.status)}>{tourist.status.toUpperCase()}</Badge>
                      {tourist.status === "missing" && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          URGENT
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        ID: {tourist.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Passport className="w-3 h-3" />
                        {tourist.documents.passportNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {tourist.personalInfo.nationality}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Age: {calculateAge(tourist.personalInfo.dateOfBirth)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tourist.safetyInfo.lastKnownLocation.address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {tourist.contactInfo.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last seen: {formatDateTime(tourist.safetyInfo.lastKnownLocation.timestamp)}
                      </div>
                    </div>

                    <div className="text-sm text-card-foreground">
                      <strong>Purpose:</strong> {tourist.travelInfo.purpose} |<strong> Stay:</strong>{" "}
                      {formatDate(tourist.travelInfo.arrivalDate)} - {formatDate(tourist.travelInfo.departureDate)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTourist(tourist)
                        setProfileDialog(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      Track Location
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tourist Profile Dialog */}
      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tourist Profile: {selectedTourist?.personalInfo.firstName} {selectedTourist?.personalInfo.lastName}
            </DialogTitle>
            <DialogDescription>Complete tourist information and safety details</DialogDescription>
          </DialogHeader>

          {selectedTourist && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="travel">Travel</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedTourist.personalInfo.photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedTourist.personalInfo.firstName[0]}
                      {selectedTourist.personalInfo.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedTourist.personalInfo.firstName} {selectedTourist.personalInfo.lastName}
                    </h3>
                    <Badge className={getStatusColor(selectedTourist.status)}>
                      {selectedTourist.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedTourist.personalInfo.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(selectedTourist.personalInfo.dateOfBirth)} years
                    </p>
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.personalInfo.gender}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Passport Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.documents.passportNumber}</p>
                  </div>
                  <div>
                    <Label>Passport Expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedTourist.documents.passportExpiry)}
                    </p>
                  </div>
                  {selectedTourist.documents.visaNumber && (
                    <>
                      <div>
                        <Label>Visa Number</Label>
                        <p className="text-sm text-muted-foreground">{selectedTourist.documents.visaNumber}</p>
                      </div>
                      <div>
                        <Label>Visa Expiry</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.documents.visaExpiry && formatDate(selectedTourist.documents.visaExpiry)}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedTourist.documents.aadhaarNumber && (
                    <div>
                      <Label>Aadhaar Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.documents.aadhaarNumber}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.contactInfo.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.contactInfo.phone}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Emergency Contact</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.contactInfo.emergencyContact.name}
                      </p>
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.contactInfo.emergencyContact.relationship}
                      </p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.contactInfo.emergencyContact.phone}
                      </p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.contactInfo.emergencyContact.email}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTourist.contactInfo.localContact && (
                  <div>
                    <Label className="text-base font-semibold">Local Contact</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm text-muted-foreground">{selectedTourist.contactInfo.localContact.name}</p>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.contactInfo.localContact.phone}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label>Address</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTourist.contactInfo.localContact.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="travel" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Arrival Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedTourist.travelInfo.arrivalDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Departure Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedTourist.travelInfo.departureDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Purpose of Visit</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.travelInfo.purpose}</p>
                  </div>
                  <div>
                    <Label>Accommodation</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.travelInfo.accommodation}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Itinerary</Label>
                  <div className="space-y-2 mt-2">
                    {selectedTourist.travelInfo.itinerary.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                        <div>
                          <p className="font-medium">{item.location}</p>
                          <p className="text-sm text-muted-foreground">{item.activity}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                        </div>
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "default"
                              : item.status === "planned"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Last Known Location</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Address</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.safetyInfo.lastKnownLocation.address}
                      </p>
                    </div>
                    <div>
                      <Label>Timestamp</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(selectedTourist.safetyInfo.lastKnownLocation.timestamp)}
                      </p>
                    </div>
                    <div>
                      <Label>Coordinates</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTourist.safetyInfo.lastKnownLocation.lat.toFixed(4)},{" "}
                        {selectedTourist.safetyInfo.lastKnownLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTourist.safetyInfo.medicalConditions && (
                  <div>
                    <Label>Medical Conditions</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.safetyInfo.medicalConditions}</p>
                  </div>
                )}

                {selectedTourist.safetyInfo.allergies && (
                  <div>
                    <Label>Allergies</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.safetyInfo.allergies}</p>
                  </div>
                )}

                {selectedTourist.safetyInfo.medications && (
                  <div>
                    <Label>Current Medications</Label>
                    <p className="text-sm text-muted-foreground">{selectedTourist.safetyInfo.medications}</p>
                  </div>
                )}

                {selectedTourist.safetyInfo.insuranceProvider && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Insurance Provider</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.safetyInfo.insuranceProvider}</p>
                    </div>
                    <div>
                      <Label>Insurance Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedTourist.safetyInfo.insuranceNumber}</p>
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
