import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (q) {
    where.OR = [
      { blAwbNo: { contains: q } },
      { vessel: { contains: q } },
      { carrier: { contains: q } },
      { origin: { contains: q } },
      { destination: { contains: q } },
      { purchaseOrders: { some: { poNumber: { contains: q } } } },
    ]
  }
  if (status) where.status = status
  if (type === 'air') where.isAir = true
  if (type === 'sea') where.isAir = false

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: { purchaseOrders: true, alerts: { where: { isRead: false } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ])

  return NextResponse.json({ shipments, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { poNumbers, ...data } = body

  const shipment = await prisma.shipment.create({
    data: {
      ...data,
      dateDepSender: data.dateDepSender ? new Date(data.dateDepSender) : null,
      etaPort: data.etaPort ? new Date(data.etaPort) : null,
      finalEta: data.finalEta ? new Date(data.finalEta) : null,
      purchaseOrders: poNumbers?.length
        ? { create: (poNumbers as string[]).map((po: string) => ({ poNumber: po })) }
        : undefined,
      events: {
        create: [{
          eventType: 'BOOKING',
          description: 'Shipment created in system',
          timestamp: new Date(),
          source: 'MANUAL',
        }],
      },
    },
    include: { purchaseOrders: true },
  })

  return NextResponse.json(shipment, { status: 201 })
}
