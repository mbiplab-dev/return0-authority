// =============================================================================
// ZONES MANAGEMENT HOOK
// File path: hooks/useZones.ts
// =============================================================================

import { useState, useCallback } from 'react';

export interface HighRiskZone {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number }[];
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface ZoneLog {
  id: string;
  action: "created" | "deleted" | "modified";
  zoneName: string;
  timestamp: string;
  officer: string;
  details: string;
}

interface ZonesData {
  zones: HighRiskZone[];
  logs: ZoneLog[];
}

interface ApiResponse {
  message: string;
  zonesCount?: number;
  logsCount?: number;
  error?: string;
}

// API URL - Update this to match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useZones = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<HighRiskZone[]>([]);
  const [logs, setLogs] = useState<ZoneLog[]>([]);

  // Load zones data from API
  const loadZones = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[useZones] Loading zones data from API");

      const response = await fetch(`${API_BASE_URL}/zones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ZonesData = await response.json();
        setZones(data.zones || []);
        setLogs(data.logs || []);
        console.log("[useZones] Loaded zones:", data.zones?.length || 0);
        return true;
      } else if (response.status === 404) {
        console.log("[useZones] No existing zones found, starting fresh");
        setZones([]);
        setLogs([]);
        return true;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("[useZones] Error loading zones:", errorMessage);
      setError(errorMessage);
      setZones([]);
      setLogs([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save zones data to API
  const saveZones = useCallback(async (zonesData: HighRiskZone[], logsData: ZoneLog[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const payload: ZonesData = { 
        zones: zonesData, 
        logs: logsData 
      };

      console.log("[useZones] Saving zones data to API:", payload);

      const response = await fetch(`${API_BASE_URL}/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        console.log("[useZones] Zones data saved successfully:", result);
        
        // Update local state after successful save
        setZones(zonesData);
        setLogs(logsData);
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("[useZones] Error saving zones:", errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new zone
  const createZone = useCallback(async (
    name: string,
    description: string,
    coordinates: { lat: number; lng: number }[],
    severity: "low" | "medium" | "high" | "critical"
  ): Promise<boolean> => {
    try {
      const newZone: HighRiskZone = {
        id: `HRZ${String(zones.length + 1).padStart(3, "0")}`,
        name,
        description,
        coordinates,
        severity,
        createdAt: new Date().toISOString(),
        createdBy: "Police Department",
        isActive: true,
      };

      const updatedZones = [...zones, newZone];

      const logEntry: ZoneLog = {
        id: `LOG${String(logs.length + 1).padStart(3, "0")}`,
        action: "created",
        zoneName: name,
        timestamp: new Date().toISOString(),
        officer: "Police Department",
        details: `New ${severity} severity zone created: ${description}`,
      };
      const updatedLogs = [logEntry, ...logs];

      console.log("[useZones] Creating new zone:", newZone);

      // Save to API
      const success = await saveZones(updatedZones, updatedLogs);
      
      if (success) {
        console.log("[useZones] Zone created successfully");
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("[useZones] Error creating zone:", errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [zones, logs, saveZones]);

  // Delete a zone (mark as inactive)
  const deleteZone = useCallback(async (zoneId: string): Promise<boolean> => {
    try {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) {
        throw new Error("Zone not found");
      }

      const updatedZones = zones.map((z) =>
        z.id === zoneId ? { ...z, isActive: false } : z
      );

      const logEntry: ZoneLog = {
        id: `LOG${String(logs.length + 1).padStart(3, "0")}`,
        action: "deleted",
        zoneName: zone.name,
        timestamp: new Date().toISOString(),
        officer: "Police Department",
        details: "High-risk zone deactivated",
      };
      const updatedLogs = [logEntry, ...logs];

      console.log("[useZones] Deleting zone:", zoneId);

      // Save to API
      const success = await saveZones(updatedZones, updatedLogs);
      
      if (success) {
        console.log("[useZones] Zone deleted successfully");
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("[useZones] Error deleting zone:", errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [zones, logs, saveZones]);

  // Get active zones only
  const getActiveZones = useCallback(() => {
    return zones.filter(zone => zone.isActive);
  }, [zones]);

  // Get recent logs
  const getRecentLogs = useCallback((limit: number = 10) => {
    return logs.slice(0, limit);
  }, [logs]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    zones,
    logs,
    loading,
    error,
    
    // Actions
    loadZones,
    saveZones,
    createZone,
    deleteZone,
    clearError,
    
    // Computed
    activeZones: getActiveZones(),
    recentLogs: getRecentLogs(),
    
    // Stats
    totalZones: zones.length,
    activeZoneCount: getActiveZones().length,
    totalLogs: logs.length,
  };
};