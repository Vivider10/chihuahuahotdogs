import { useEffect, useMemo, useState } from 'react'
import { Archive, ArrowLeft, CalendarDays, Lock, LogOut, Package, Trash2, TrendingUp, Users, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { aggregateSales, archiveAndClearToday, EMPLOYEE_RATE, getArchives, getDateKey, getSales, type ArchivedDay, type SaleRecord } from '../lib/sales'

const products = [
  ['Regular Wiener', 20, 5, '2x chopped onion · 2x chopped meat'],
  ['Chicago Dog', 25, 7, '1x sliced cucumber · 2x chopped onion · 2x chopped meat'],
  ['Cheezy Frank', 25, 6, '2x chopped onion · 2x chopped meat'],
  ['Bacon Wrapped', 26, 8, '2x chopped onion · 3x chopped meat'],
  ['Footlong Dog', 40, 11, '1x chopped onion · 5x chopped meat'],
  ['Sprunk', 10, 4, '2x sliced lemon · 2x sliced orange'],
  ['E-Cola', 10, 4, '1x ice cube · 2x sliced lemon · 2x sliced orange'],
  ['Slushie', 15, 4, '1x cubed potato · 1x sliced lemon · 2x sliced orange · 2x ice cube'],
  ['Pretzel', 15, 5, '1x cubed potato · 2x flour · 2x corn flour'],
] as const

const inventory = [
  ['Box of Onions', 50, 50],
  ['Box of Potatos', 50, 50],
  ['Box of Corn', 50, 50],
  ['Box of Wheat', 50, 50],
  ['Box of Oranges', 50, 50],
  ['Box of Lemons', 50, 50],
  ['Box of Meat', 50, 100],
] as const

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const ACCESS_PASSWORD = 'wienerdog123'
const ACCESS_KEY = 'chihuahua-business-access'

export default function BusinessDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [archives, setArchives] = useState<ArchivedDay[]>([])
  const [showDaily, setShowDaily] = useState(false)
  const [selected, setSelected] = useState<ArchivedDay | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setAuthorized(sessionStorage.getItem(ACCESS_KEY) === '1')
  }, [])

  const refresh = () => {
    setSales(getSales())
    setArchives(getArchives())
  }

  useEffect(() => {
    if (!authorized) return
    refresh()
    const id = window.setInterval(refresh, 1000)
    return () => window.clearInterval(id)
  }, [authorized])

  const today = getDateKey()
  const todaySales = sales.filter((sale) => sale.dateKey === today)
  const summary = useMemo(() => aggregateSales(todaySales), [todaySales])
  const productQty = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const sale of todaySales) {
      for (const line of sale.lines) {
        totals[line.name] = (totals[line.name] ?? 0) + line.quantity
      }
    }
    return totals
  }, [todaySales])

  const signIn = () => {
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, '1')
      setAuthorized(true)
      setPassword('')
      setError('')
      return
    }
    setError('Incorrect password.')
  }

  const signOut = () => {
    sessionStorage.removeItem(ACCESS_KEY)
    setAuthorized(false)
  }

  const clearDay = () => {
    const archive = archiveAndClearToday()
    refresh()
    setMessage(
      archive
        ? `Archived ${archive.sales.length} order${archive.sales.length === 1 ? '' : 's'} for ${archive.dateKey}.`
        : 'There are no submitted orders today to clear.',
    )
  }

  if (!authorized) {
    return (
      <main style={styles.loginShell}>
        <div style={styles.loginCard}>
          <div style={styles.lock}><Lock size={23} /></div>
          <p style={styles.eyebrow}>CHIHUAHUA POS · MANAGEMENT</p>
          <h1 style={styles.loginTitle}>Business Dashboard</h1>
          <p style={styles.muted}>Enter the management password to view live financials.</p>
          <label style={styles.label}>
            Password
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError('') }}
              onKeyDown={(event) => { if (event.key === 'Enter') signIn() }}
              style={styles.input}
            />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button onClick={signIn} style={styles.primary}>Unlock Dashboard</button>
          <Link to="/" style={styles.back}><ArrowLeft size={15} /> Back to POS</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>CHIHUAHUA POS · MANAGEMENT</p>
          <h1 style={styles.title}>Business Dashboard</h1>
          <p style={styles.muted}>Live daily sales, material costs, employee commission, and business profit.</p>
        </div>
        <div style={styles.actions}>
          <button onClick={() => setShowDaily(true)} style={styles.button}><CalendarDays size={16} /> Daily Sales</button>
          <Link to="/" style={styles.button}><ArrowLeft size={16} /> POS</Link>
          <button onClick={signOut} style={styles.button}><LogOut size={16} /> Lock</button>
        </div>
      </header>

      {message && (
        <div style={styles.message}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} style={styles.closeText}>Dismiss</button>
        </div>
      )}

      <section style={styles.cards}>
        <Card label="Gross Sales" value={money.format(summary.revenue)} icon={<TrendingUp size={18} />} />
        <Card label="Material / COGS" value={money.format(summary.cogs)} icon={<Package size={18} />} />
        <Card label="Employee Share" value={money.format(summary.employeeCommission)} icon={<Users size={18} />} />
        <Card label="Business Profit" value={money.format(summary.businessProfit)} icon={<TrendingUp size={18} />} />
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHead}>
          <div><p style={styles.eyebrow}>TODAY · {today}</p><h2 style={styles.h2}>Submitted Orders</h2></div>
          <div style={styles.actions}>
            <span style={styles.badge}>Employee 40% · Business remainder after COGS</span>
            <button onClick={clearDay} style={styles.danger}><Trash2 size={15} /> Clear Day</button>
          </div>
        </div>
        {todaySales.length === 0 ? (
          <div style={styles.empty}>No submitted orders yet today. Completed POS charges will appear here automatically.</div>
        ) : (
          <div style={styles.scroll}>
            <table style={styles.table}>
              <thead><tr>{['Time', 'Order', 'Sales', 'COGS', 'Employee', 'Business'].map((header) => <th key={header} style={styles.th}>{header}</th>)}</tr></thead>
              <tbody>
                {todaySales.slice().reverse().map((sale) => (
                  <tr key={sale.id}>
                    <td style={styles.td}>{new Date(sale.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</td>
                    <td style={styles.td}>{sale.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}</td>
                    <td style={styles.td}>{money.format(sale.revenue)}</td>
                    <td style={styles.td}>{money.format(sale.cogs)}</td>
                    <td style={styles.td}>{money.format(sale.employeeCommission)}</td>
                    <td style={{ ...styles.td, fontWeight: 800 }}>{money.format(sale.businessProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHead}>
          <div><p style={styles.eyebrow}>LIVE SALES BREAKDOWN</p><h2 style={styles.h2}>Profit & Loss by Product</h2></div>
          <span style={styles.badge}>{summary.orders} orders · {summary.units} units today</span>
        </div>
        <div style={styles.scroll}>
          <table style={styles.table}>
            <thead><tr>{['Product', 'Price', 'Material Cost', 'Employee 40%', 'Business Profit / Unit', 'Sold Today', 'Business Today'].map((header) => <th key={header} style={styles.th}>{header}</th>)}</tr></thead>
            <tbody>
              {products.map(([name, price, cogs, materials]) => {
                const employee = price * EMPLOYEE_RATE
                const business = price - cogs - employee
                const qty = productQty[name] ?? 0
                return (
                  <tr key={name}>
                    <td style={styles.td}><strong>{name}</strong><div style={styles.sub}>{materials}</div></td>
                    <td style={styles.td}>{money.format(price)}</td>
                    <td style={styles.td}>{money.format(cogs)}</td>
                    <td style={styles.td}>{money.format(employee)}</td>
                    <td style={{ ...styles.td, fontWeight: 800 }}>{money.format(business)}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{qty}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800 }}>{money.format(business * qty)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.bottom}>
        <div style={styles.panel}>
          <p style={styles.eyebrow}>INGREDIENT INVENTORY</p>
          <h2 style={styles.h2}>Material Cost Reference</h2>
          <div style={styles.inventory}>
            {inventory.map(([name, quantity, boxCost]) => (
              <div key={name} style={styles.inventoryRow}>
                <div><strong>{name}</strong><div style={styles.sub}>{quantity} portions per box</div></div>
                <div style={styles.costPair}>
                  <strong>{money.format(boxCost)}</strong><span>per box</span>
                  <strong>{money.format(boxCost / quantity)}</strong><span>per unit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.panel}>
          <p style={styles.eyebrow}>CURRENT DAY</p>
          <h2 style={styles.h2}>Daily Profit / Loss</h2>
          <div style={styles.metrics}>
            <Metric label="Orders" value={summary.orders.toString()} />
            <Metric label="Units sold" value={summary.units.toString()} />
            <Metric label="Gross sales" value={money.format(summary.revenue)} />
            <Metric label="Material cost" value={money.format(summary.cogs)} />
            <Metric label="Employee commission (40%)" value={money.format(summary.employeeCommission)} />
            <Metric label="Business profit" value={money.format(summary.businessProfit)} strong />
          </div>
          <p style={styles.note}>Business profit = sales − material cost − employee commission.</p>
        </div>
      </section>

      {showDaily && <DailyModal archives={archives} todaySales={todaySales} close={() => setShowDaily(false)} openArchive={setSelected} />}
      {selected && <ArchiveModal archive={selected} close={() => setSelected(null)} />}
    </main>
  )
}

function Card({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div style={styles.card}><div style={styles.icon}>{icon}</div><span style={styles.cardLabel}>{label}</span><strong style={styles.cardValue}>{value}</strong></div>
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div style={styles.metric}><span>{label}</span><strong style={strong ? { color: '#7ce6a8' } : undefined}>{value}</strong></div>
}

function DailyModal({ archives, todaySales, close, openArchive }: { archives: ArchivedDay[]; todaySales: SaleRecord[]; close: () => void; openArchive: (archive: ArchivedDay) => void }) {
  const today = aggregateSales(todaySales)
  return (
    <div style={styles.overlay} onMouseDown={close}>
      <div style={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
        <div style={styles.modalHead}><div><p style={styles.eyebrow}>SALES ARCHIVE</p><h2 style={styles.h2}>Daily Sales</h2></div><button onClick={close} style={styles.iconButton}><X size={18} /></button></div>
        <div style={styles.modalMetrics}><Metric label="Today sales" value={money.format(today.revenue)} /><Metric label="Today COGS" value={money.format(today.cogs)} /><Metric label="Today business profit" value={money.format(today.businessProfit)} strong /></div>
        <p style={styles.archiveHeading}>Archived Days</p>
        {archives.slice().reverse().map((archive) => {
          const total = aggregateSales(archive.sales)
          return <button key={archive.id} style={styles.archiveRow} onClick={() => openArchive(archive)}><div><strong>{archive.dateKey}</strong><span>{archive.sales.length} orders · {total.units} units</span></div><div><span>{money.format(total.revenue)} sales</span><strong>{money.format(total.businessProfit)} profit</strong></div><Archive size={16} /></button>
        })}
        {archives.length === 0 && <div style={styles.empty}>No archived days yet.</div>}
        <p style={styles.archiveNote}>Daily history remains stored in this browser until browser storage is cleared.</p>
      </div>
    </div>
  )
}

function ArchiveModal({ archive, close }: { archive: ArchivedDay; close: () => void }) {
  const total = aggregateSales(archive.sales)
  return (
    <div style={styles.overlay} onMouseDown={close}>
      <div style={styles.modalWide} onMouseDown={(event) => event.stopPropagation()}>
        <div style={styles.modalHead}><div><p style={styles.eyebrow}>ARCHIVED DAY</p><h2 style={styles.h2}>{archive.dateKey}</h2></div><button onClick={close} style={styles.iconButton}><X size={18} /></button></div>
        <div style={styles.cardsSmall}>
          <Card label="Sales" value={money.format(total.revenue)} icon={<TrendingUp size={16} />} />
          <Card label="COGS" value={money.format(total.cogs)} icon={<Package size={16} />} />
          <Card label="Employee" value={money.format(total.employeeCommission)} icon={<Users size={16} />} />
          <Card label="Business Profit" value={money.format(total.businessProfit)} icon={<TrendingUp size={16} />} />
        </div>
        <div style={styles.scroll}>
          <table style={styles.table}>
            <thead><tr>{['Time', 'Items', 'Sales', 'COGS', 'Business'].map((header) => <th key={header} style={styles.th}>{header}</th>)}</tr></thead>
            <tbody>{archive.sales.map((sale) => <tr key={sale.id}><td style={styles.td}>{new Date(sale.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</td><td style={styles.td}>{sale.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}</td><td style={styles.td}>{money.format(sale.revenue)}</td><td style={styles.td}>{money.format(sale.cogs)}</td><td style={{ ...styles.td, fontWeight: 800 }}>{money.format(sale.businessProfit)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#101313', color: '#f3f0e8', padding: '34px clamp(18px,4vw,60px)' },
  loginShell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#101313', padding: 24 },
  loginCard: { width: 'min(430px,100%)', background: '#191d1d', border: '1px solid #303737', borderRadius: 24, padding: 32, boxShadow: '0 25px 70px rgba(0,0,0,.35)' },
  lock: { width: 52, height: 52, borderRadius: 16, background: '#2b332f', display: 'grid', placeItems: 'center', color: '#f2c64d', marginBottom: 20 },
  eyebrow: { margin: 0, fontSize: 11, letterSpacing: '.14em', fontWeight: 800, color: '#9ca8a4' },
  title: { margin: '5px 0 8px', fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-.03em' },
  loginTitle: { margin: '4px 0 8px', fontSize: 32 },
  h2: { margin: '5px 0 0', fontSize: 24 },
  muted: { color: '#aab3b0', lineHeight: 1.6, margin: 0 },
  label: { display: 'grid', gap: 8, marginTop: 24, fontSize: 13, fontWeight: 700 },
  input: { width: '100%', boxSizing: 'border-box', background: '#0f1212', color: '#f3f0e8', border: '1px solid #3a4341', borderRadius: 12, padding: '13px 14px', fontSize: 16 },
  error: { color: '#ff8d8d', margin: '10px 0 0', fontSize: 13, fontWeight: 700 },
  primary: { marginTop: 20, width: '100%', border: 0, borderRadius: 12, padding: '13px 16px', background: '#f2c64d', color: '#171717', fontWeight: 900, cursor: 'pointer' },
  back: { marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b9c1bd', textDecoration: 'none', fontSize: 13, fontWeight: 700 },
  header: { maxWidth: 1400, margin: '0 auto 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap' },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  button: { display: 'inline-flex', alignItems: 'center', gap: 7, color: '#ece8de', background: '#1d2322', border: '1px solid #353d3b', borderRadius: 11, padding: '10px 13px', textDecoration: 'none', cursor: 'pointer', fontWeight: 700 },
  danger: { display: 'inline-flex', alignItems: 'center', gap: 7, color: '#ffd9d9', background: '#351f20', border: '1px solid #633739', borderRadius: 11, padding: '9px 12px', cursor: 'pointer', fontWeight: 800 },
  message: { maxWidth: 1400, margin: '0 auto 18px', padding: '12px 14px', borderRadius: 12, background: '#202b25', border: '1px solid #38503f', color: '#bfe8cb', display: 'flex', justifyContent: 'space-between', gap: 10 },
  closeText: { background: 'none', border: 0, color: 'inherit', cursor: 'pointer' },
  cards: { maxWidth: 1400, margin: '0 auto 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 },
  cardsSmall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 },
  card: { background: '#191d1d', border: '1px solid #303737', borderRadius: 18, padding: 18 },
  icon: { width: 38, height: 38, borderRadius: 11, background: '#262d2b', display: 'grid', placeItems: 'center', color: '#f2c64d', marginBottom: 12 },
  cardLabel: { display: 'block', color: '#9da7a3', fontSize: 12, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase' },
  cardValue: { display: 'block', marginTop: 6, fontSize: 25 },
  panel: { maxWidth: 1400, margin: '0 auto 18px', background: '#171b1b', border: '1px solid #2e3534', borderRadius: 20, padding: 22, overflow: 'hidden' },
  panelHead: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', marginBottom: 18, flexWrap: 'wrap' },
  badge: { border: '1px solid #34403c', background: '#202724', color: '#b7c1bc', borderRadius: 999, padding: '8px 12px', fontSize: 11, fontWeight: 800 },
  scroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: { padding: '12px 10px', textAlign: 'left', color: '#8f9995', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid #303737' },
  td: { padding: '14px 10px', borderBottom: '1px solid #242a29', fontSize: 13, verticalAlign: 'top' },
  sub: { marginTop: 4, color: '#89928f', fontSize: 11, lineHeight: 1.5 },
  empty: { padding: 28, borderRadius: 14, background: '#151918', border: '1px dashed #343d3a', color: '#929c98', textAlign: 'center', lineHeight: 1.5 },
  bottom: { maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 18 },
  inventory: { display: 'grid', gap: 10, marginTop: 18 },
  inventoryRow: { display: 'flex', justifyContent: 'space-between', gap: 15, alignItems: 'center', background: '#1d2221', border: '1px solid #2c3432', borderRadius: 13, padding: '12px 14px', fontSize: 13 },
  costPair: { display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 8, alignItems: 'center', textAlign: 'right' },
  metrics: { marginTop: 18 },
  metric: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #2a302f', color: '#aab2ae', fontSize: 14 },
  note: { marginTop: 18, padding: 12, borderRadius: 12, background: '#1e2523', color: '#aeb9b4', fontSize: 12, lineHeight: 1.45 },
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,8,8,.74)', display: 'grid', placeItems: 'center', padding: 18 },
  modal: { width: 'min(760px,100%)', maxHeight: '88vh', overflow: 'auto', background: '#171b1b', border: '1px solid #333d3a', borderRadius: 22, padding: 22, boxShadow: '0 30px 90px rgba(0,0,0,.45)' },
  modalWide: { width: 'min(1100px,100%)', maxHeight: '88vh', overflow: 'auto', background: '#171b1b', border: '1px solid #333d3a', borderRadius: 22, padding: 22, boxShadow: '0 30px 90px rgba(0,0,0,.45)' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 14, marginBottom: 18 },
  iconButton: { border: '1px solid #38413e', background: '#202624', color: '#e9e6dc', width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', cursor: 'pointer' },
  modalMetrics: { display: 'grid', gap: 2, marginBottom: 18, background: '#1b211f', border: '1px solid #2d3734', borderRadius: 14, padding: '10px 14px' },
  archiveHeading: { margin: '12px 0 8px', color: '#8e9995', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 800 },
  archiveRow: { width: '100%', border: '1px solid #2d3734', background: '#1b211f', color: '#ede9df', borderRadius: 13, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', textAlign: 'left', cursor: 'pointer', marginBottom: 8 },
  archiveNote: { margin: '16px 0 0', color: '#818b87', fontSize: 11, lineHeight: 1.5 },
}
