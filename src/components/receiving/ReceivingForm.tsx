'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle2, Package } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'

interface Shipment {
  id: string; blAwbNo: string; status: string; isAir: boolean;
  origin: string | null; destination: string | null; finalEta: string | null;
  purchaseOrders: { id: string; poNumber: string }[]
}

export default function ReceivingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [form, setForm] = useState({ receivedBy: '', quantity: '', condition: 'GOOD', notes: '', location: '', poNumber: '' })
  const [done, setDone] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['shipments-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { shipments: [] }
      const res = await fetch(`/api/shipments?q=${encodeURIComponent(searchTerm)}&limit=10`)
      return res.json()
    },
    enabled: searchTerm.length > 1,
  })

  const receive = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId: selected!.id, ...form }),
      })
      return res.json()
    },
    onSuccess: () => {
      setDone(true)
      qc.invalidateQueries({ queryKey: ['receiving'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      onSuccess?.()
    },
  })

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Receiving Complete!</h3>
        <p className="text-slate-500 mt-1">{selected?.blAwbNo} has been received and marked in the system</p>
        <button
          className="btn-primary mt-4"
          onClick={() => { setDone(false); setSelected(null); setSearchTerm(''); setForm({ receivedBy: '', quantity: '', condition: 'GOOD', notes: '', location: '', poNumber: '' }) }}
        >
          Receive Another
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {!selected ? (
        <div>
          <label className="label">Search Shipment (BL/AWB number, PO, vessel)</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-9"
              placeholder="Type BL/AWB number or PO..."
            />
          </div>

          {isLoading && <p className="text-sm text-slate-400 mt-2">Searching...</p>}

          {data?.shipments?.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
              {data.shipments.map((s: Shipment) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 text-left transition-colors"
                >
                  <Package size={16} className="text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-sm text-blue-700">{s.blAwbNo}</p>
                    <p className="text-xs text-slate-500">{s.origin} → {s.destination}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </button>
              ))}
            </div>
          )}

          {data?.shipments?.length === 0 && searchTerm.length > 1 && (
            <p className="text-sm text-slate-400 mt-2 text-center py-4">No shipments found for "{searchTerm}"</p>
          )}
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-blue-800 text-lg">{selected.blAwbNo}</p>
                <p className="text-sm text-blue-600">{selected.origin} → {selected.destination}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="text-xs text-blue-500 hover:text-blue-700">Change</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Received By *</label>
              <input className="input" placeholder="Staff name" value={form.receivedBy} onChange={e => setForm(f => ({ ...f, receivedBy: e.target.value }))} />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input type="number" className="input" placeholder="Units received" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                <option value="GOOD">Good</option>
                <option value="DAMAGED">Damaged</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
            <div>
              <label className="label">Warehouse Location</label>
              <input className="input" placeholder="e.g. Warehouse A, Bay 5" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="label">Link PO Number</label>
              <select className="select" value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))}>
                <option value="">All POs</option>
                {selected.purchaseOrders.map(p => <option key={p.id} value={p.poNumber}>{p.poNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Optional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <button
            onClick={() => receive.mutate()}
            disabled={!form.receivedBy || !form.quantity || receive.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {receive.isPending ? 'Processing...' : 'Confirm Receipt'}
          </button>
        </>
      )}
    </div>
  )
}
