'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Ship, Plane, Package, Clock, MapPin, DollarSign,
  FileText, AlertTriangle, CheckCircle2, Plus, Edit2, Save, X
} from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import ShipmentTimeline from '@/components/shipments/ShipmentTimeline'
import BarcodeDisplay from '@/components/receiving/BarcodeDisplay'
import { formatDate, formatDateTime, formatCurrency, formatWeight, getDaysUntil, STATUS_CONFIG } from '@/lib/utils'
import { useState } from 'react'

const STATUSES = ['PENDING','IN_TRANSIT','AT_PORT','CUSTOMS','DELIVERING','RECEIVED','DELAYED','CANCELLED']

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [editStatus, setEditStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)
  const [eventForm, setEventForm] = useState({ eventType: 'OTHER', description: '', location: '' })

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const res = await fetch(`/api/shipments/${id}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
  })

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, addEvent: { eventType: status, description: `Status updated to ${STATUS_CONFIG[status]?.label || status}`, location: '' } }),
      })
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); setEditStatus(false) },
  })

  const addEvent = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addEvent: eventForm }),
      })
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); setAddingEvent(false); setEventForm({ eventType: 'OTHER', description: '', location: '' }) },
  })

  const markAlertRead = useMutation({
    mutationFn: async (alertId: string) => {
      await fetch('/api/alerts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [alertId], isRead: true }) })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment', id] }),
  })

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="h-8 bg-slate-200 animate-pulse rounded w-64" />
        <div className="grid grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-xl" />)}</div>
      </div>
    )
  }
  if (!shipment) return <div className="text-center py-20 text-slate-400">Shipment not found</div>

  const days = getDaysUntil(shipment.finalEta)
  const overdue = days !== null && days < 0
  const unreadAlerts = shipment.alerts.filter((a: { isRead: boolean }) => !a.isRead)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{shipment.blAwbNo}</h1>
              <span className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full ${shipment.isAir ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                {shipment.isAir ? <Plane size={13} /> : <Ship size={13} />}
                {shipment.isAir ? 'Air Freight' : 'Sea Freight'}
              </span>
              {editStatus ? (
                <div className="flex items-center gap-2">
                  <select value={newStatus || shipment.status} onChange={e => setNewStatus(e.target.value)} className="select py-1 text-sm w-36">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                  <button onClick={() => updateStatus.mutate(newStatus || shipment.status)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Save size={14} /></button>
                  <button onClick={() => setEditStatus(false)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusBadge status={shipment.status} />
                  <button onClick={() => { setEditStatus(true); setNewStatus(shipment.status) }} className="p-1 text-slate-400 hover:text-slate-600 rounded"><Edit2 size={12} /></button>
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{shipment.origin} → {shipment.destination} · {shipment.carrier} · {shipment.vessel}</p>
          </div>
        </div>
        <div className="text-right">
          {shipment.finalEta && (
            <div className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
              {overdue ? `⚠️ ${Math.abs(days!)}d overdue` : `Final ETA in ${days}d`}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-0.5">Last updated: {formatDateTime(shipment.updatedAt)}</p>
        </div>
      </div>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={15} /> {unreadAlerts.length} Active Alert{unreadAlerts.length > 1 ? 's' : ''}</p>
          {unreadAlerts.map((a: { id: string; message: string; severity: string }) => (
            <div key={a.id} className="flex items-center gap-2">
              <p className="text-sm text-red-600 flex-1">{a.message}</p>
              <button onClick={() => markAlertRead.mutate(a.id)} className="text-xs text-red-400 hover:text-red-600">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Shipment Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Package size={16} className="text-blue-600" /> Shipment Details</h2>
            </div>
            <div className="card-body grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: MapPin, label: 'Origin', value: shipment.origin },
                { icon: MapPin, label: 'Destination', value: shipment.destination },
                { icon: Ship, label: 'Carrier', value: shipment.carrier },
                { icon: Ship, label: 'Vessel / Flight', value: shipment.vessel },
                { icon: FileText, label: 'Incoterm', value: shipment.incoterm },
                { icon: FileText, label: 'Customs Ref', value: shipment.customsRef },
                { icon: Clock, label: 'Departure Date', value: formatDate(shipment.dateDepSender) },
                { icon: Clock, label: 'ETA Port', value: formatDate(shipment.etaPort) },
                { icon: Clock, label: 'Final ETA', value: formatDate(shipment.finalEta) },
                { icon: Package, label: '20ft Containers', value: shipment.container20ft || '—' },
                { icon: Package, label: '40ft Containers', value: shipment.container40ft || '—' },
                { icon: Package, label: 'Weight', value: formatWeight(shipment.weight) },
                { icon: Package, label: 'Volume', value: shipment.volume ? `${shipment.volume} m³` : '—' },
                { icon: DollarSign, label: 'Freight Cost', value: formatCurrency(shipment.freightCost, shipment.currency) },
                { icon: FileText, label: 'Remarks', value: shipment.remarks || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1"><Icon size={11} />{label}</p>
                  <p className="text-sm text-slate-800 font-medium">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Orders */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FileText size={16} className="text-green-600" /> Purchase Orders</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{shipment.purchaseOrders.length} POs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="table-th">PO Number</th>
                    <th className="table-th">Supplier</th>
                    <th className="table-th">Buyer</th>
                    <th className="table-th">Quantity</th>
                    <th className="table-th">Value</th>
                    <th className="table-th">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.purchaseOrders.map((po: { id: string; poNumber: string; supplier: string; buyer: string; quantity: number; value: number; description: string }) => (
                    <tr key={po.id} className="table-row">
                      <td className="table-td font-mono text-blue-700 font-semibold">{po.poNumber}</td>
                      <td className="table-td text-xs">{po.supplier || '—'}</td>
                      <td className="table-td text-xs">{po.buyer || '—'}</td>
                      <td className="table-td text-xs">{po.quantity?.toLocaleString() || '—'}</td>
                      <td className="table-td text-xs">{formatCurrency(po.value)}</td>
                      <td className="table-td text-xs text-slate-500">{po.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receiving Records */}
          {shipment.receivings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Receiving Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="table-th">Received At</th>
                      <th className="table-th">Received By</th>
                      <th className="table-th">Qty</th>
                      <th className="table-th">Condition</th>
                      <th className="table-th">Location</th>
                      <th className="table-th">Barcode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.receivings.map((r: { id: string; receivedAt: string; receivedBy: string; quantity: number; condition: string; location: string; barcodeData: string }) => (
                      <tr key={r.id} className="table-row">
                        <td className="table-td text-xs">{formatDateTime(r.receivedAt)}</td>
                        <td className="table-td text-xs">{r.receivedBy}</td>
                        <td className="table-td text-xs font-semibold">{r.quantity}</td>
                        <td className="table-td">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.condition === 'GOOD' ? 'bg-green-100 text-green-700' : r.condition === 'DAMAGED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.condition}
                          </span>
                        </td>
                        <td className="table-td text-xs">{r.location || '—'}</td>
                        <td className="table-td font-mono text-xs text-slate-400">{r.barcodeData || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800">Shipment Timeline</h2>
              <button onClick={() => setAddingEvent(true)} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700">
                <Plus size={13} /> Add Event
              </button>
            </div>
            <div className="card-body">
              {addingEvent && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-2 border border-blue-200">
                  <select className="select text-sm" value={eventForm.eventType} onChange={e => setEventForm(f => ({ ...f, eventType: e.target.value }))}>
                    {['BOOKING','PICKUP','DEPARTURE','TRANSIT','ARRIVAL','CUSTOMS','CUSTOMS_CLEARED','OUT_FOR_DELIVERY','DELIVERED','DELAY','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input className="input text-sm" placeholder="Description" value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
                  <input className="input text-sm" placeholder="Location (optional)" value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => addEvent.mutate()} disabled={!eventForm.description} className="btn-primary flex-1 text-xs py-1.5 disabled:opacity-50">Save</button>
                    <button onClick={() => setAddingEvent(false)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                  </div>
                </div>
              )}
              <ShipmentTimeline events={shipment.events} />
            </div>
          </div>

          {/* QR Code */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800">QR / Barcode</h2>
            </div>
            <div className="card-body">
              <BarcodeDisplay
                shipmentId={shipment.id}
                blAwbNo={shipment.blAwbNo}
                poNumbers={shipment.purchaseOrders.map((p: { poNumber: string }) => p.poNumber)}
              />
            </div>
          </div>

          {/* SAP Integration */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800 text-sm">SAP Integration</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-green-600">Ready</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-xs text-slate-500 mb-3">Push this shipment to SAP as an iDoc SHPMNT01:</p>
              <a
                href={`/api/sap?blAwbNo=${shipment.blAwbNo}`}
                target="_blank"
                className="btn-secondary w-full justify-center text-xs"
              >
                <FileText size={13} /> View SAP Payload
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
