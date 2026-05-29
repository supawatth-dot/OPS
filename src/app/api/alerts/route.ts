export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const unread = searchParams.get('unread') === 'true'

  const where = unread ? { isRead: false } : {}
  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: { shipment: { select: { blAwbNo: true, status: true, finalEta: true } } },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    }),
    prisma.alert.count({ where }),
  ])

  return NextResponse.json({ alerts, total })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { ids, isRead } = body

  await prisma.alert.updateMany({
    where: { id: { in: ids } },
    data: { isRead, resolvedAt: isRead ? new Date() : null },
  })

  return NextResponse.json({ success: true })
}
