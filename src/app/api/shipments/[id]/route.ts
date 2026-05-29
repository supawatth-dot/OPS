export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    include: {
      purchaseOrders: { orderBy: { createdAt: 'asc' } },
      events: { orderBy: { timestamp: 'asc' } },
      receivings: { orderBy: { receivedAt: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(shipment)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { poNumbers, addEvent, ...data } = body

  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: {
      ...data,
      dateDepSender: data.dateDepSender ? new Date(data.dateDepSender) : undefined,
      etaPort: data.etaPort ? new Date(data.etaPort) : undefined,
      finalEta: data.finalEta ? new Date(data.finalEta) : undefined,
      events: addEvent ? {
        create: [{
          eventType: addEvent.eventType,
          description: addEvent.description,
          location: addEvent.location,
          timestamp: new Date(),
          source: 'MANUAL',
        }],
      } : undefined,
    },
    include: { purchaseOrders: true, events: true, alerts: true, receivings: true },
  })

  if (data.status === 'DELAYED') {
    await prisma.alert.create({
      data: {
        shipmentId: params.id,
        alertType: 'DELAY',
        message: `Shipment ${updated.blAwbNo} marked as delayed`,
        severity: 'HIGH',
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.shipment.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
