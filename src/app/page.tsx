'use client'
import { useQuery } from '@tanstack/react-query'
import KPICards from '@/components/dashboard/KPICards'
import RecentShipments from '@/components/dashboard/RecentShipments'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { TrendChart, StatusPieChart } from '@/components/dashboard/ShipmentChart'
import { RefreshCw, TrendingUp, AlertTriangle, Ship } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const { data: analytics, isLoading: aLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/analytics')
      return res.json()
    },
    refetchInterval: 60_000,
  })

  const { data: shipmentsData, isLoading: sLoading } = useQuery({
    queryKey: ['shipments-recent'],
    queryFn: async () => {
      const res = await fetch('/api/shipments?limit=10')
      return res.json()
    },
  })

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/alerts?unread=true')
      return res.json()
    },
  })

  const loading = aLoading || sLoading

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time shipment visibility & control</p>
        </div>
        <div className="flex items-center gap-3">
          {analytics?.kpis && (
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              <Ship size={14} />
              <span>Freight: <strong className="text-slate-800">{formatCurrency(analytics.kpis.totalFreight)}</strong></span>
            </div>
          )}
          <button onClick={() => refetch()} className="btn-secondary" title="Refresh">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-8 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : analytics?.kpis ? (
        <KPICards kpis={analytics.kpis} />
      ) : null}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-800">Shipment Activity (30 days)</h2>
            </div>
          </div>
          <div className="card-body">
            {analytics?.trend ? <TrendChart data={analytics.trend} /> : (
              <div className="h-[220px] bg-slate-100 animate-pulse rounded-lg" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Status Distribution</h2>
          </div>
          <div className="card-body">
            {analytics?.statusDist ? (
              <StatusPieChart data={analytics.statusDist.filter((d: { value: number }) => d.value > 0)} />
            ) : (
              <div className="h-[220px] bg-slate-100 animate-pulse rounded-lg" />
            )}
          </div>
        </div>
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Recent Shipments</h2>
            <a href="/shipments" className="text-sm text-blue-600 hover:underline">View all →</a>
          </div>
          <div className="overflow-hidden">
            {sLoading ? (
              <div className="p-6 space-y-3">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded" />)}
              </div>
            ) : (
              <RecentShipments shipments={shipmentsData?.shipments || []} />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <h2 className="font-semibold text-slate-800">Active Alerts</h2>
            </div>
            {alertsData?.total > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{alertsData.total}</span>
            )}
          </div>
          <div className="card-body">
            <AlertsPanel alerts={alertsData?.alerts || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
