import { PrismaClient } from '@prisma/client'
import { addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()
const now = new Date()

const STATUSES = ['PENDING', 'IN_TRANSIT', 'AT_PORT', 'CUSTOMS', 'DELIVERING', 'RECEIVED', 'DELAYED']

const shipmentData = [
  { blAwbNo: 'BL-TH2024-001', isAir: false, container20ft: 2, container40ft: 1, status: 'IN_TRANSIT', origin: 'Shanghai, CN', destination: 'Bangkok, TH', carrier: 'COSCO', vessel: 'COSCO Pacific', incoterm: 'CIF', freightCost: 12500, currency: 'USD', weight: 28000, volume: 65.4, poNumbers: ['PO-2024-001', 'PO-2024-002'], daysAgo: 15, etaOffset: 5, finalOffset: 8, remarks: 'General cargo, handle with care' },
  { blAwbNo: 'AWB-TG2024-042', isAir: true, container20ft: 0, container40ft: 0, status: 'DELIVERED', origin: 'Tokyo, JP', destination: 'Bangkok, TH', carrier: 'Thai Airways Cargo', vessel: 'TG-541', incoterm: 'EXW', freightCost: 4800, currency: 'USD', weight: 1250, volume: 8.2, poNumbers: ['PO-2024-003'], daysAgo: 20, etaOffset: -5, finalOffset: -3, remarks: 'Electronic components' },
  { blAwbNo: 'BL-TH2024-003', isAir: false, container20ft: 0, container40ft: 2, status: 'CUSTOMS', origin: 'Rotterdam, NL', destination: 'Laem Chabang, TH', carrier: 'Maersk', vessel: 'Maersk Sealand', incoterm: 'DDP', freightCost: 18000, currency: 'USD', weight: 42000, volume: 110.8, poNumbers: ['PO-2024-004', 'PO-2024-005', 'PO-2024-006'], daysAgo: 25, etaOffset: -2, finalOffset: 3, remarks: 'Chemical goods - requires special handling' },
  { blAwbNo: 'BL-TH2024-004', isAir: false, container20ft: 1, container40ft: 0, status: 'DELAYED', origin: 'Shenzhen, CN', destination: 'Bangkok, TH', carrier: 'Evergreen', vessel: 'Ever Glory', incoterm: 'FOB', freightCost: 7200, currency: 'USD', weight: 15000, volume: 32.1, poNumbers: ['PO-2024-007', 'PO-2024-008'], daysAgo: 30, etaOffset: 10, finalOffset: 14, remarks: 'Delayed due to port congestion at origin' },
  { blAwbNo: 'AWB-QR2024-015', isAir: true, container20ft: 0, container40ft: 0, status: 'RECEIVED', origin: 'Frankfurt, DE', destination: 'Suvarnabhumi, TH', carrier: 'Lufthansa Cargo', vessel: 'LH-771', incoterm: 'CPT', freightCost: 9600, currency: 'USD', weight: 3200, volume: 18.5, poNumbers: ['PO-2024-009'], daysAgo: 45, etaOffset: -10, finalOffset: -8, remarks: 'Pharmaceutical goods' },
  { blAwbNo: 'BL-TH2024-006', isAir: false, container20ft: 3, container40ft: 2, status: 'IN_TRANSIT', origin: 'Busan, KR', destination: 'Laem Chabang, TH', carrier: 'HMM', vessel: 'HMM Algeciras', incoterm: 'CFR', freightCost: 22000, currency: 'USD', weight: 68000, volume: 180.2, poNumbers: ['PO-2024-010', 'PO-2024-011'], daysAgo: 8, etaOffset: 12, finalOffset: 16, remarks: 'Automotive parts' },
  { blAwbNo: 'BL-TH2024-007', isAir: false, container20ft: 0, container40ft: 1, status: 'AT_PORT', origin: 'Singapore, SG', destination: 'Bangkok, TH', carrier: 'PIL', vessel: 'Pacific Pioneer', incoterm: 'CIF', freightCost: 5500, currency: 'USD', weight: 21000, volume: 55.0, poNumbers: ['PO-2024-012'], daysAgo: 12, etaOffset: -1, finalOffset: 2, remarks: 'At Laem Chabang - awaiting customs release' },
  { blAwbNo: 'AWB-EK2024-088', isAir: true, container20ft: 0, container40ft: 0, status: 'PENDING', origin: 'Dubai, AE', destination: 'Bangkok, TH', carrier: 'Emirates SkyCargo', vessel: 'EK-374', incoterm: 'DAP', freightCost: 6200, currency: 'USD', weight: 890, volume: 5.4, poNumbers: ['PO-2024-013', 'PO-2024-014'], daysAgo: 2, etaOffset: 5, finalOffset: 7, remarks: 'Luxury goods - high value' },
  { blAwbNo: 'BL-TH2024-009', isAir: false, container20ft: 2, container40ft: 0, status: 'DELIVERING', origin: 'Mumbai, IN', destination: 'Laem Chabang, TH', carrier: 'Hapag-Lloyd', vessel: 'Hamburg Express', incoterm: 'FOB', freightCost: 8900, currency: 'USD', weight: 19500, volume: 48.6, poNumbers: ['PO-2024-015'], daysAgo: 18, etaOffset: -3, finalOffset: 0, remarks: 'Textile goods out for delivery' },
  { blAwbNo: 'BL-TH2024-010', isAir: false, container20ft: 0, container40ft: 3, status: 'IN_TRANSIT', origin: 'Los Angeles, US', destination: 'Laem Chabang, TH', carrier: 'ONE', vessel: 'ONE Columba', incoterm: 'CIF', freightCost: 31000, currency: 'USD', weight: 72000, volume: 195.8, poNumbers: ['PO-2024-016', 'PO-2024-017', 'PO-2024-018'], daysAgo: 5, etaOffset: 25, finalOffset: 28, remarks: 'US imports - agricultural machinery' },
  { blAwbNo: 'BL-TH2024-011', isAir: false, container20ft: 1, container40ft: 1, status: 'RECEIVED', origin: 'Taipei, TW', destination: 'Bangkok, TH', carrier: 'Yang Ming', vessel: 'YM Witness', incoterm: 'EXW', freightCost: 10200, currency: 'USD', weight: 33000, volume: 88.4, poNumbers: ['PO-2024-019', 'PO-2024-020'], daysAgo: 60, etaOffset: -15, finalOffset: -12, remarks: 'Completed - stored in warehouse A' },
  { blAwbNo: 'AWB-CX2024-022', isAir: true, container20ft: 0, container40ft: 0, status: 'IN_TRANSIT', origin: 'Hong Kong, HK', destination: 'Bangkok, TH', carrier: 'Cathay Pacific Cargo', vessel: 'CX-702', incoterm: 'CIP', freightCost: 3400, currency: 'USD', weight: 620, volume: 3.8, poNumbers: ['PO-2024-021'], daysAgo: 1, etaOffset: 2, finalOffset: 3, remarks: 'Express shipment - priority handling' },
  { blAwbNo: 'BL-TH2024-013', isAir: false, container20ft: 4, container40ft: 0, status: 'DELAYED', origin: 'Colombo, LK', destination: 'Bangkok, TH', carrier: 'MSC', vessel: 'MSC Isabella', incoterm: 'CFR', freightCost: 14800, currency: 'USD', weight: 52000, volume: 125.0, poNumbers: ['PO-2024-022', 'PO-2024-023'], daysAgo: 35, etaOffset: 8, finalOffset: 12, remarks: 'Delayed - vessel rerouted due to bad weather' },
  { blAwbNo: 'BL-TH2024-014', isAir: false, container20ft: 0, container40ft: 2, status: 'AT_PORT', origin: 'Kaohsiung, TW', destination: 'Laem Chabang, TH', carrier: 'Evergreen', vessel: 'Ever Ace', incoterm: 'DDP', freightCost: 17500, currency: 'USD', weight: 47000, volume: 115.3, poNumbers: ['PO-2024-024'], daysAgo: 22, etaOffset: -1, finalOffset: 4, remarks: 'Documentation pending' },
  { blAwbNo: 'AWB-SQ2024-055', isAir: true, container20ft: 0, container40ft: 0, status: 'RECEIVED', origin: 'Singapore, SG', destination: 'Bangkok, TH', carrier: 'Singapore Airlines Cargo', vessel: 'SQ-972', incoterm: 'DAP', freightCost: 2800, currency: 'USD', weight: 450, volume: 2.6, poNumbers: ['PO-2024-025', 'PO-2024-026'], daysAgo: 55, etaOffset: -18, finalOffset: -16, remarks: 'Semiconductors - completed' },
  { blAwbNo: 'BL-TH2024-016', isAir: false, container20ft: 2, container40ft: 2, status: 'CUSTOMS', origin: 'Hamburg, DE', destination: 'Laem Chabang, TH', carrier: 'Hapag-Lloyd', vessel: 'Colombo Express', incoterm: 'CIF', freightCost: 25000, currency: 'USD', weight: 61000, volume: 155.7, poNumbers: ['PO-2024-027', 'PO-2024-028', 'PO-2024-029'], daysAgo: 28, etaOffset: -3, finalOffset: 5, remarks: 'Customs inspection ongoing' },
  { blAwbNo: 'BL-TH2024-017', isAir: false, container20ft: 1, container40ft: 0, status: 'PENDING', origin: 'Chittagong, BD', destination: 'Bangkok, TH', carrier: 'CMA CGM', vessel: 'CMA CGM Marco Polo', incoterm: 'FOB', freightCost: 6100, currency: 'USD', weight: 17800, volume: 41.2, poNumbers: ['PO-2024-030'], daysAgo: 1, etaOffset: 18, finalOffset: 22, remarks: 'Garment export - scheduled' },
  { blAwbNo: 'AWB-TG2024-099', isAir: true, container20ft: 0, container40ft: 0, status: 'IN_TRANSIT', origin: 'Narita, JP', destination: 'Suvarnabhumi, TH', carrier: 'Japan Airlines Cargo', vessel: 'JL-717', incoterm: 'EXW', freightCost: 5100, currency: 'USD', weight: 2100, volume: 12.4, poNumbers: ['PO-2024-031', 'PO-2024-032'], daysAgo: 3, etaOffset: 4, finalOffset: 5, remarks: 'Auto spare parts - express' },
  { blAwbNo: 'BL-TH2024-019', isAir: false, container20ft: 0, container40ft: 4, status: 'IN_TRANSIT', origin: 'Antwerp, BE', destination: 'Laem Chabang, TH', carrier: 'MSC', vessel: 'MSC Gülsün', incoterm: 'CIF', freightCost: 38000, currency: 'USD', weight: 95000, volume: 248.6, poNumbers: ['PO-2024-033', 'PO-2024-034'], daysAgo: 10, etaOffset: 22, finalOffset: 26, remarks: 'Capital equipment - project cargo' },
  { blAwbNo: 'BL-TH2024-020', isAir: false, container20ft: 3, container40ft: 1, status: 'DELIVERING', origin: 'Port Klang, MY', destination: 'Bangkok, TH', carrier: 'PIL', vessel: 'Pacific Ambition', incoterm: 'CFR', freightCost: 11800, currency: 'USD', weight: 44000, volume: 108.9, poNumbers: ['PO-2024-035', 'PO-2024-036'], daysAgo: 20, etaOffset: -5, finalOffset: -2, remarks: 'Palm oil products - last mile delivery' },
]

async function main() {
  console.log('🌱 Seeding database...')
  await prisma.alert.deleteMany()
  await prisma.receivingRecord.deleteMany()
  await prisma.shipmentEvent.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.shipment.deleteMany()

  for (const s of shipmentData) {
    const depDate = subDays(now, s.daysAgo)
    const etaPort = addDays(now, s.etaOffset)
    const finalEta = addDays(now, s.finalOffset)

    const shipment = await prisma.shipment.create({
      data: {
        blAwbNo: s.blAwbNo,
        isAir: s.isAir,
        container20ft: s.container20ft,
        container40ft: s.container40ft,
        dateDepSender: depDate,
        etaPort,
        finalEta,
        status: s.status === 'DELIVERED' ? 'RECEIVED' : s.status,
        remarks: s.remarks,
        origin: s.origin,
        destination: s.destination,
        carrier: s.carrier,
        vessel: s.vessel,
        incoterm: s.incoterm,
        freightCost: s.freightCost,
        currency: s.currency,
        weight: s.weight,
        volume: s.volume,
        customsRef: `CR-${s.blAwbNo.replace(/[^0-9]/g, '').slice(-6)}`,
      },
    })

    for (const po of s.poNumbers) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: po,
          shipmentId: shipment.id,
          quantity: Math.floor(Math.random() * 500) + 50,
          description: `Goods for ${po}`,
          value: Math.floor(Math.random() * 50000) + 5000,
          supplier: s.origin.split(',')[0],
          buyer: 'OPS Thailand Co., Ltd.',
        },
      })
    }

    const eventTemplates = [
      { type: 'BOOKING', desc: 'Booking confirmed', loc: s.origin, offset: -s.daysAgo - 2 },
      { type: 'PICKUP', desc: 'Cargo picked up from shipper', loc: s.origin, offset: -s.daysAgo },
      { type: 'DEPARTURE', desc: `Departed from ${s.origin}`, loc: s.origin, offset: -s.daysAgo + 1 },
    ]

    if (['IN_TRANSIT', 'AT_PORT', 'CUSTOMS', 'DELIVERING', 'RECEIVED', 'DELAYED'].includes(s.status === 'DELIVERED' ? 'RECEIVED' : s.status)) {
      eventTemplates.push({ type: 'TRANSIT', desc: 'Vessel in transit', loc: 'International Waters', offset: -Math.floor(s.daysAgo / 2) })
    }
    if (['AT_PORT', 'CUSTOMS', 'DELIVERING', 'RECEIVED'].includes(s.status)) {
      eventTemplates.push({ type: 'ARRIVAL', desc: `Arrived at ${s.destination || 'Destination Port'}`, loc: s.destination || 'Laem Chabang', offset: s.etaOffset - 1 })
    }
    if (['CUSTOMS', 'DELIVERING', 'RECEIVED'].includes(s.status)) {
      eventTemplates.push({ type: 'CUSTOMS', desc: 'Customs declaration submitted', loc: s.destination || 'Bangkok', offset: s.etaOffset })
    }
    if (['DELIVERING', 'RECEIVED'].includes(s.status)) {
      eventTemplates.push({ type: 'CUSTOMS_CLEARED', desc: 'Customs cleared', loc: s.destination || 'Bangkok', offset: s.etaOffset + 1 })
      eventTemplates.push({ type: 'OUT_FOR_DELIVERY', desc: 'Out for delivery', loc: s.destination || 'Bangkok', offset: s.finalOffset - 1 })
    }
    if (s.status === 'RECEIVED') {
      eventTemplates.push({ type: 'DELIVERED', desc: 'Delivered and received at warehouse', loc: 'OPS Warehouse, Bangkok', offset: s.finalOffset })
    }
    if (s.status === 'DELAYED') {
      eventTemplates.push({ type: 'DELAY', desc: 'Shipment delayed - see remarks', loc: 'In Transit', offset: -3 })
    }

    for (const ev of eventTemplates) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          eventType: ev.type,
          description: ev.desc,
          location: ev.loc,
          timestamp: addDays(now, ev.offset),
          source: 'SEED',
        },
      })
    }

    if (s.status === 'DELAYED') {
      await prisma.alert.create({
        data: {
          shipmentId: shipment.id,
          alertType: 'DELAY',
          message: `Shipment ${s.blAwbNo} is delayed. ETA extended by ${Math.abs(s.etaOffset)} days. Reason: ${s.remarks}`,
          severity: 'HIGH',
          isRead: false,
        },
      })
    }
    if (s.status === 'CUSTOMS') {
      await prisma.alert.create({
        data: {
          shipmentId: shipment.id,
          alertType: 'CUSTOMS_HOLD',
          message: `Shipment ${s.blAwbNo} is held at customs. Action required.`,
          severity: 'MEDIUM',
          isRead: false,
        },
      })
    }

    if (s.status === 'RECEIVED') {
      await prisma.receivingRecord.create({
        data: {
          shipmentId: shipment.id,
          receivedBy: ['John Smith', 'Maria Garcia', 'Somchai Jaidee', 'David Lee'][Math.floor(Math.random() * 4)],
          receivedAt: addDays(now, s.finalOffset),
          quantity: (s.container20ft + s.container40ft) * 10 || Math.floor(s.weight! / 100),
          condition: 'GOOD',
          notes: 'All items verified and stored',
          barcodeData: `OPS-${s.blAwbNo}-RCV`,
          location: `Warehouse A, Bay ${Math.floor(Math.random() * 20) + 1}`,
        },
      })
    }
  }

  console.log(`✅ Seeded ${shipmentData.length} shipments`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
