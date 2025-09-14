"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Trash2,
  Edit,
  Clock,
  Shield,
  Square,
  MousePointer,
  Save,
  X,
} from "lucide-react";
import { useZones, HighRiskZone } from "@/hooks/useZones";

type DrawingMode = "none" | "polygon";

export function HighRiskZones() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapboxgl = useRef<any>(null);
  const drawingMarkers = useRef<any[]>([]);

  // Use the zones hook
  const {
    zones,
    logs,
    loading,
    error,
    loadZones,
    createZone,
    deleteZone,
    activeZones,
    recentLogs,
    activeZoneCount,
    clearError
  } = useZones();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none");
  const [drawingCoordinates, setDrawingCoordinates] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [selectedZone, setSelectedZone] = useState<HighRiskZone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDescription, setNewZoneDescription] = useState("");
  const [newZoneSeverity, setNewZoneSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");

  // Load zones on component mount
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.error("Zones API Error:", error);
      // You could show a toast notification here
      // toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleMapClick = useCallback(
    (e: any) => {
      if (drawingMode !== "polygon") return;

      e.preventDefault();
      e.originalEvent?.stopPropagation();

      const { lng, lat } = e.lngLat;
      const newCoord = { lat, lng };

      setDrawingCoordinates((prev) => {
        const updated = [...prev, newCoord];
        addDrawingMarker(lng, lat, updated.length);
        updatePolygonPreview(updated);
        return updated;
      });
    },
    [drawingMode]
  );

  const addDrawingMarker = (lng: number, lat: number, index: number) => {
    if (!map.current || !mapboxgl.current) return;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 16px;
      height: 16px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      position: relative;
    `;

    const numberEl = document.createElement("div");
    numberEl.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    numberEl.textContent = `Point ${index}`;
    el.appendChild(numberEl);

    const marker = new mapboxgl.current.default.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);

    drawingMarkers.current.push(marker);
  };

  const updatePolygonPreview = (coordinates: { lat: number; lng: number }[]) => {
    if (!map.current || coordinates.length < 2) return;

    clearDrawingPreview();

    const coords = coordinates.map((coord) => [coord.lng, coord.lat]);

    // Add line preview
    const lineSourceId = "drawing-preview-line";
    map.current.addSource(lineSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    });

    map.current.addLayer({
      id: "drawing-preview-line",
      type: "line",
      source: lineSourceId,
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
        "line-dasharray": [5, 5],
      },
    });

    // If we have 3+ points, show polygon preview
    if (coordinates.length >= 3) {
      const polygonCoords = [...coords, coords[0]];
      const polygonSourceId = "drawing-preview-polygon";

      map.current.addSource(polygonSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [polygonCoords],
          },
        },
      });

      map.current.addLayer({
        id: "drawing-preview-fill",
        type: "fill",
        source: polygonSourceId,
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
        },
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const loadMapbox = async () => {
      try {
        mapboxgl.current = await import("mapbox-gl");

        if (!document.querySelector('link[href*="mapbox-gl"]')) {
          const link = document.createElement("link");
          link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css";
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }

        mapboxgl.current.default.accessToken =
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
          "pk.eyJ1IjoidjBhcHAiLCJhIjoiY20zZzFqZGNzMGNhZzJxcHpxbGNxZGNkYSJ9.KOFNZqmqmzk8OQh_5QG8Ow";

        map.current = new mapboxgl.current.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [80.2707, 13.0827],
          zoom: 12,
        });

        map.current.on("load", () => {
          console.log("[v0] Map loaded successfully");
          setMapLoaded(true);
        });

        map.current.on("click", handleMapClick);
      } catch (error) {
        console.error("[v0] Failed to load Mapbox:", error);
        setMapLoaded(false);
      }
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [handleMapClick]);

  // Add zones to map when both map and data are loaded
  useEffect(() => {
    if (mapLoaded && !loading && map.current) {
      console.log("[v0] Adding zones to map, count:", zones.length);
      addHighRiskZones();
    }
  }, [mapLoaded, loading, zones]);

  const startPolygonDrawing = () => {
    setDrawingMode("polygon");
    setDrawingCoordinates([]);
    clearDrawingPreview();
    clearDrawingMarkers();

    if (map.current) {
      map.current.getCanvas().style.cursor = "crosshair";
    }
  };

  const finishPolygon = () => {
    if (drawingCoordinates.length < 3) {
      alert("Please mark at least 3 points to create a polygon");
      return;
    }

    setIsDialogOpen(true);
  };

  const cancelDrawing = () => {
    setDrawingMode("none");
    setDrawingCoordinates([]);
    clearDrawingMarkers();
    clearDrawingPreview();

    if (map.current) {
      map.current.getCanvas().style.cursor = "default";
    }
  };

  const clearDrawingMarkers = () => {
    drawingMarkers.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (error) {
        console.warn("Error removing marker:", error);
      }
    });
    drawingMarkers.current = [];
  };

  const clearDrawingPreview = () => {
    if (!map.current) return;

    const layersToRemove = ["drawing-preview-line", "drawing-preview-fill"];
    const sourcesToRemove = ["drawing-preview-line", "drawing-preview-polygon"];

    layersToRemove.forEach((layerId) => {
      try {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      } catch (error) {
        console.warn(`Error removing layer ${layerId}:`, error);
      }
    });

    sourcesToRemove.forEach((sourceId) => {
      try {
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      } catch (error) {
        console.warn(`Error removing source ${sourceId}:`, error);
      }
    });
  };

  const addHighRiskZones = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing zones from map first
    zones.forEach((zone) => {
      try {
        if (map.current.getLayer(`high-risk-zone-${zone.id}`)) {
          map.current.removeLayer(`high-risk-zone-${zone.id}`);
        }
        if (map.current.getLayer(`high-risk-zone-${zone.id}-border`)) {
          map.current.removeLayer(`high-risk-zone-${zone.id}-border`);
        }
        if (map.current.getSource(`high-risk-zone-${zone.id}`)) {
          map.current.removeSource(`high-risk-zone-${zone.id}`);
        }
      } catch (error) {
        // Ignore errors for non-existent layers/sources
      }
    });

    // Add active zones to map
    activeZones.forEach((zone) => {
      const coordinates = zone.coordinates.map((coord) => [coord.lng, coord.lat]);
      coordinates.push(coordinates[0]);

      map.current.addSource(`high-risk-zone-${zone.id}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
          properties: {
            id: zone.id,
            name: zone.name,
            severity: zone.severity,
          },
        },
      });

      const fillColor = getSeverityColor(zone.severity);
      const borderColor = getSeverityBorderColor(zone.severity);

      map.current.addLayer({
        id: `high-risk-zone-${zone.id}`,
        type: "fill",
        source: `high-risk-zone-${zone.id}`,
        paint: {
          "fill-color": fillColor,
          "fill-opacity": 0.4,
        },
      });

      map.current.addLayer({
        id: `high-risk-zone-${zone.id}-border`,
        type: "line",
        source: `high-risk-zone-${zone.id}`,
        paint: {
          "line-color": borderColor,
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      const center = getPolygonCenter(zone.coordinates);
      const labelEl = document.createElement("div");
      labelEl.innerHTML = `
        <div style="
          background: ${borderColor};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${zone.name}
        </div>
      `;

      const marker = new mapboxgl.current.default.Marker(labelEl)
        .setLngLat([center.lng, center.lat])
        .addTo(map.current);

      labelEl.addEventListener("click", () => {
        setSelectedZone(zone);
      });
    });
  };

  const saveNewZone = async () => {
    if (!newZoneName.trim() || drawingCoordinates.length < 3) {
      alert("Please provide a zone name and mark at least 3 points");
      return;
    }

    setIsSaving(true);

    try {
      const success = await createZone(
        newZoneName,
        newZoneDescription,
        drawingCoordinates,
        newZoneSeverity
      );

      if (success) {
        console.log("[v0] Zone saved successfully");
        resetFormAndDrawingStates();
        
        // Force reload zones and update map
        await loadZones();
        
        // Add a small delay to ensure zones are updated, then refresh map
        setTimeout(() => {
          if (mapLoaded && map.current) {
            console.log("[v0] Refreshing map with new zones");
            addHighRiskZones();
          }
        }, 100);
      } else {
        alert("Failed to save zone. Please try again.");
      }
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("Error saving zone. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetFormAndDrawingStates = () => {
    setIsDialogOpen(false);
    setNewZoneName("");
    setNewZoneDescription("");
    setNewZoneSeverity("medium");
    setDrawingCoordinates([]);
    setDrawingMode("none");
    clearDrawingMarkers();
    clearDrawingPreview();

    if (map.current) {
      map.current.getCanvas().style.cursor = "default";
    }

    console.log("[v0] All states cleaned up after zone creation");
  };

  const handleDeleteZone = async (zoneId: string) => {
    const success = await deleteZone(zoneId);
    if (success) {
      setSelectedZone(null);
      // Refresh the map after deletion
      if (mapLoaded && map.current) {
        addHighRiskZones();
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "#eab308";
      case "medium": return "#f97316";
      case "high": return "#ef4444";
      case "critical": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case "low": return "#ca8a04";
      case "medium": return "#ea580c";
      case "high": return "#dc2626";
      case "critical": return "#b91c1c";
      default: return "#4b5563";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "low": return "secondary";
      case "medium": return "secondary";
      case "high": return "destructive";
      case "critical": return "destructive";
      default: return "outline";
    }
  };

  const getPolygonCenter = (coordinates: { lat: number; lng: number }[]) => {
    const lat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
    const lng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
    return { lat, lng };
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Generate GeoJSON data for export
  const geojsonData = {
    type: "FeatureCollection",
    features: activeZones.map((zone) => ({
      type: "Feature",
      properties: {
        id: zone.id,
        name: zone.name,
        description: zone.description,
        severity: zone.severity,
        createdAt: zone.createdAt,
        createdBy: zone.createdBy,
      },
      geometry: {
        type: "Polygon",
        coordinates: [zone.coordinates.map((coord) => [coord.lng, coord.lat])],
      },
    })),
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700">Error: {error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            High-Risk Zone Editor
            {loading && (
              <Badge variant="secondary" className="ml-2">Loading...</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Drawing Tools */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                size="sm"
                variant={drawingMode === "none" ? "default" : "ghost"}
                onClick={() => {
                  setDrawingMode("none");
                  clearDrawingMarkers();
                  clearDrawingPreview();
                  setDrawingCoordinates([]);
                  if (map.current) {
                    map.current.getCanvas().style.cursor = "default";
                  }
                }}
              >
                <MousePointer className="w-4 h-4" />
                Select
              </Button>
              <Button
                size="sm"
                variant={drawingMode === "polygon" ? "default" : "ghost"}
                onClick={startPolygonDrawing}
              >
                <Square className="w-4 h-4" />
                Draw Polygon
              </Button>
            </div>

            {/* Drawing Actions */}
            {drawingMode === "polygon" && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{drawingCoordinates.length} points</Badge>
                <Button
                  size="sm"
                  onClick={finishPolygon}
                  disabled={drawingCoordinates.length < 3}
                >
                  <Save className="w-4 h-4" />
                  Finish
                </Button>
                <Button size="sm" variant="outline" onClick={cancelDrawing}>
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const dataStr = JSON.stringify(geojsonData, null, 2);
                  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
                  const link = document.createElement("a");
                  link.setAttribute("href", dataUri);
                  link.setAttribute("download", "high-risk-zones.json");
                  link.click();
                }}
              >
                Export GeoJSON
              </Button>
              <Badge variant="secondary">
                <Shield className="w-3 h-3" />
                {activeZoneCount} Active Zones
              </Badge>
            </div>
          </div>

          {drawingMode === "polygon" && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Drawing Mode:</strong> Click on the map to add points to your polygon. You need at least 3 points to create a zone.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="px-4">
          <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
          {(!mapLoaded || loading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  {!mapLoaded ? "Loading map..." : "Loading zones data..."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Details Panel */}
        {selectedZone && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zone Details
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Zone Name</Label>
                <p className="text-sm text-muted-foreground">{selectedZone.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Severity Level</Label>
                <Badge variant={getSeverityBadgeVariant(selectedZone.severity)} className="mt-1">
                  {selectedZone.severity.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedZone.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created By</Label>
                <p className="text-sm text-muted-foreground">{selectedZone.createdBy}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-sm text-muted-foreground">{formatTimestamp(selectedZone.createdAt)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Zone
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteZone(selectedZone.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Zone
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Zone Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No zone activities yet. Create your first zone to see logs here.
                </p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        log.action === "created" ? "bg-green-500" : log.action === "deleted" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-card-foreground">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}: {log.zoneName}
                        </p>
                        <Badge
                          variant={log.action === "created" ? "default" : log.action === "deleted" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground">By: {log.officer}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Zone Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open && !isSaving) {
          resetFormAndDrawingStates();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New High-Risk Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Enter zone name"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="zone-description">Description</Label>
              <Textarea
                id="zone-description"
                value={newZoneDescription}
                onChange={(e) => setNewZoneDescription(e.target.value)}
                placeholder="Describe the risks and reasons for marking this area"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="zone-severity">Severity Level</Label>
              <select
                id="zone-severity"
                value={newZoneSeverity}
                onChange={(e) => setNewZoneSeverity(e.target.value as any)}
                className="w-full p-2 border border-border rounded-md"
                disabled={isSaving}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={resetFormAndDrawingStates}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveNewZone}
                disabled={!newZoneName.trim() || drawingCoordinates.length < 3 || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Create Zone"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}