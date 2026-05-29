import { NextResponse } from 'next/server'
import { auditEvents } from '@/lib/reconciliation-data'

export async function GET() {
  return NextResponse.json({ immutable: true, hashAlgorithm: 'SHA256', events: auditEvents })
}
