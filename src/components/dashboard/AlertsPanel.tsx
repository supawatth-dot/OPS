'use client'
import Link from 'next/link'
import { AlertTriangle, Info, Zap, X } from 'lucide-react'
import { SEVERITY_CONFIG, formatDateTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Alert {
  id: string; alertType: string; message: string; severity: string;
  createdAt: string; shipment: { blAwbNo: string }
}

const SEVERITY_ICONS = { LOW: Info, MEDIUM: AlertTriangle, HIGH: AlertTriangle, CRITICAL: Zap }

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const qc = useQueryClient()

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      await fetch('/api/alerts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id], isRead: true }) })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard'] }); qc.invalidateQueries({ queryKey: ['alerts-count'] }) },
  })

  if (alerts.length === 0) {
    return <div className="text-center py-8 text-slate-400 text-sm">No active alerts</div>
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map(a => {
        const cfg = SEVERITY_CONFIG[a.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.MEDIUM
        const Icon = SEVERITY_ICONS[a.severity as keyof typeof SEVERITY_ICONS] || AlertTriangle
        return (
          <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
            <Icon size={15} className={`mt-0.5 flex-shrink-0 ${cfg.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${cfg.color}`}>{a.shipment.blAwbNo}</p>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{a.message}</p>
              <p className="text-xs text-slate-400 mt-1">{formatDateTime(a.createdAt)}</p>
            </div>
            <button
              onClick={() => dismiss.mutate(a.id)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-0.5"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
      {alerts.length > 5 && (
        <Link href="/alerts" className="block text-center text-sm text-blue-600 hover:underline pt-1">
          View all {alerts.length} alerts →
        </Link>
      )}
    </div>
  )
}
