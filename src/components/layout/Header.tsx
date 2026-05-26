'use client'
import { Bell, Search, RefreshCw, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-count'],
    queryFn: async () => {
      const res = await fetch('/api/alerts?unread=true')
      return res.json()
    },
    refetchInterval: 30_000,
  })

  const unreadCount = alertsData?.total ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/shipments?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            placeholder="Search by BL/AWB number, PO, vessel..."
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={() => router.push('/alerts')}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={15} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">Admin</p>
            <p className="text-xs text-slate-400">Logistics Manager</p>
          </div>
        </div>
      </div>
    </header>
  )
}
