'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BellRing,
  Boxes,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  FileText,
  Flag,
  Gauge,
  LockKeyhole,
  MonitorPlay,
  Network,
  Radio,
  Search,
  ShieldCheck,
  Smartphone,
  Warehouse,
  X,
} from 'lucide-react'
import {
  auditEvents,
  cctvEvents,
  kpiCards,
  reconciliationRows,
  warehouseZones,
  workflowSteps,
  type ReconciliationRow,
  type ReconciliationStatus,
} from '@/lib/reconciliation-data'

const statusStyles: Record<ReconciliationStatus, string> = {
  Balanced: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  Investigate: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  Critical: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20',
}

const toneStyles: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500 text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300',
  green: 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
  yellow: 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
  red: 'from-red-500 to-rose-500 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300',
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

function MiniSparkline({ values, tone }: { values: number[]; tone: string }) {
  const points = values.map((value, index) => {
    const x = index * (100 / (values.length - 1))
    const y = 32 - (value / Math.max(...values)) * 28
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={toneStyles[tone]} />
      <linearGradient id={`spark-${tone}`} x1="0" x2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
    </svg>
  )
}

function KpiHeader() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      {kpiCards.map((card) => (
        <button key={card.label} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${toneStyles[card.tone]}`}>{card.trend}</span>
            <Radio size={15} className="text-emerald-500 animate-pulse" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{card.label}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{card.value}</span>
            <MiniSparkline values={card.spark} tone={card.tone} />
          </div>
        </button>
      ))}
    </section>
  )
}

function ReconciliationTable({ onOpenCctv }: { onOpenCctv: (row: ReconciliationRow) => void }) {
  const [query, setQuery] = useState('')
  const filteredRows = useMemo(() => reconciliationRows.filter((row) => `${row.partId} ${row.partName} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="text-blue-600 dark:text-blue-300" size={20} />
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Real-Time Reconciliation Engine</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Variance = Total Imported − (Consumed + Physical Stock). Auto-refresh cadence: 5 seconds.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search part, status, evidence..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20" />
          </label>
          <button className="btn-secondary dark:border-white/10 dark:bg-white/5 dark:text-white"><Download size={15} /> Excel/PDF Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              {['Part ID', 'Part Name', 'Imported Qty', 'Consumed Qty', 'Physical Stock', 'Variance', 'Status', 'Last Activity', 'PDF Evidence', 'CCTV Evidence', 'Audit Action'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left font-bold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {filteredRows.map((row) => (
              <tr key={row.partId} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="px-4 py-4 font-bold text-slate-950 dark:text-white">{row.partId}</td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{row.partName}</td>
                <td className="px-4 py-4 tabular-nums">{formatNumber(row.importedQty)}</td>
                <td className="px-4 py-4 tabular-nums">{formatNumber(row.consumedQty)}</td>
                <td className="px-4 py-4 tabular-nums">{formatNumber(row.physicalStock)}</td>
                <td className={`px-4 py-4 font-black tabular-nums ${row.variance === 0 ? 'text-emerald-600' : row.status === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>{row.variance > 0 ? '+' : ''}{formatNumber(row.variance)}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.status]}`}>{row.status}</span></td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{row.lastActivity}</td>
                <td className="px-4 py-4"><button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><FileText size={14} /> View PDF</button></td>
                <td className="px-4 py-4"><button onClick={() => onOpenCctv(row)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-950"><Camera size={14} /> {row.cameraId}</button></td>
                <td className="px-4 py-4"><button className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300"><Flag size={14} /> Flag for Audit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AuditTimeline() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-950 dark:text-white">Live Audit Timeline</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Immutable append-only event stream</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Activity size={12} /> Live</span>
      </div>
      <div className="space-y-4">
        {auditEvents.map((event) => (
          <div key={`${event.time}-${event.title}`} className="relative pl-6">
            <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ${event.severity === 'critical' ? 'bg-red-500 ring-red-100 dark:ring-red-500/20' : event.severity === 'warning' ? 'bg-amber-500 ring-amber-100 dark:ring-amber-500/20' : event.severity === 'success' ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-500/20' : 'bg-blue-500 ring-blue-100 dark:ring-blue-500/20'}`} />
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">{event.type}</span>
                <span className="text-xs tabular-nums text-slate-400">{event.time}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{event.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function HeatmapAndWorkflow() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><Warehouse size={18} className="text-blue-600 dark:text-blue-300" /> Warehouse Visual Heatmap</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rack utilization, bonded stock density, and variance hotspots.</p>
          </div>
          <button className="btn-secondary dark:border-white/10 dark:bg-white/5 dark:text-white"><Eye size={14} /> Drill Down</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {warehouseZones.map((zone) => (
            <button key={zone.zone} className={`group min-h-28 rounded-2xl p-4 text-left text-white shadow-sm transition hover:scale-[1.02] ${zone.risk === 'critical' ? 'bg-gradient-to-br from-red-500 to-red-700' : zone.risk === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-teal-700'}`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">{zone.zone}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{zone.utilization}%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${zone.utilization}%` }} />
              </div>
              <p className="mt-3 text-xs font-semibold text-white/85">{formatNumber(zone.parts)} bonded units</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><Network size={18} className="text-blue-600 dark:text-blue-300" /> Customs Workflow Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">End-to-end traceability from import declaration to export clearance.</p>
        </div>
        <div className="space-y-3">
          {workflowSteps.map((step, index) => (
            <div key={step.step} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{step.step}</p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{step.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.user} · {step.time} · evidence linked</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-blue-600" style={{ width: `${step.progress}%` }} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ArchitecturePanels() {
  const dbTables = ['Import_Logs', 'Production_Consumption_Logs', 'Stock_Inventory', 'BOM_Mapping', 'Audit_Trail', 'CCTV_Events']
  const apis = ['GET /dashboard/reconciliation-summary', 'GET /inventory/live-stock', 'GET /variance/alerts', 'GET /audit-trail/recent', 'GET /workflow/status', 'GET /documents/pdf/:id', 'GET /cctv/event/:id', 'POST /audit/flag']

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
        <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><Database size={18} className="text-blue-600" /> Database ER Diagram</h2>
        <div className="mt-5 space-y-2">
          {dbTables.map((table, index) => (
            <div key={table} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold dark:border-white/10 dark:bg-slate-950/60">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> {table} {index < dbTables.length - 1 && <ChevronRight size={14} className="ml-auto text-slate-400" />}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
        <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><LockKeyhole size={18} className="text-blue-600" /> API Architecture</h2>
        <div className="mt-5 space-y-2">
          {apis.map((api) => <div key={api} className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-300 dark:bg-black">{api}</div>)}
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
        <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><MonitorPlay size={18} className="text-blue-600" /> CCTV Integration Screen</h2>
        <div className="mt-5 space-y-3">
          {cctvEvents.map((event) => (
            <div key={event.transaction} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex gap-3">
                <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-bold text-white">{event.thumbnail}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{event.event}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{event.camera} · {event.time} · marker {event.marker}</p>
                  <p className="mt-1 truncate text-xs font-mono text-blue-600 dark:text-blue-300">{event.transaction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function InvestigationModal({ row, onClose }: { row: ReconciliationRow | null; onClose: () => void }) {
  if (!row) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Audit Investigation · {row.partId}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">CCTV marker, transaction evidence, PDF declaration, and variance calculation in one review surface.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X size={20} /></button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-950 text-white">
              <div className="text-center">
                <Camera className="mx-auto mb-3 text-blue-300" size={42} />
                <p className="text-lg font-bold">{row.cameraId} · timeline marker 00:14:08</p>
                <p className="text-sm text-slate-400">Video modal jumps directly to related transaction {row.cctvEventId}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 lg:col-span-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60"><p className="text-xs uppercase text-slate-500">Variance</p><p className="text-2xl font-black text-red-600">{row.variance > 0 ? '+' : ''}{formatNumber(row.variance)} units</p></div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60"><p className="text-xs uppercase text-slate-500">SHA256 Audit Hash</p><p className="break-all font-mono text-xs text-slate-700 dark:text-slate-300">9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</p></div>
            <button className="btn-danger w-full justify-center"><Flag size={16} /> Generate Investigation Case</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedCctv, setSelectedCctv] = useState<ReconciliationRow | null>(null)
  const criticalCount = reconciliationRows.filter((row) => row.status === 'Critical').length

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="-m-6 min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-200 sm:p-6">
        <div className="mx-auto max-w-[1800px] space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><ShieldCheck size={14} /> Government-ready compliance control tower</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Radio size={14} /> WebSocket live</span>
                </div>
                <h1 className="max-w-5xl text-4xl font-black tracking-tight text-slate-950 dark:text-white lg:text-6xl">Real-Time Reconciliation & Customs Compliance Platform</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Modernized from the legacy CIMS bonded workflow into an enterprise audit dashboard for imported materials, production consumption, bonded warehouse stock, export clearance, and CCTV-backed transaction evidence.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn-primary"><BellRing size={16} /> Push Critical Alert</button>
                  <button onClick={() => setDarkMode((value) => !value)} className="btn-secondary dark:border-white/10 dark:bg-white/5 dark:text-white">Toggle {darkMode ? 'Light' : 'Dark'} Mode</button>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between"><p className="font-bold">Executive Summary</p><span className="text-xs text-emerald-300">Updated 10:45:00 UTC</span></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4"><AlertTriangle className="mb-4 text-red-300" /><p className="text-3xl font-black">{criticalCount}</p><p className="text-xs text-slate-300">Critical variances</p></div>
                  <div className="rounded-2xl bg-white/10 p-4"><CheckCircle2 className="mb-4 text-emerald-300" /><p className="text-3xl font-black">99.94%</p><p className="text-xs text-slate-300">Audit match rate</p></div>
                  <div className="rounded-2xl bg-white/10 p-4"><Boxes className="mb-4 text-blue-300" /><p className="text-3xl font-black">$8.45M</p><p className="text-xs text-slate-300">Bonded stock value</p></div>
                  <div className="rounded-2xl bg-white/10 p-4"><ClipboardCheck className="mb-4 text-amber-300" /><p className="text-3xl font-black">12</p><p className="text-xs text-slate-300">Pending clearances</p></div>
                </div>
              </div>
            </div>
          </section>

          <KpiHeader />

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_380px]">
            <ReconciliationTable onOpenCctv={setSelectedCctv} />
            <AuditTimeline />
          </div>

          <HeatmapAndWorkflow />
          <ArchitecturePanels />

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
              <h2 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><BellRing size={18} className="text-red-500" /> Alert & Notification System</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {['Auto alert generation when variance exceeds tolerance', 'Sound alerts and push notifications for critical records', 'RBAC routing to Customs Officer, Auditor, Warehouse Staff, and Admin'].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">{item}</div>)}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
              <div className="mx-auto max-w-[280px] rounded-[2rem] border-8 border-slate-900 bg-slate-950 p-3 text-white shadow-2xl">
                <div className="mb-3 flex items-center justify-between text-xs"><span>10:45</span><Smartphone size={14} /><span>5G</span></div>
                <p className="text-lg font-black">Mobile Audit Scanner</p>
                <p className="text-xs text-slate-400">Tablet/mobile responsive warehouse mode</p>
                <div className="mt-4 space-y-2">
                  {['Scan dock label', 'Open variance case', 'Attach CCTV snapshot'].map((item) => <button key={item} className="w-full rounded-2xl bg-white/10 p-3 text-left text-sm font-semibold">{item}</button>)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <InvestigationModal row={selectedCctv} onClose={() => setSelectedCctv(null)} />
    </div>
  )
}
