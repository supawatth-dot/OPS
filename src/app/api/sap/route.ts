export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// SAP Integration Ready Endpoint
// Maps OPS shipment data to SAP iDoc / BAPI format
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const blAwbNo = searchParams.get('blAwbNo')

  if (!blAwbNo) {
    return NextResponse.json({ error: 'blAwbNo required' }, { status: 400 })
  }

  const shipment = await prisma.shipment.findUnique({
    where: { blAwbNo },
    include: { purchaseOrders: true },
  })

  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // SAP-ready payload (TRMCS/MSEGO format)
  const sapPayload = {
    IDOC: {
      EDI_DC40: {
        TABNAM: 'EDI_DC40',
        DIRECT: '2',
        IDOCTYP: 'SHIPMENT01',
        MESTYP: 'SHPMNT',
        SNDPRT: 'LS',
        SNDPRN: 'OPS_TMS',
        RCVPRT: 'LS',
        RCVPRN: 'SAP_ERP',
      },
      E1SHPMNT: {
        TKNUM: shipment.blAwbNo,
        VSART: shipment.isAir ? 'AIR' : 'SEA',
        INCO1: shipment.incoterm || '',
        ABFER: shipment.dateDepSender?.toISOString().split('T')[0] || '',
        LTRMK: shipment.finalEta?.toISOString().split('T')[0] || '',
        TDLNR: shipment.carrier || '',
        STATUS: shipment.status,
        PURCHASE_ORDERS: shipment.purchaseOrders.map(po => ({
          EBELN: po.poNumber,
          MENGE: po.quantity || 0,
          WAERS: 'USD',
          NETWR: po.value || 0,
        })),
      },
    },
    metadata: {
      generated: new Date().toISOString(),
      source: 'OPS_LOGISTICS_TMS',
      version: '2.0',
    },
  }

  return NextResponse.json(sapPayload)
}

export async function POST(req: NextRequest) {
  // Receive SAP GR (Goods Receipt) confirmation and update shipment
  const body = await req.json()
  const { blAwbNo, grNumber, status } = body

  if (!blAwbNo) return NextResponse.json({ error: 'blAwbNo required' }, { status: 400 })

  const shipment = await prisma.shipment.findUnique({ where: { blAwbNo } })
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      eventType: 'OTHER',
      description: `SAP GR Confirmation received: ${grNumber || 'N/A'}`,
      timestamp: new Date(),
      source: 'SAP',
    },
  })

  if (status) {
    await prisma.shipment.update({ where: { id: shipment.id }, data: { status } })
  }

  return NextResponse.json({ success: true, shipmentId: shipment.id, grNumber })
}
