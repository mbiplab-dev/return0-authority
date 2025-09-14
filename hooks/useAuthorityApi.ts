// hooks/useAuthorityApi.ts
import { useState, useEffect, useCallback } from 'react';

// Types
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

interface ComplaintStats {
  summary: {
    total: number;
    active: number;
    critical: number;
    emergency: number;
    resolved: number;
    resolutionRate: number;
    averageResponseTime: number;
  };
  breakdown: {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byUrgency: Record<string, number>;
  };
}

interface ApiFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  urgency?: string;
  assignedDepartment?: string;
  isEmergency?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthorityApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage (adjust based on your auth implementation)
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    return null;
  }, []);

  // Generic API call function
  const apiCall = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}/authority${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { message: data.message, data: data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { message: 'Error', error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Fetch complaints with filters
  const fetchComplaints = useCallback(async (filters: ApiFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/complaints${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall<{
      complaints: Alert[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(endpoint);

    return response;
  }, [apiCall]);

  // Fetch complaint statistics
  const fetchComplaintStats = useCallback(async (timeframe: string = '24h') => {
    const response = await apiCall<{ stats: ComplaintStats; timeframe: string }>(`/complaints/stats?timeframe=${timeframe}`);
    return response;
  }, [apiCall]);

  // Fetch single complaint details
  const fetchComplaintDetails = useCallback(async (complaintId: string) => {
    const response = await apiCall<{ complaint: Alert }>(`/complaints/${complaintId}`);
    return response;
  }, [apiCall]);

  // Acknowledge complaint
  const acknowledgeComplaint = useCallback(async (
    complaintId: string,
    officerName?: string,
    notes?: string
  ) => {
    const response = await apiCall<{ complaint: { id: string; status: string } }>(
      `/complaints/${complaintId}/acknowledge`,
      {
        method: 'PATCH',
        body: JSON.stringify({ officerName, notes }),
      }
    );
    return response;
  }, [apiCall]);

  // Resolve complaint
  const resolveComplaint = useCallback(async (
    complaintId: string,
    resolutionNotes: string,
    actionTaken?: string,
    officerName?: string
  ) => {
    const response = await apiCall<{ complaint: { id: string; status: string; resolution: any } }>(
      `/complaints/${complaintId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify({ officerName, resolutionNotes, actionTaken }),
      }
    );
    return response;
  }, [apiCall]);

  // Escalate to FIR
  const escalateToFIR = useCallback(async (
    complaintId: string,
    escalationNotes: string,
    officerName?: string,
    firNumber?: string
  ) => {
    const response = await apiCall<{ complaint: { id: string; status: string; firNumber: string } }>(
      `/complaints/${complaintId}/escalate`,
      {
        method: 'PATCH',
        body: JSON.stringify({ officerName, escalationNotes, firNumber }),
      }
    );
    return response;
  }, [apiCall]);

  // Add communication
  const addCommunication = useCallback(async (
    complaintId: string,
    message: string,
    officerName?: string
  ) => {
    const response = await apiCall<{ communication: { from: string; message: string; timestamp: string } }>(
      `/complaints/${complaintId}/communication`,
      {
        method: 'POST',
        body: JSON.stringify({ message, officerName }),
      }
    );
    return response;
  }, [apiCall]);

  // Fetch nearby complaints for map
  const fetchNearbyComplaints = useCallback(async (
    lat: number,
    lng: number,
    radius: number = 5000
  ) => {
    const response = await apiCall<{ complaints: Alert[] }>(
      `/complaints/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response;
  }, [apiCall]);

  return {
    loading,
    error,
    fetchComplaints,
    fetchComplaintStats,
    fetchComplaintDetails,
    acknowledgeComplaint,
    resolveComplaint,
    escalateToFIR,
    addCommunication,
    fetchNearbyComplaints,
  };
};