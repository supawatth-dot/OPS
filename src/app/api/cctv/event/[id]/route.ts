import { NextResponse } from 'next/server'
import { cctvEvents } from '@/lib/reconciliation-data'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, marker: '00:14:08', relatedTransaction: params.id.replace('CCTV-', ''), events: cctvEvents })
}
