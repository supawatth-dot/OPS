import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  const timestamp = new Date().toISOString()
  const hashValue = createHash('sha256').update(JSON.stringify({ payload, timestamp })).digest('hex')

  return NextResponse.json({
    status: 'flagged',
    caseId: `AUD-${Date.now()}`,
    timestamp,
    hashValue,
    immutable: true,
  }, { status: 201 })
}
