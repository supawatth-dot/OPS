'use client'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Download, Copy, QrCode } from 'lucide-react'

interface Props {
  shipmentId: string
  blAwbNo: string
  poNumbers?: string[]
}

export default function BarcodeDisplay({ shipmentId, blAwbNo, poNumbers = [] }: Props) {
  const [copied, setCopied] = useState(false)
  const data = JSON.stringify({ id: shipmentId, bl: blAwbNo, pos: poNumbers, ts: Date.now() })

  const copy = () => {
    navigator.clipboard.writeText(blAwbNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <QRCodeSVG value={data} size={160} level="H" includeMargin fgColor="#0f172a" />
      </div>
      <div className="text-center">
        <p className="font-mono font-bold text-slate-800 text-sm">{blAwbNo}</p>
        {poNumbers.length > 0 && (
          <p className="text-xs text-slate-400 mt-1">{poNumbers.join(' · ')}</p>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <button onClick={copy} className="btn-secondary flex-1 justify-center text-xs">
          <Copy size={13} />
          {copied ? 'Copied!' : 'Copy BL/AWB'}
        </button>
        <button
          onClick={() => {
            const svg = document.querySelector('svg')
            if (!svg) return
            const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `${blAwbNo}-qr.svg`; a.click()
          }}
          className="btn-secondary flex-1 justify-center text-xs"
        >
          <Download size={13} />
          Save QR
        </button>
      </div>

      {/* Manual scan input */}
      <div className="w-full border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
          <QrCode size={12} /> Scanner Input
        </p>
        <input
          className="input text-center font-mono text-sm"
          placeholder="Scan or enter barcode..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) alert(`Scanned: ${val}`)
            }
          }}
        />
        <p className="text-xs text-slate-400 mt-1 text-center">Press Enter to process scan</p>
      </div>
    </div>
  )
}
