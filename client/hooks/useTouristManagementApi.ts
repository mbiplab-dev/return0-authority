// =============================================================================
// TOURIST MANAGEMENT API INTEGRATION HOOK
// File path: hooks/useTouristManagementApi.ts
// =============================================================================

import { useState, useCallback } from 'react';

// Types for tourist management
interface TouristProfile {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    gender?: string;
    profilePicture?: string;
    passportNumber?: string;
    passportExpiry?: string;
    visaNumber?: string;
    visaExpiry?: string;
    aadhaarNumber?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email: string;
    };
    localContact?: {
      name: string;
      phone: string;
      address: string;
    };
    lastKnownLocation?: {
      coordinates: { lat: number; lng: number };
      address: string;
      timestamp: string;
    };
    medicalConditions?: string;
    allergies?: string;
    medications?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
  status: 'active' | 'inactive' | 'missing' | 'flagged' | 'departed';
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalComplaints: number;
    lastComplaint?: {
      location: string;
      timestamp: string;
      category: string;
      status: string;
    };
  };
}

interface TouristFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  nationality?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

interface TouristStats {
  overview: {
    total: number;
    active: number;
    flagged: number;
    newRegistrations: number;
  };
  breakdown: {
    byNationality: Record<string, number>;
    byStatus: Record<string, number>;
  };
  recentActivity: any[];
  timeframe: string;
}

interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useTouristManagementApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic API call function
  const apiCall = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T> & T> => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}/tourist-management${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all tourists with filters
  const fetchTourists = useCallback(async (filters: TouristFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/tourists${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall<{
      tourists: TouristProfile[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(endpoint);
  }, [apiCall]);

  // Fetch single tourist profile
  const fetchTouristProfile = useCallback(async (touristId: string) => {
    return await apiCall<{ tourist: TouristProfile }>(`/tourists/${touristId}`);
  }, [apiCall]);

  // Update tourist profile
  const updateTouristProfile = useCallback(async (touristId: string, updates: Partial<TouristProfile>) => {
    return await apiCall<{ tourist: TouristProfile }>(`/tourists/${touristId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }, [apiCall]);

  // Flag/unflag tourist
  const flagTourist = useCallback(async (touristId: string, flag: boolean, reason?: string) => {
    return await apiCall<{ tourist: TouristProfile }>(`/tourists/${touristId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ flag, reason }),
    });
  }, [apiCall]);

  // Track tourist location
  const trackLocation = useCallback(async (
    touristId: string, 
    coordinates: { lat: number; lng: number }, 
    address: string, 
    notes?: string
  ) => {
    return await apiCall<{ location: any }>(`/tourists/${touristId}/location`, {
      method: 'POST',
      body: JSON.stringify({ coordinates, address, notes }),
    });
  }, [apiCall]);

  // Get tourist statistics
  const fetchTouristStats = useCallback(async (timeframe: string = '30d') => {
    return await apiCall<{ statistics: TouristStats }>(`/statistics/overview?timeframe=${timeframe}`);
  }, [apiCall]);

  return {
    loading,
    error,
    fetchTourists,
    fetchTouristProfile,
    updateTouristProfile,
    flagTourist,
    trackLocation,
    fetchTouristStats,
  };
};