export type SaleLine = {
  id: string
  name: string
  price: number
  cogs: number
  quantity: number
}

export type SaleRecord = {
  id: string
  timestamp: string
  dateKey: string
  lines: SaleLine[]
  revenue: number
  cogs: number
  employeeCommission: number
  businessProfit: number
}

export type ArchivedDay = {
  id: string
  dateKey: string
  archivedAt: string
  sales: SaleRecord[]
}

export const EMPLOYEE_RATE = 0.4

export const PRODUCT_COGS: Record<string, number> = {
  'Regular Wiener': 5,
  'Chicago Dog': 7,
  'Cheezy Frank': 6,
  'Bacon Wrapped': 8,
  'Footlong Dog': 11,
  Sprunk: 4,
  'E-Cola': 4,
  Slushie: 4,
  Pretzel: 5,
}

const SALES_KEY = 'chihuahua-pos-sales-v1'
const ARCHIVE_KEY = 'chihuahua-pos-day-archives-v1'

export function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getSales(): SaleRecord[] {
  return read<SaleRecord[]>(SALES_KEY, [])
}

export function getArchives(): ArchivedDay[] {
  return read<ArchivedDay[]>(ARCHIVE_KEY, [])
}

export function recordSale(lines: SaleLine[], revenue: number) {
  const cogs = lines.reduce((sum, line) => sum + line.cogs * line.quantity, 0)
  const employeeCommission = revenue * EMPLOYEE_RATE
  const sale: SaleRecord = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    dateKey: getDateKey(),
    lines,
    revenue,
    cogs,
    employeeCommission,
    businessProfit: revenue - cogs - employeeCommission,
  }
  const sales = getSales()
  write(SALES_KEY, [...sales, sale])
  return sale
}

export function archiveAndClearToday() {
  const today = getDateKey()
  const sales = getSales()
  const todaySales = sales.filter((sale) => sale.dateKey === today)
  const remaining = sales.filter((sale) => sale.dateKey !== today)

  if (!todaySales.length) return null

  const archive: ArchivedDay = {
    id: `archive-${Date.now()}`,
    dateKey: today,
    archivedAt: new Date().toISOString(),
    sales: todaySales,
  }
  const archives = getArchives()
  write(ARCHIVE_KEY, [...archives, archive])
  write(SALES_KEY, remaining)
  return archive
}

export function aggregateSales(sales: SaleRecord[]) {
  return sales.reduce(
    (total, sale) => ({
      revenue: total.revenue + sale.revenue,
      cogs: total.cogs + sale.cogs,
      employeeCommission: total.employeeCommission + sale.employeeCommission,
      businessProfit: total.businessProfit + sale.businessProfit,
      orders: total.orders + 1,
      units: total.units + sale.lines.reduce((count, line) => count + line.quantity, 0),
    }),
    { revenue: 0, cogs: 0, employeeCommission: 0, businessProfit: 0, orders: 0, units: 0 },
  )
}
