import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

function parseDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'number') return new Date(Math.round((val - 25569) * 86400 * 1000))
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? null : d
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false })

  let created = 0
  let updated = 0
  let errors = 0
  const errList: string[] = []

  for (const row of rows) {
    const blAwbNo = String(row['BL_AWB_No'] || row['bl_awb_no'] || row['BL/AWB No'] || '').trim()
    if (!blAwbNo) continue

    const poRaw = String(row['PONumbers'] || row['PO Numbers'] || row['po_numbers'] || '')
    const poNumbers = poRaw.split(/[,;|]/).map(s => s.trim()).filter(Boolean)

    const payload = {
      blAwbNo,
      isAir: String(row['IsAir'] || row['is_air'] || '').toLowerCase() === 'true' || String(row['IsAir'] || '').toLowerCase() === 'yes',
      container20ft: parseInt(String(row['Container20ft'] || row['container_20ft'] || '0')) || 0,
      container40ft: parseInt(String(row['Container40ft'] || row['container_40ft'] || '0')) || 0,
      dateDepSender: parseDate(row['DateDepSender'] || row['date_dep_sender']),
      etaPort: parseDate(row['ETAPort'] || row['eta_port']),
      finalEta: parseDate(row['FinalETA'] || row['final_eta']),
      status: String(row['Status'] || 'PENDING').toUpperCase().replace(/ /g, '_'),
      remarks: String(row['Remarks'] || ''),
    }

    try {
      const existing = await prisma.shipment.findUnique({ where: { blAwbNo } })
      if (existing) {
        await prisma.shipment.update({ where: { blAwbNo }, data: payload })
        updated++
      } else {
        await prisma.shipment.create({
          data: {
            ...payload,
            purchaseOrders: poNumbers.length
              ? { create: poNumbers.map(po => ({ poNumber: po })) }
              : undefined,
            events: {
              create: [{ eventType: 'BOOKING', description: 'Imported from Excel', timestamp: new Date(), source: 'EXCEL' }],
            },
          },
        })
        created++
      }
    } catch (e) {
      errors++
      errList.push(`Row ${blAwbNo}: ${String(e)}`)
    }
  }

  return NextResponse.json({ created, updated, errors, errList, total: rows.length })
}
