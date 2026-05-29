export type ReconciliationStatus = 'Balanced' | 'Investigate' | 'Critical'

export type ReconciliationRow = {
  partId: string
  partName: string
  importedQty: number
  consumedQty: number
  physicalStock: number
  tolerancePct: number
  lastActivity: string
  pdfEvidence: string
  cctvEventId: string
  cameraId: string
  cctvUrl: string
  status: ReconciliationStatus
  variance: number
  variancePct: number
}

const rawRows = [
  {
    partId: 'RM-AX214',
    partName: 'Aluminum actuator housing',
    importedQty: 14800,
    consumedQty: 9200,
    physicalStock: 5600,
    tolerancePct: 0.5,
    lastActivity: 'Warehouse receive · Dock B · 10:42',
    pdfEvidence: '/documents/pdf/IMP-2026-0529-001',
    cctvEventId: 'CCTV-WH-B-1042',
    cameraId: 'WH-B-04',
    cctvUrl: '/cctv/event/CCTV-WH-B-1042',
  },
  {
    partId: 'RM-PC901',
    partName: 'PCB controller board',
    importedQty: 8250,
    consumedQty: 6120,
    physicalStock: 2108,
    tolerancePct: 0.35,
    lastActivity: 'Trigger job consumption · Line 3 · 10:36',
    pdfEvidence: '/documents/pdf/IMP-2026-0529-004',
    cctvEventId: 'CCTV-L3-1036',
    cameraId: 'PROD-03',
    cctvUrl: '/cctv/event/CCTV-L3-1036',
  },
  {
    partId: 'RM-SE551',
    partName: 'Customs bonded sensor kit',
    importedQty: 5200,
    consumedQty: 3880,
    physicalStock: 1210,
    tolerancePct: 1,
    lastActivity: 'Cycle count variance · Rack C17 · 10:28',
    pdfEvidence: '/documents/pdf/IMP-2026-0529-006',
    cctvEventId: 'CCTV-RC17-1028',
    cameraId: 'RACK-C-17',
    cctvUrl: '/cctv/event/CCTV-RC17-1028',
  },
  {
    partId: 'RM-BR778',
    partName: 'Precision bracket set',
    importedQty: 31000,
    consumedQty: 18400,
    physicalStock: 12600,
    tolerancePct: 0.5,
    lastActivity: 'Export packing deduction · Zone E · 10:12',
    pdfEvidence: '/documents/pdf/IMP-2026-0529-008',
    cctvEventId: 'CCTV-EXP-E-1012',
    cameraId: 'EXP-E-02',
    cctvUrl: '/cctv/event/CCTV-EXP-E-1012',
  },
  {
    partId: 'RM-LT443',
    partName: 'Lithium module case',
    importedQty: 9600,
    consumedQty: 7410,
    physicalStock: 2140,
    tolerancePct: 0.5,
    lastActivity: 'Customs hold released · 09:58',
    pdfEvidence: '/documents/pdf/IMP-2026-0529-010',
    cctvEventId: 'CCTV-GATE-0958',
    cameraId: 'GATE-01',
    cctvUrl: '/cctv/event/CCTV-GATE-0958',
  },
] as const

export const reconciliationRows: ReconciliationRow[] = rawRows.map((row) => {
  const variance = row.importedQty - (row.consumedQty + row.physicalStock)
  const variancePct = Math.abs(variance) / row.importedQty * 100
  const status: ReconciliationStatus = variance === 0
    ? 'Balanced'
    : variancePct > row.tolerancePct
      ? 'Critical'
      : 'Investigate'

  return { ...row, variance, variancePct, status }
})

export const kpiCards = [
  { label: 'Total Imports Today', value: '48', trend: '+12%', tone: 'blue', spark: [18, 24, 21, 29, 35, 48] },
  { label: 'Active Work Orders', value: '12', trend: '+3 live', tone: 'blue', spark: [8, 9, 11, 10, 12, 12] },
  { label: 'Bonded Stock Value', value: '$8.45M', trend: '99.94% matched', tone: 'green', spark: [62, 68, 70, 76, 80, 84] },
  { label: 'Consumption Today', value: '31.0K', trend: '+6.8%', tone: 'green', spark: [19, 23, 25, 27, 28, 31] },
  { label: 'Variance Alerts', value: '3', trend: '1 critical', tone: 'red', spark: [2, 2, 4, 3, 5, 3] },
  { label: 'Pending Customs Clearance', value: '12', trend: '2 blocked', tone: 'yellow', spark: [14, 13, 15, 12, 13, 12] },
  { label: 'Audit Flags', value: '7', trend: '+2 today', tone: 'yellow', spark: [4, 5, 5, 6, 6, 7] },
  { label: 'CCTV Events Today', value: '286', trend: 'all linked', tone: 'blue', spark: [80, 104, 155, 188, 233, 286] },
]

export const auditEvents = [
  { time: '10:44:18', type: 'Variance Alert', title: 'RM-SE551 exceeded tolerance', detail: 'Variance 110 units (2.12%) created audit flag AUD-9241.', severity: 'critical' },
  { time: '10:42:03', type: 'CCTV Capture', title: 'Warehouse Receive recorded', detail: 'WH-B-04 linked to declaration IMP-2026-0529-001.', severity: 'info' },
  { time: '10:36:49', type: 'Production', title: 'Job WO-7821 consumed RM-PC901', detail: 'Line 3 machine SMT-02 posted 420 units.', severity: 'warning' },
  { time: '10:31:11', type: 'Customs', title: 'Release approved by officer A. Rivera', detail: 'Entry KSK122-55891 moved from Pending to Released.', severity: 'success' },
  { time: '10:28:22', type: 'Cycle Count', title: 'Rack C17 discrepancy detected', detail: 'Physical count differs from customs book stock.', severity: 'critical' },
]

export const warehouseZones = [
  { zone: 'A1', utilization: 76, risk: 'safe', parts: 18420 },
  { zone: 'B2', utilization: 88, risk: 'warning', parts: 24100 },
  { zone: 'C17', utilization: 94, risk: 'critical', parts: 1210 },
  { zone: 'D4', utilization: 61, risk: 'safe', parts: 9800 },
  { zone: 'E9', utilization: 82, risk: 'warning', parts: 7200 },
  { zone: 'FG2', utilization: 69, risk: 'safe', parts: 8450 },
  { zone: 'QH', utilization: 35, risk: 'critical', parts: 520 },
  { zone: 'EXP', utilization: 58, risk: 'safe', parts: 3900 },
]

export const workflowSteps = [
  { step: 'Import Declaration', status: 'Complete', user: 'M. Chen', time: '08:12', progress: 100 },
  { step: 'Check-In', status: 'Complete', user: 'Gate Ops', time: '08:44', progress: 100 },
  { step: 'Warehouse Receive', status: 'Complete', user: 'S. Patel', time: '09:18', progress: 100 },
  { step: 'Stock Verification', status: 'In Review', user: 'Cycle Count', time: '10:28', progress: 72 },
  { step: 'Production Consumption', status: 'Live', user: 'Line 3', time: '10:36', progress: 64 },
  { step: 'Export Packing', status: 'Queued', user: 'Export Team', time: '11:30', progress: 24 },
  { step: 'Export Clearance', status: 'Pending', user: 'Customs', time: '14:00', progress: 8 },
]

export const cctvEvents = [
  { event: 'Check-In', camera: 'GATE-01', time: '08:44:02', transaction: 'KSK122-55891', thumbnail: 'Gate lane snapshot', marker: '00:03:12' },
  { event: 'Warehouse Receive', camera: 'WH-B-04', time: '10:42:03', transaction: 'IMP-2026-0529-001', thumbnail: 'Dock B pallet scan', marker: '00:14:08' },
  { event: 'Trigger Job Consumption', camera: 'PROD-03', time: '10:36:49', transaction: 'WO-7821', thumbnail: 'SMT-02 line feed', marker: '00:07:44' },
  { event: 'Export Packing', camera: 'EXP-E-02', time: '10:12:20', transaction: 'EXP-7714', thumbnail: 'Zone E carton close', marker: '00:02:31' },
]
