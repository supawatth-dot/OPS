'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { WarehouseIcon, Package, CheckCircle2, Clock, QrCode } from 'lucide-react'
import ReceivingForm from '@/components/receiving/ReceivingForm'
import { formatDateTime } from '@/lib/utils'

export default function ReceivingPage() {
  const [tab, setTab] = useState<'receive' | 'history'>('receive')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['receiving'],
    queryFn: async () => {
      const res = await fetch('/api/receiving')
      return res.json()
    },
  })

  const records = data?.records || []

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Receiving</h1>
          <p className="text-slate-500 text-sm">Process incoming shipments and update inventory</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          <CheckCircle2 size={14} className="text-green-500" />
          <span><strong>{records.length}</strong> records today</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Package,      label: 'Total Received',    value: data?.total || 0,     color: 'bg-blue-600' },
          { icon: CheckCircle2, label: 'Good Condition',    value: records.filter((r: { condition: string }) => r.condition === 'GOOD').length, color: 'bg-green-600' },
          { icon: Clock,        label: 'Pending Receiving', value: 3, color: 'bg-orange-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-5 text-white`}>
            <Icon size={20} className="opacity-70 mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'receive',  label: 'Receive Shipment', icon: QrCode },
          { key: 'history',  label: 'Receiving History', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'receive' | 'history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'receive' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <WarehouseIcon size={16} className="text-blue-600" /> Receiving Form
              </h2>
            </div>
            <div className="card-body">
              <ReceivingForm onSuccess={refetch} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-800">Receiving Guidelines</h2>
            </div>
            <div className="card-body space-y-4">
              {[
                { step: '1', title: 'Verify Documents', desc: 'Check BL/AWB number matches physical documents. Verify PO numbers.' },
                { step: '2', title: 'Inspect Cargo', desc: 'Inspect all packages for damage. Count units and verify against manifest.' },
                { step: '3', title: 'Scan Barcode', desc: 'Use the barcode scanner to log receiving. Enter quantity and condition.' },
                { step: '4', title: 'Store & Update', desc: 'Place goods in designated location. System auto-updates status to RECEIVED.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{title}</p>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800">Receiving History</h2>
            <span className="text-xs text-slate-400">{data?.total || 0} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">BL / AWB No.</th>
                  <th className="table-th">Received At</th>
                  <th className="table-th">Received By</th>
                  <th className="table-th">Quantity</th>
                  <th className="table-th">Condition</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">PO</th>
                  <th className="table-th">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => <td key={j} className="table-td"><div className="h-4 bg-slate-100 animate-pulse rounded" /></td>)}
                  </tr>
                ))}
                {records.length === 0 && !isLoading && (
                  <tr><td colSpan={8} className="table-td text-center py-10 text-slate-400">No receiving records yet</td></tr>
                )}
                {records.map((r: { id: string; shipment: { blAwbNo: string }; receivedAt: string; receivedBy: string; quantity: number; condition: string; location: string; poNumber: string; barcodeData: string }) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-td font-mono text-sm text-blue-700 font-semibold">{r.shipment?.blAwbNo}</td>
                    <td className="table-td text-xs">{formatDateTime(r.receivedAt)}</td>
                    <td className="table-td text-sm">{r.receivedBy}</td>
                    <td className="table-td text-sm font-semibold">{r.quantity?.toLocaleString()}</td>
                    <td className="table-td">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.condition === 'GOOD' ? 'bg-green-100 text-green-700' : r.condition === 'DAMAGED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.condition}
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-500">{r.location || '—'}</td>
                    <td className="table-td text-xs font-mono text-slate-500">{r.poNumber || '—'}</td>
                    <td className="table-td font-mono text-xs text-slate-400">{r.barcodeData || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
