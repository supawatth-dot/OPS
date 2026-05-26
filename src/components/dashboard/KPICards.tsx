'use client'
import { Package, Truck, Clock, CheckCircle, AlertTriangle, TrendingUp, Ship, Plane } from 'lucide-react'

interface KPI {
  total: number; inTransit: number; delayed: number; received: number;
  customs: number; delivering: number; atPort: number; pending: number;
  airCount: number; seaCount: number; onTimeRate: number;
  totalFreight: number; unreadAlerts: number;
}

const cards = [
  { key: 'total',       label: 'Total Shipments', icon: Package,       color: 'bg-slate-700', textColor: 'text-white' },
  { key: 'inTransit',   label: 'In Transit',      icon: Truck,         color: 'bg-blue-600',  textColor: 'text-white' },
  { key: 'atPort',      label: 'At Port',         icon: Ship,          color: 'bg-cyan-600',  textColor: 'text-white' },
  { key: 'customs',     label: 'At Customs',      icon: Clock,         color: 'bg-orange-500',textColor: 'text-white' },
  { key: 'delivering',  label: 'Delivering',      icon: Truck,         color: 'bg-purple-600',textColor: 'text-white' },
  { key: 'received',    label: 'Received',        icon: CheckCircle,   color: 'bg-green-600', textColor: 'text-white' },
  { key: 'delayed',     label: 'Delayed',         icon: AlertTriangle, color: 'bg-red-600',   textColor: 'text-white' },
  { key: 'onTimeRate',  label: 'On-Time Rate',    icon: TrendingUp,    color: 'bg-emerald-600',textColor: 'text-white', suffix: '%' },
]

export default function KPICards({ kpis }: { kpis: KPI }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map(({ key, label, icon: Icon, color, textColor, suffix }) => {
        const value = kpis[key as keyof KPI]
        const isAlert = key === 'delayed' && Number(value) > 0
        return (
          <div key={key} className={`${color} rounded-xl p-4 relative overflow-hidden ${isAlert ? 'ring-2 ring-red-300' : ''}`}>
            <div className="absolute top-2 right-2 opacity-20">
              <Icon size={28} className="text-white" />
            </div>
            <p className={`text-xs font-medium ${textColor} opacity-70 leading-tight mb-1`}>{label}</p>
            <p className={`text-2xl font-bold ${textColor}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {key === 'inTransit' && (
              <div className="flex gap-1 mt-1">
                <span className="text-white/70 text-xs flex items-center gap-0.5"><Plane size={10} />{kpis.airCount}</span>
                <span className="text-white/70 text-xs flex items-center gap-0.5"><Ship size={10} />{kpis.seaCount}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
