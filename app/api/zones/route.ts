// app/api/zones/route.ts (for App Router) or pages/api/zones.ts (for Pages Router)

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface HighRiskZone {
  id: string
  name: string
  description: string
  coordinates: { lat: number; lng: number }[]
  severity: "low" | "medium" | "high" | "critical"
  createdAt: string
  createdBy: string
  isActive: boolean
}

interface ZoneLog {
  id: string
  action: "created" | "deleted" | "modified"
  zoneName: string
  timestamp: string
  officer: string
  details: string
}

interface ZonesData {
  zones: HighRiskZone[]
  logs: ZoneLog[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const ZONES_FILE = path.join(DATA_DIR, 'zones.json')
console.log(ZONES_FILE)
// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

// GET - Load zones data
export async function GET() {
  try {
    await ensureDataDir()
    
    if (!existsSync(ZONES_FILE)) {
      // Return empty data if file doesn't exist
      const emptyData: ZonesData = { zones: [], logs: [] }
      return NextResponse.json(emptyData)
    }

    const data = await readFile(ZONES_FILE, 'utf8')
    const zonesData: ZonesData = JSON.parse(data)
    
    console.log(`[API] Loaded ${zonesData.zones?.length || 0} zones from file`)
    return NextResponse.json(zonesData)
    
  } catch (error) {
    console.error('[API] Error reading zones file:', error)
    return NextResponse.json(
      { error: 'Failed to load zones data' },
      { status: 500 }
    )
  }
}

// POST - Save zones data
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    
    const zonesData: ZonesData = await request.json()
    
    // Validate the data structure
    if (!zonesData.zones || !Array.isArray(zonesData.zones)) {
      return NextResponse.json(
        { error: 'Invalid zones data structure' },
        { status: 400 }
      )
    }

    if (!zonesData.logs || !Array.isArray(zonesData.logs)) {
      return NextResponse.json(
        { error: 'Invalid logs data structure' },
        { status: 400 }
      )
    }

    // Save to file with pretty formatting
    const jsonData = JSON.stringify(zonesData, null, 2)
    await writeFile(ZONES_FILE, jsonData, 'utf8')
    
    console.log(`[API] Saved ${zonesData.zones.length} zones to file`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Saved ${zonesData.zones.length} zones and ${zonesData.logs.length} logs` 
    })
    
  } catch (error) {
    console.error('[API] Error saving zones file:', error)
    return NextResponse.json(
      { error: 'Failed to save zones data' },
      { status: 500 }
    )
  }
}

// Optional: DELETE endpoint to clear all data
export async function DELETE() {
  try {
    if (existsSync(ZONES_FILE)) {
      const emptyData: ZonesData = { zones: [], logs: [] }
      await writeFile(ZONES_FILE, JSON.stringify(emptyData, null, 2), 'utf8')
      console.log('[API] Cleared all zones data')
    }
    
    return NextResponse.json({ success: true, message: 'All zones data cleared' })
    
  } catch (error) {
    console.error('[API] Error clearing zones file:', error)
    return NextResponse.json(
      { error: 'Failed to clear zones data' },
      { status: 500 }
    )
  }
}