'use client'
import { Settings, Database, Zap, Bell, Shield, Code2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm">Configuration and integration management</p>
      </div>

      {[
        {
          icon: Database, title: 'Database', color: 'text-blue-600', bg: 'bg-blue-50',
          items: [
            { label: 'Database', value: 'SQLite (Prisma ORM)', status: 'connected' },
            { label: 'Auto Backup', value: 'Daily at 02:00', status: 'active' },
            { label: 'Records', value: '20 shipments · 36 POs · 6 alerts', status: 'info' },
          ]
        },
        {
          icon: Zap, title: 'SAP Integration', color: 'text-orange-600', bg: 'bg-orange-50',
          items: [
            { label: 'SAP Endpoint', value: '/api/sap', status: 'active' },
            { label: 'iDoc Format', value: 'SHPMNT01 / MSEGO', status: 'info' },
            { label: 'GR Webhook', value: 'POST /api/sap — receive confirmations', status: 'info' },
          ]
        },
        {
          icon: Bell, title: 'Alert Configuration', color: 'text-red-600', bg: 'bg-red-50',
          items: [
            { label: 'Delay Detection', value: 'Auto-alerts on DELAYED status', status: 'active' },
            { label: 'Customs Hold', value: 'Alert on CUSTOMS status > 2 days', status: 'active' },
            { label: 'ETA Reminders', value: '3 days before Final ETA', status: 'active' },
          ]
        },
        {
          icon: Code2, title: 'API Endpoints', color: 'text-purple-600', bg: 'bg-purple-50',
          items: [
            { label: 'Shipments API', value: 'GET/POST /api/shipments', status: 'active' },
            { label: 'Import Excel', value: 'POST /api/shipments/import', status: 'active' },
            { label: 'Analytics', value: 'GET /api/analytics', status: 'active' },
            { label: 'Receiving', value: 'GET/POST /api/receiving', status: 'active' },
          ]
        },
        {
          icon: Shield, title: 'System Info', color: 'text-slate-600', bg: 'bg-slate-50',
          items: [
            { label: 'Version', value: 'OPS Logistics TMS v2.0', status: 'info' },
            { label: 'Framework', value: 'Next.js 14 · TypeScript · Prisma', status: 'info' },
            { label: 'Excel Columns', value: 'BL_AWB_No · IsAir · Container20ft · Container40ft · DateDepSender · ETAPort · FinalETA · Status · PONumbers · Remarks', status: 'info' },
          ]
        },
      ].map(({ icon: Icon, title, color, bg, items }) => (
        <div key={title} className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}><Icon size={15} className={color} /></div>
              {title}
            </h2>
          </div>
          <div className="card-body divide-y divide-slate-100">
            {items.map(({ label, value, status }) => (
              <div key={label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className="text-sm text-slate-600">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 font-medium text-right max-w-[400px]">{value}</span>
                  {status === 'connected' && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>}
                  {status === 'active' && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Active</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
