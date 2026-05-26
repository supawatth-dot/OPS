'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Truck, WarehouseIcon, BarChart3,
  Bell, Settings, ChevronRight, Ship, Plane, BoxIcon
} from 'lucide-react'

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/shipments',  icon: Package,         label: 'Shipments' },
  { href: '/receiving',  icon: WarehouseIcon,   label: 'Receiving' },
  { href: '/analytics',  icon: BarChart3,       label: 'Analytics' },
  { href: '/alerts',     icon: Bell,            label: 'Alerts' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-[260px] bg-slate-900 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Ship size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">OPS Logistics</p>
            <p className="text-slate-400 text-xs">Enterprise TMS v2.0</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-white/10">
        {[
          { icon: Ship,  val: '14', label: 'Sea' },
          { icon: Plane, val: '6',  label: 'Air' },
          { icon: BoxIcon, val: '20', label: 'Total' },
        ].map(({ icon: Icon, val, label }) => (
          <div key={label} className="bg-white/5 rounded-lg px-2 py-2 text-center">
            <Icon size={12} className="text-slate-400 mx-auto mb-1" />
            <p className="text-white text-sm font-bold">{val}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
          <Link href="/settings" className="sidebar-link">
            <Settings size={17} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* SAP Badge */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300 text-xs font-medium">SAP Integration Ready</span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">API endpoint active</p>
        </div>
      </div>
    </aside>
  )
}
