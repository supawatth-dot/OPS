import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shipmentId = searchParams.get('shipmentId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where = shipmentId ? { shipmentId } : {}
  const [records, total] = await Promise.all([
    prisma.receivingRecord.findMany({
      where,
      include: { shipment: { select: { blAwbNo: true, status: true } } },
      orderBy: { receivedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.receivingRecord.count({ where }),
  ])

  return NextResponse.json({ records, total })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { shipmentId, receivedBy, quantity, condition, notes, location, poNumber } = body

  const record = await prisma.receivingRecord.create({
    data: {
      shipmentId,
      receivedBy,
      receivedAt: new Date(),
      quantity: parseInt(quantity),
      condition: condition || 'GOOD',
      notes,
      location,
      poNumber,
      barcodeData: `OPS-RCV-${Date.now()}`,
    },
    include: { shipment: true },
  })

  await prisma.shipmentEvent.create({
    data: {
      shipmentId,
      eventType: 'DELIVERED',
      description: `Received ${quantity} units by ${receivedBy} at ${location || 'Warehouse'}`,
      location: location || 'Warehouse',
      timestamp: new Date(),
      source: 'RECEIVING',
    },
  })

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status: 'RECEIVED' },
  })

  return NextResponse.json(record, { status: 201 })
}
