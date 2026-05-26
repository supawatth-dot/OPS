'use client'
import Link from 'next/link'
import { Ship, Plane, ArrowRight, Clock } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, getDaysUntil } from '@/lib/utils'

interface Shipment {
  id: string; blAwbNo: string; isAir: boolean; status: string;
  origin: string | null; destination: string | null; carrier: string | null;
  finalEta: string | null; container20ft: number; container40ft: number;
  purchaseOrders: { poNumber: string }[];
  alerts: { id: string }[];
}

export default function RecentShipments({ shipments }: { shipments: Shipment[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="table-th">BL / AWB</th>
            <th className="table-th">Mode</th>
            <th className="table-th">Route</th>
            <th className="table-th">Carrier</th>
            <th className="table-th">Final ETA</th>
            <th className="table-th">Status</th>
            <th className="table-th">POs</th>
            <th className="table-th w-10"></th>
          </tr>
        </thead>
        <tbody>
          {shipments.length === 0 && (
            <tr>
              <td colSpan={8} className="table-td text-center text-slate-400 py-8">No shipments found</td>
            </tr>
          )}
          {shipments.map(s => {
            const days = getDaysUntil(s.finalEta)
            const overdue = days !== null && days < 0
            return (
              <tr key={s.id} className="table-row">
                <td className="table-td font-mono font-semibold text-blue-700">
                  <Link href={`/shipments/${s.id}`} className="hover:underline">{s.blAwbNo}</Link>
                  {s.alerts.length > 0 && (
                    <span className="ml-1.5 inline-block w-2 h-2 bg-red-500 rounded-full" title="Active alerts" />
                  )}
                </td>
                <td className="table-td">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.isAir ? 'text-sky-700' : 'text-slate-600'}`}>
                    {s.isAir ? <Plane size={13} /> : <Ship size={13} />}
                    {s.isAir ? 'Air' : 'Sea'}
                  </span>
                </td>
                <td className="table-td">
                  <span className="text-slate-500 text-xs">{s.origin?.split(',')[0]} → {s.destination?.split(',')[0]}</span>
                </td>
                <td className="table-td text-xs text-slate-600">{s.carrier || '—'}</td>
                <td className="table-td">
                  {s.finalEta ? (
                    <div>
                      <div className="text-xs text-slate-700">{formatDate(s.finalEta)}</div>
                      {days !== null && (
                        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : days <= 3 ? 'text-orange-600' : 'text-slate-400'}`}>
                          <Clock size={11} />
                          {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </div>
                      )}
                    </div>
                  ) : '—'}
                </td>
                <td className="table-td"><StatusBadge status={s.status} /></td>
                <td className="table-td">
                  <span className="text-xs text-slate-500">{s.purchaseOrders.slice(0, 2).map(p => p.poNumber).join(', ')}
                    {s.purchaseOrders.length > 2 && ` +${s.purchaseOrders.length - 2}`}
                  </span>
                </td>
                <td className="table-td">
                  <Link href={`/shipments/${s.id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                    <ArrowRight size={15} />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
