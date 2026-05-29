import { NextResponse } from 'next/server'
import { warehouseZones } from '@/lib/reconciliation-data'

export async function GET() {
  return NextResponse.json({ refreshedAt: new Date().toISOString(), zones: warehouseZones })
}
