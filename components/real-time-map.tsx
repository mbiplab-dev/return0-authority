"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MapPin, Users, AlertTriangle, Shield, Eye, Layers, Zap } from "lucide-react"

interface TouristLocation {
  id: string
  lat: number
  lng: number
  name: string
  status: "safe" | "warning" | "danger"
  lastSeen: string
  groupSize: number
}

interface SafetyZone {
  id: string
  name: string
  type: "safe" | "high-risk"
  coordinates: { lat: number; lng: number }[]
  description: string
}

export function RealTimeMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [showSafetyZones, setShowSafetyZones] = useState(true)
  const [showTouristClusters, setShowTouristClusters] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<TouristLocation | null>(null)

  // Mock tourist locations data
  const [touristLocations, setTouristLocations] = useState<TouristLocation[]>([
    {
      id: "T001",
      lat: 13.0827,
      lng: 80.2707,
      name: "Marina Beach Group",
      status: "safe",
      lastSeen: "2 min ago",
      groupSize: 12,
    },
    {
      id: "T002",
      lat: 13.0878,
      lng: 80.2785,
      name: "Fort St. George Visitors",
      status: "safe",
      lastSeen: "5 min ago",
      groupSize: 8,
    },
    {
      id: "T003",
      lat: 13.0732,
      lng: 80.2609,
      name: "Kapaleeshwarar Temple",
      status: "warning",
      lastSeen: "1 min ago",
      groupSize: 15,
    },
    {
      id: "T004",
      lat: 13.0569,
      lng: 80.2427,
      name: "Besant Nagar Beach",
      status: "danger",
      lastSeen: "Just now",
      groupSize: 3,
    },
    {
      id: "T005",
      lat: 13.0475,
      lng: 80.2824,
      name: "Guindy National Park",
      status: "safe",
      lastSeen: "8 min ago",
      groupSize: 6,
    },
  ])

  const safetyZones: SafetyZone[] = [
    {
      id: "SZ001",
      name: "Marina Beach Safe Zone",
      type: "safe",
      coordinates: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 13.085, lng: 80.275 },
        { lat: 13.08, lng: 80.275 },
      ],
      description: "Well-patrolled tourist area with security presence",
    },
    {
      id: "RZ001",
      name: "Crowded Market Area",
      type: "high-risk",
      coordinates: [
        { lat: 13.0732, lng: 80.2609 },
        { lat: 13.075, lng: 80.263 },
        { lat: 13.071, lng: 80.263 },
      ],
      description: "High pickpocket activity reported",
    },
  ]

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        // Load Mapbox GL JS and CSS
        const mapboxgl = await import("mapbox-gl")

        // Add Mapbox CSS
        if (!document.querySelector('link[href*="mapbox-gl"]')) {
          const link = document.createElement("link")
          link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          link.rel = "stylesheet"
          document.head.appendChild(link)
        }

        // Set access token (you'll need to add this to your environment variables)
        mapboxgl.default.accessToken =
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [80.2707, 13.0827], // Chennai coordinates
          zoom: 12
        })

        map.current.on("load", () => {
          setMapLoaded(true)
          addTouristMarkers()
          addSafetyZones()
        })
      } catch (error) {
        console.error("Failed to load Mapbox:", error)
        setMapLoaded(false)
      }
    }

    loadMapbox()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const addTouristMarkers = () => {
    if (!map.current || !mapLoaded) return
  }

  const addSafetyZones = () => {
    if (!map.current || !mapLoaded) return

    safetyZones.forEach((zone) => {
      const coordinates = zone.coordinates.map((coord) => [coord.lng, coord.lat])
      coordinates.push(coordinates[0]) // Close the polygon

      map.current.addSource(`zone-${zone.id}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      })

      map.current.addLayer({
        id: `zone-${zone.id}`,
        type: "fill",
        source: `zone-${zone.id}`,
        paint: {
          "fill-color": zone.type === "safe" ? "#22c55e" : "#ef4444",
          "fill-opacity": 0.3,
        },
      })

      map.current.addLayer({
        id: `zone-${zone.id}-border`,
        type: "line",
        source: `zone-${zone.id}`,
        paint: {
          "line-color": zone.type === "safe" ? "#16a34a" : "#dc2626",
          "line-width": 2,
        },
      })
    })
  }

  const toggleSafetyZones = (enabled: boolean) => {
    setShowSafetyZones(enabled)
    if (!map.current || !mapLoaded) return

    safetyZones.forEach((zone) => {
      const visibility = enabled ? "visible" : "none"
      if (map.current.getLayer(`zone-${zone.id}`)) {
        map.current.setLayoutProperty(`zone-${zone.id}`, "visibility", visibility)
        map.current.setLayoutProperty(`zone-${zone.id}-border`, "visibility", visibility)
      }
    })
  }

  const toggleHeatmap = (enabled: boolean) => {
    setHeatmapEnabled(enabled)
    if (!map.current || !mapLoaded) return

    if (enabled) {
      // Add heatmap layer
      const heatmapData = {
        type: "FeatureCollection" as const,
        features: touristLocations.map((location) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [location.lng, location.lat],
          },
          properties: {
            weight: location.groupSize,
          },
        })),
      }

      if (!map.current.getSource("tourist-heatmap")) {
        map.current.addSource("tourist-heatmap", {
          type: "geojson",
          data: heatmapData,
        })

        map.current.addLayer({
          id: "tourist-heatmap-layer",
          type: "heatmap",
          source: "tourist-heatmap",
          paint: {
            "heatmap-weight": ["get", "weight"],
            "heatmap-intensity": 1,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0,0,255,0)",
              0.2,
              "rgb(0,255,255)",
              0.4,
              "rgb(0,255,0)",
              0.6,
              "rgb(255,255,0)",
              0.8,
              "rgb(255,165,0)",
              1,
              "rgb(255,0,0)",
            ],
            "heatmap-radius": 30,
          },
        })
      }
    } else {
      if (map.current.getLayer("tourist-heatmap-layer")) {
        map.current.removeLayer("tourist-heatmap-layer")
        map.current.removeSource("tourist-heatmap")
      }
    }
  }

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTouristLocations((prev) =>
        prev.map((location) => ({
          ...location,
          lat: location.lat + (Math.random() - 0.5) * 0.001,
          lng: location.lng + (Math.random() - 0.5) * 0.001,
          lastSeen: Math.random() > 0.7 ? "Just now" : location.lastSeen,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "safe":
        return "default"
      case "warning":
        return "secondary"
      case "danger":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch id="heatmap" checked={heatmapEnabled} onCheckedChange={toggleHeatmap} />
              <Label htmlFor="heatmap" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Tourist Density Heatmap
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="clusters" checked={showTouristClusters} onCheckedChange={setShowTouristClusters} />
              <Label htmlFor="clusters" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Tourist Clusters
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tourist Safety Map
            <Badge variant="secondary" className="ml-auto">
              <Eye className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="h-96 w-full rounded-lg border border-border"
            style={{ minHeight: "400px" }}
          />

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Details Panel */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLocation(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{selectedLocation.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={getStatusBadgeVariant(selectedLocation.status)} className="mt-1">
                  {selectedLocation.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Group Size</Label>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedLocation.groupSize} tourists
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Coordinates</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Seen</Label>
                <p className="text-sm text-muted-foreground">{selectedLocation.lastSeen}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tourist ID</Label>
                <p className="text-sm text-muted-foreground">{selectedLocation.id}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Alert
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Track Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
