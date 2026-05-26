'use client'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, DollarSign, Package, Clock, CheckCircle2 } from 'lucide-react'
import { TrendChart, StatusPieChart, FreightBarChart } from '@/components/dashboard/ShipmentChart'
import { formatCurrency, STATUS_CONFIG } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics')
      return res.json()
    },
    refetchInterval: 60_000,
  })

  const kpis = data?.kpis
  const barData = data?.statusDist || []

  const kpiCards = kpis ? [
    { icon: Package,      label: 'Total Shipments',   value: kpis.total,                    sub: `${kpis.airCount} air · ${kpis.seaCount} sea`,       color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: TrendingUp,   label: 'On-Time Rate',      value: `${kpis.onTimeRate}%`,         sub: `${kpis.delayed} delayed`,                            color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: DollarSign,   label: 'Total Freight',     value: formatCurrency(kpis.totalFreight), sub: `Avg ${formatCurrency(kpis.avgFreight)}/shipment`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: CheckCircle2, label: 'Received',          value: kpis.received,                 sub: `${kpis.receivingCount} receiving records`,           color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { icon: Clock,        label: 'In Transit',        value: kpis.inTransit,                sub: `${kpis.atPort} at port`,                             color: 'text-cyan-600',   bg: 'bg-cyan-50' },
    { icon: BarChart3,    label: 'Unread Alerts',     value: kpis.unreadAlerts,             sub: 'Active issues',                                       color: 'text-red-600',    bg: 'bg-red-50' },
  ] : []

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & KPIs</h1>
        <p className="text-slate-500 text-sm">Enterprise logistics performance metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-xl" />) :
          kpiCards.map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-600 font-medium mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-blue-600" /> Shipment Volume (30 days)</h2>
          </div>
          <div className="card-body">
            {data?.trend ? <TrendChart data={data.trend} /> : <div className="h-[220px] bg-slate-100 animate-pulse rounded" />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Status Breakdown</h2>
          </div>
          <div className="card-body">
            {data?.statusDist ? <FreightBarChart data={barData} /> : <div className="h-[220px] bg-slate-100 animate-pulse rounded" />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Status Distribution</h2>
          </div>
          <div className="card-body">
            {data?.statusDist ? <StatusPieChart data={data.statusDist} /> : <div className="h-[220px] bg-slate-100 animate-pulse rounded" />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Status Summary Table</h2>
          </div>
          <div className="card-body">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Count</th>
                  <th className="table-th text-right">Share</th>
                  <th className="table-th">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {barData.map(({ name, value }: { name: string; value: number }) => {
                  const cfg = STATUS_CONFIG[name]
                  const pct = kpis ? Math.round((value / kpis.total) * 100) : 0
                  return (
                    <tr key={name} className="border-b border-slate-100">
                      <td className="table-td">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg?.color || 'text-slate-600'}`}>
                          <span className={`w-2 h-2 rounded-full ${cfg?.dot || 'bg-slate-400'}`} />
                          {cfg?.label || name}
                        </span>
                      </td>
                      <td className="table-td text-right font-bold">{value}</td>
                      <td className="table-td text-right text-slate-500">{pct}%</td>
                      <td className="table-td">
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${cfg?.dot?.replace('bg-', 'bg-') || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance indicators */}
      {kpis && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Performance Indicators</h2>
          </div>
          <div className="card-body grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'On-Time Delivery', value: kpis.onTimeRate, target: 95, unit: '%' },
              { label: 'Received vs Total', value: kpis.total > 0 ? Math.round((kpis.received / kpis.total) * 100) : 0, target: 80, unit: '%' },
              { label: 'In-Transit Load', value: kpis.total > 0 ? Math.round((kpis.inTransit / kpis.total) * 100) : 0, target: 50, unit: '%' },
              { label: 'Delay Rate', value: kpis.total > 0 ? Math.round((kpis.delayed / kpis.total) * 100) : 0, target: 5, unit: '%', inverse: true },
            ].map(({ label, value, target, unit, inverse }) => {
              const good = inverse ? value <= target : value >= target
              return (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className={`text-lg font-bold ${good ? 'text-green-600' : 'text-red-600'}`}>{value}{unit}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full transition-all ${good ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Target: {target}{unit}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
