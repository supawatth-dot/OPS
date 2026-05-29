export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET() {
  const [
    totalShipments,
    byStatus,
    byType,
    recentActivity,
    alertStats,
    receivingStats,
    delayedShipments,
    totalFreight,
  ] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.groupBy({ by: ['status'], _count: true }),
    prisma.shipment.groupBy({ by: ['isAir'], _count: true }),
    prisma.shipment.findMany({
      where: { createdAt: { gte: subDays(new Date(), 30) } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.alert.groupBy({ by: ['severity', 'isRead'], _count: true }),
    prisma.receivingRecord.aggregate({ _sum: { quantity: true }, _count: true }),
    prisma.shipment.count({ where: { status: 'DELAYED' } }),
    prisma.shipment.aggregate({ _sum: { freightCost: true }, _avg: { freightCost: true } }),
  ])

  const statusMap: Record<string, number> = {}
  byStatus.forEach(r => { statusMap[r.status] = r._count })

  const kpis = {
    total: totalShipments,
    inTransit: statusMap['IN_TRANSIT'] || 0,
    atPort: statusMap['AT_PORT'] || 0,
    customs: statusMap['CUSTOMS'] || 0,
    delivering: statusMap['DELIVERING'] || 0,
    received: statusMap['RECEIVED'] || 0,
    delayed: delayedShipments,
    pending: statusMap['PENDING'] || 0,
    airCount: byType.find(t => t.isAir)?._count || 0,
    seaCount: byType.find(t => !t.isAir)?._count || 0,
    onTimeRate: totalShipments > 0 ? Math.round(((totalShipments - delayedShipments) / totalShipments) * 100) : 0,
    totalFreight: totalFreight._sum.freightCost || 0,
    avgFreight: Math.round(totalFreight._avg.freightCost || 0),
    totalReceived: receivingStats._sum.quantity || 0,
    receivingCount: receivingStats._count,
    unreadAlerts: alertStats.filter(a => !a.isRead).reduce((s, a) => s + a._count, 0),
  }

  const byDay: Record<string, number> = {}
  recentActivity.forEach(s => {
    const day = new Date(s.createdAt).toISOString().split('T')[0]
    byDay[day] = (byDay[day] || 0) + 1
  })
  const trend = Object.entries(byDay).map(([date, count]) => ({ date, count })).slice(-14)

  const statusDist = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  return NextResponse.json({ kpis, trend, statusDist, byStatus: statusMap })
}
