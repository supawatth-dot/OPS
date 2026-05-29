import { NextResponse } from 'next/server'
import { kpiCards, reconciliationRows } from '@/lib/reconciliation-data'

export async function GET() {
  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    formula: 'Variance = Total Imported - (Consumed + Physical Stock)',
    kpis: kpiCards,
    rows: reconciliationRows,
    counts: {
      balanced: reconciliationRows.filter((row) => row.status === 'Balanced').length,
      investigate: reconciliationRows.filter((row) => row.status === 'Investigate').length,
      critical: reconciliationRows.filter((row) => row.status === 'Critical').length,
    },
  })
}
