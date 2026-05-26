'use client'
import { EVENT_CONFIG, formatDateTime } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

interface Event {
  id: string; eventType: string; description: string; location: string | null; timestamp: string; source: string
}

const ORDER = ['BOOKING','PICKUP','DEPARTURE','TRANSIT','ARRIVAL','CUSTOMS','CUSTOMS_CLEARED','OUT_FOR_DELIVERY','DELIVERED','DELAY']

export default function ShipmentTimeline({ events }: { events: Event[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const now = Date.now()

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {sorted.map((ev, i) => {
          const isPast = new Date(ev.timestamp).getTime() <= now
          const cfg = EVENT_CONFIG[ev.eventType] || EVENT_CONFIG.OTHER
          const isLast = i === sorted.length - 1
          return (
            <div key={ev.id} className="flex gap-4 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-base
                ${isPast ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                {isPast ? (isLast ? <CheckCircle2 size={16} /> : <span className="text-xs">{cfg.icon}</span>) : <Circle size={14} />}
              </div>
              <div className={`flex-1 pb-2 ${!isPast ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{ev.description}</p>
                    {ev.location && (
                      <p className="text-xs text-slate-400 mt-0.5">📍 {ev.location}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${isPast ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatDateTime(ev.timestamp)}
                    </p>
                    {ev.source !== 'MANUAL' && ev.source !== 'SEED' && (
                      <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">
                        {ev.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
