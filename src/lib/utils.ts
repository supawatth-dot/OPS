import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:    { label: 'Pending',     color: 'text-slate-600',  bg: 'bg-slate-100',  dot: 'bg-slate-400' },
  IN_TRANSIT: { label: 'In Transit',  color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  AT_PORT:    { label: 'At Port',     color: 'text-cyan-700',   bg: 'bg-cyan-100',   dot: 'bg-cyan-500' },
  CUSTOMS:    { label: 'Customs',     color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  DELIVERING: { label: 'Delivering',  color: 'text-purple-700', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  RECEIVED:   { label: 'Received',    color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  DELAYED:    { label: 'Delayed',     color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
  CANCELLED:  { label: 'Cancelled',   color: 'text-gray-600',   bg: 'bg-gray-100',   dot: 'bg-gray-400' },
}

export const EVENT_CONFIG: Record<string, { label: string; icon: string }> = {
  BOOKING:          { label: 'Booking Confirmed',     icon: '📋' },
  PICKUP:           { label: 'Cargo Picked Up',       icon: '📦' },
  DEPARTURE:        { label: 'Departed',              icon: '🚢' },
  TRANSIT:          { label: 'In Transit',            icon: '🌊' },
  ARRIVAL:          { label: 'Arrived at Port',       icon: '⚓' },
  CUSTOMS:          { label: 'Customs Submitted',     icon: '📜' },
  CUSTOMS_CLEARED:  { label: 'Customs Cleared',       icon: '✅' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',      icon: '🚛' },
  DELIVERED:        { label: 'Delivered',             icon: '🏭' },
  DELAY:            { label: 'Delay Alert',           icon: '⚠️' },
  OTHER:            { label: 'Update',                icon: '📌' },
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function getDaysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} MT` : `${kg} kg`
}

export const SEVERITY_CONFIG = {
  LOW:      { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  MEDIUM:   { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  HIGH:     { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  CRITICAL: { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}
