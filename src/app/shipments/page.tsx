'use client'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Upload, Filter, Ship, Plane, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import ImportExcel from '@/components/shipments/ImportExcel'
import { formatDate, getDaysUntil, formatCurrency, formatWeight } from '@/lib/utils'

const STATUSES = ['', 'PENDING', 'IN_TRANSIT', 'AT_PORT', 'CUSTOMS', 'DELIVERING', 'RECEIVED', 'DELAYED']

function ShipmentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showImport, setShowImport] = useState(false)
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { setQ(searchParams.get('q') || '') }, [searchParams])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shipments', q, status, type, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20', page: String(page) })
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (type) params.set('type', type)
      const res = await fetch(`/api/shipments?${params}`)
      return res.json()
    },
  })

  const shipments = data?.shipments || []

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
          <p className="text-slate-500 text-sm">{data?.total ?? '...'} total shipments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary">
            <Upload size={14} /> Import Excel
          </button>
          <Link href="/shipments/new" className="btn-primary">
            <Plus size={14} /> New Shipment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8"
              placeholder="Search BL/AWB, PO, carrier..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
            />
          </div>
          <select className="select w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="select w-32" value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            <option value="">All Modes</option>
            <option value="sea">Sea Freight</option>
            <option value="air">Air Freight</option>
          </select>
          <button onClick={() => { setQ(''); setStatus(''); setType(''); setPage(1) }} className="btn-secondary">
            <Filter size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="table-th">BL / AWB No.</th>
                <th className="table-th">Mode</th>
                <th className="table-th">Origin → Destination</th>
                <th className="table-th">Carrier / Vessel</th>
                <th className="table-th">Dep. Date</th>
                <th className="table-th">ETA Port</th>
                <th className="table-th">Final ETA</th>
                <th className="table-th">Containers</th>
                <th className="table-th">Weight</th>
                <th className="table-th">Freight</th>
                <th className="table-th">Status</th>
                <th className="table-th">POs</th>
                <th className="table-th w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(13).fill(0).map((_, j) => (
                    <td key={j} className="table-td"><div className="h-4 bg-slate-100 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && shipments.length === 0 && (
                <tr><td colSpan={13} className="table-td text-center py-12 text-slate-400">No shipments found</td></tr>
              )}
              {shipments.map((s: Record<string, unknown>) => {
                const days = getDaysUntil(s.finalEta as string)
                const overdue = days !== null && days < 0
                return (
                  <tr key={s.id as string} className="table-row">
                    <td className="table-td">
                      <Link href={`/shipments/${s.id}`} className="font-mono font-semibold text-blue-700 hover:underline">{s.blAwbNo as string}</Link>
                    </td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.isAir ? 'text-sky-700' : 'text-slate-600'}`}>
                        {s.isAir ? <Plane size={12} /> : <Ship size={12} />}
                        {s.isAir ? 'Air' : 'Sea'}
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-600">{(s.origin as string)?.split(',')[0]} → {(s.destination as string)?.split(',')[0]}</td>
                    <td className="table-td text-xs">
                      <div>{s.carrier as string || '—'}</div>
                      <div className="text-slate-400">{s.vessel as string || ''}</div>
                    </td>
                    <td className="table-td text-xs text-slate-600">{formatDate(s.dateDepSender as string)}</td>
                    <td className="table-td text-xs text-slate-600">{formatDate(s.etaPort as string)}</td>
                    <td className="table-td">
                      <div className="text-xs text-slate-700">{formatDate(s.finalEta as string)}</div>
                      {days !== null && (
                        <div className={`text-xs ${overdue ? 'text-red-600 font-medium' : days <= 3 ? 'text-orange-600' : 'text-slate-400'}`}>
                          {overdue ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-xs text-slate-600">
                      {(s.container20ft as number) > 0 && <span>{s.container20ft as number}×20ft </span>}
                      {(s.container40ft as number) > 0 && <span>{s.container40ft as number}×40ft</span>}
                      {!(s.container20ft as number) && !(s.container40ft as number) && '—'}
                    </td>
                    <td className="table-td text-xs text-slate-600">{formatWeight(s.weight as number)}</td>
                    <td className="table-td text-xs text-slate-600">{formatCurrency(s.freightCost as number)}</td>
                    <td className="table-td"><StatusBadge status={s.status as string} /></td>
                    <td className="table-td text-xs text-slate-500">
                      {(s.purchaseOrders as { poNumber: string }[])?.slice(0,2).map(p => p.poNumber).join(', ')}
                      {(s.purchaseOrders as unknown[])?.length > 2 && ` +${(s.purchaseOrders as unknown[]).length - 2}`}
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

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary disabled:opacity-40 py-1 px-2">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary disabled:opacity-40 py-1 px-2">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showImport && <ImportExcel onClose={() => { setShowImport(false); refetch() }} />}
    </div>
  )
}

export default function ShipmentsPage() {
  return <Suspense><ShipmentsContent /></Suspense>
}
