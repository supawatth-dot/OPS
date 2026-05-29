import { NextResponse } from 'next/server'
import { reconciliationRows } from '@/lib/reconciliation-data'

export async function GET() {
  return NextResponse.json({
    alerts: reconciliationRows.filter((row) => row.status !== 'Balanced'),
    tolerancePolicy: 'Critical when absolute variance percentage exceeds part tolerance percentage.',
  })
}
