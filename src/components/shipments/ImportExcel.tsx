'use client'
import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'

interface Result { created: number; updated: number; errors: number; total: number; errList: string[] }

export default function ImportExcel({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const ref = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: false })
      setPreview(rows.slice(0, 5))
    }
    reader.readAsArrayBuffer(f)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/shipments/import', { method: 'POST', body: fd })
      const data = await res.json()
      setResult(data)
      qc.invalidateQueries({ queryKey: ['shipments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      BL_AWB_No: 'BL-EXAMPLE-001', IsAir: 'false', Container20ft: '2', Container40ft: '1',
      DateDepSender: '2024-01-15', ETAPort: '2024-02-01', FinalETA: '2024-02-05',
      Status: 'IN_TRANSIT', PONumbers: 'PO-001,PO-002', Remarks: 'Sample shipment',
    }])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Shipments')
    XLSX.writeFile(wb, 'shipment_import_template.xlsx')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Import from Excel</h2>
              <p className="text-sm text-slate-500">Upload .xlsx or .xls file</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {!result ? (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
                onClick={() => ref.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              >
                <input ref={ref} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                {file ? (
                  <div>
                    <p className="font-semibold text-blue-700">{file.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB — {preview.length} rows previewed</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-700">Drop Excel file here or click to browse</p>
                    <p className="text-sm text-slate-400 mt-1">Supports .xlsx, .xls, .csv</p>
                  </div>
                )}
              </div>

              {preview.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Preview (first 5 rows)</p>
                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>{Object.keys(preview[0]).slice(0, 6).map(k => <th key={k} className="px-3 py-2 text-left font-medium text-slate-600">{k}</th>)}</tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {Object.values(row).slice(0, 6).map((v, j) => (
                            <td key={j} className="px-3 py-2 text-slate-700">{String(v).slice(0, 20)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={downloadTemplate} className="btn-secondary flex-1">Download Template</button>
                <button onClick={handleImport} disabled={!file || loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Importing...' : 'Import Now'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${result.errors === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {result.errors === 0
                  ? <CheckCircle size={24} className="text-green-600" />
                  : <AlertCircle size={24} className="text-yellow-600" />}
                <div>
                  <p className="font-semibold text-slate-800">Import Complete</p>
                  <p className="text-sm text-slate-600">
                    {result.created} created · {result.updated} updated · {result.errors} errors (of {result.total} total)
                  </p>
                </div>
              </div>
              {result.errList?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700 space-y-1">
                  {result.errList.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
              <button onClick={onClose} className="btn-primary w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
