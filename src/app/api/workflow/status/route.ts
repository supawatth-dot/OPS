import { NextResponse } from 'next/server'
import { workflowSteps } from '@/lib/reconciliation-data'

export async function GET() {
  return NextResponse.json({ workflow: workflowSteps })
}
