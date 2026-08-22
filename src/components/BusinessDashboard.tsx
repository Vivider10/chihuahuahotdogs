import { useMemo, useState } from 'react'
import { ArrowLeft, Lock, LogOut, Package, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { Link } from '@tanstack/react-router'

type Product = { name: string; price: number; cogs: number; materials: string }

const products: Product[] = [
  { name: 'Regular Wiener', price: 20, cogs: 5, materials: '2x chopped onion · 2x chopped meat' },
  { name: 'Chicago Dog', price: 25, cogs: 7, materials: '1x sliced cucumber · 2x chopped onion · 2x chopped meat' },
  { name: 'Cheezy Frank', price: 25, cogs: 6, materials: '2x chopped onion · 2x chopped meat' },
  { name: 'Bacon Wrapped', price: 26, cogs: 8, materials: '2x chopped onion · 3x chopped meat' },
  { name: 'Footlong Dog', price: 40, cogs: 11, materials: '1x chopped onion · 5x chopped meat' },
  { name: 'Sprunk', price: 10, cogs: 4, materials: '2x sliced lemon · 2x sliced orange' },
  { name: 'E-Cola', price: 10, cogs: 4, materials: '1x ice cube · 2x sliced lemon · 2x sliced orange' },
  { name: 'Slushie', price: 15, cogs: 4, materials: '1x cubed potato · 1x sliced lemon · 2x sliced orange · 2x ice cube' },
  { name: 'Pretzel', price: 15, cogs: 5, materials: '1x cubed potato · 2x flour · 2x corn flour' },
]

const inventory = [
  { name: 'Box of Onions', quantity: 50, boxCost: 50 },
  { name: 'Box of Potatos', quantity: 50, boxCost: 50 },
  { name: 'Box of Corn', quantity: 50, boxCost: 50 },
  { name: 'Box of Wheat', quantity: 50, boxCost: 50 },
  { name: 'Box of Oranges', quantity: 50, boxCost: 50 },
  { name: 'Box of Lemons', quantity: 50, boxCost: 50 },
  { name: 'Box of Meat', quantity: 50, boxCost: 100 },
]

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const EMPLOYEE_RATE = 0.4
const ACCESS_PASSWORD = 'wienerdog123'
const ACCESS_KEY = 'chihuahua-business-access'

export default function BusinessDashboard() {
  const [authorized, setAuthorized] = useState(() => sessionStorage.getItem(ACCESS_KEY) === '1')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const summary = useMemo(() => products.reduce((totals, product) => {
    const quantity = Math.max(0, quantities[product.name] ?? 0)
    const sales = product.price * quantity
    const cogs = product.cogs * quantity
    const employee = sales * EMPLOYEE_RATE
    return {
      sales: totals.sales + sales,
      cogs: totals.cogs + cogs,
      employee: totals.employee + employee,
      business: totals.business + sales - cogs - employee,
      units: totals.units + quantity,
    }
  }, { sales: 0, cogs: 0, employee: 0, business: 0, units: 0 }), [quantities])

  const signIn = () => {
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, '1')
      setAuthorized(true)
      setPassword('')
      setError('')
    } else {
      setError('Incorrect password.')
    }
  }

  const signOut = () => {
    sessionStorage.removeItem(ACCESS_KEY)
    setAuthorized(false)
    setQuantities({})
  }

  if (!authorized) {
    return (
      <main style={styles.loginShell}>
        <div style={styles.loginCard}>
          <div style={styles.lockBadge}><Lock size={24} /></div>
          <p style={styles.eyebrow}>CHIHUAHUA POS · MANAGEMENT</p>
          <h1 style={styles.loginTitle}>Business Dashboard</h1>
          <p style={styles.muted}>Enter the management password to view material costs, commissions, and business profit.</p>
          <label style={styles.label}>Password
            <input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} onKeyDown={(event) => { if (event.key === 'Enter') signIn() }} style={styles.input} placeholder="Enter password" />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button onClick={signIn} style={styles.primaryButton}>Unlock Dashboard</button>
          <Link to="/" style={styles.backLink}><ArrowLeft size={16} /> Back to POS</Link>
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
          <p style={styles.muted}>Material costs, employee commission, and estimated business profit.</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/" style={styles.secondaryButton}><ArrowLeft size={16} /> POS</Link>
          <button onClick={signOut} style={styles.secondaryButton}><LogOut size={16} /> Lock</button>
        </div>
      </header>

      <section style={styles.summaryGrid}>
        <SummaryCard label="Gross Sales" value={money.format(summary.sales)} icon={<TrendingUp size={19} />} />
        <SummaryCard label="Material / COGS" value={money.format(summary.cogs)} icon={<Package size={19} />} />
        <SummaryCard label="Employee Share" value={money.format(summary.employee)} icon={<Users size={19} />} />
        <SummaryCard label="Business Profit" value={money.format(summary.business)} icon={<TrendingUp size={19} />} />
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeading}>
          <div><p style={styles.eyebrow}>SALES ESTIMATOR</p><h2 style={styles.sectionTitle}>Profit & Loss by Product</h2></div>
          <span style={styles.rateBadge}>Employee 40% · Business remainder after COGS</span>
        </div>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Product</th><th style={styles.th}>Price</th><th style={styles.th}>Material Cost</th><th style={styles.th}>Employee 40%</th><th style={styles.th}>Business Profit</th><th style={{ ...styles.th, textAlign: 'center' }}>Qty Sold</th><th style={{ ...styles.th, textAlign: 'right' }}>Projected Business Profit</th>
            </tr></thead>
            <tbody>{products.map((product) => {
              const employee = product.price * EMPLOYEE_RATE
              const business = product.price - product.cogs - employee
              const quantity = quantities[product.name] ?? 0
              return <tr key={product.name}>
                <td style={styles.td}><strong>{product.name}</strong><div style={styles.materials}>{product.materials}</div></td>
                <td style={styles.td}>{money.format(product.price)}</td>
                <td style={styles.td}>{money.format(product.cogs)}</td>
                <td style={styles.td}>{money.format(employee)}</td>
                <td style={{ ...styles.td, fontWeight: 800 }}>{money.format(business)}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}><input type="number" min="0" value={quantity} onChange={(event) => setQuantities((current) => ({ ...current, [product.name]: Number(event.target.value) || 0 }))} style={styles.qtyInput} /></td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800 }}>{money.format(business * quantity)}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </section>

      <section style={styles.bottomGrid}>
        <div style={styles.panel}>
          <p style={styles.eyebrow}>INGREDIENT INVENTORY</p><h2 style={styles.sectionTitle}>Material Cost Reference</h2>
          <div style={styles.inventoryGrid}>{inventory.map((item) => <div key={item.name} style={styles.inventoryCard}><div><strong>{item.name}</strong><div style={styles.materials}>{item.quantity} portions per box</div></div><strong>{money.format(item.boxCost / item.quantity)} / unit</strong></div>)}</div>
        </div>
        <div style={styles.panel}>
          <p style={styles.eyebrow}>CURRENT SCENARIO</p><h2 style={styles.sectionTitle}>Projected Split</h2>
          <div style={styles.metricList}>
            <Metric label="Units sold" value={summary.units.toString()} /><Metric label="Gross sales" value={money.format(summary.sales)} /><Metric label="Material cost" value={money.format(summary.cogs)} /><Metric label="Employee commission" value={money.format(summary.employee)} /><Metric label="Business profit" value={money.format(summary.business)} strong />
          </div>
          <div style={styles.note}><TrendingDown size={17} /> Business profit is sales − material cost − employee commission.</div>
        </div>
      </section>
    </main>
  )
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div style={styles.summaryCard}><div style={styles.summaryIcon}>{icon}</div><span style={styles.summaryLabel}>{label}</span><strong style={styles.summaryValue}>{value}</strong></div>
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div style={styles.metricRow}><span>{label}</span><strong style={strong ? { color: '#7ce6a8' } : undefined}>{value}</strong></div>
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#101313', color: '#f3f0e8', padding: '34px clamp(18px, 4vw, 60px)', fontFamily: 'inherit' },
  loginShell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#101313', color: '#f3f0e8', padding: 24, fontFamily: 'inherit' },
  loginCard: { width: 'min(440px, 100%)', background: '#191d1d', border: '1px solid #303737', borderRadius: 24, padding: 32, boxShadow: '0 25px 70px rgba(0,0,0,.35)' },
  lockBadge: { width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 16, background: '#2b332f', marginBottom: 20 },
  eyebrow: { margin: 0, fontSize: 11, letterSpacing: '.14em', fontWeight: 800, color: '#9ca8a4' },
  title: { margin: '5px 0 8px', fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-.03em' },
  loginTitle: { margin: '4px 0 8px', fontSize: 32, letterSpacing: '-.03em' },
  sectionTitle: { margin: '5px 0 0', fontSize: 24, letterSpacing: '-.02em' },
  muted: { color: '#aab3b0', lineHeight: 1.6, margin: 0 },
  label: { display: 'grid', gap: 8, marginTop: 24, fontSize: 13, fontWeight: 700 },
  input: { width: '100%', boxSizing: 'border-box', background: '#0f1212', color: '#f3f0e8', border: '1px solid #3a4341', borderRadius: 12, padding: '13px 14px', fontSize: 16, outline: 'none' },
  qtyInput: { width: 72, background: '#0f1212', color: '#f3f0e8', border: '1px solid #39413f', borderRadius: 10, padding: '9px 8px', textAlign: 'center' },
  error: { color: '#ff8d8d', margin: '10px 0 0', fontSize: 13, fontWeight: 700 },
  primaryButton: { marginTop: 20, width: '100%', border: 0, borderRadius: 12, padding: '13px 16px', background: '#f2c64d', color: '#171717', fontWeight: 900, cursor: 'pointer', fontSize: 15 },
  secondaryButton: { display: 'inline-flex', alignItems: 'center', gap: 7, color: '#ece8de', background: '#1d2322', border: '1px solid #353d3b', borderRadius: 11, padding: '10px 13px', textDecoration: 'none', cursor: 'pointer', fontWeight: 700 },
  backLink: { marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b9c1bd', textDecoration: 'none', fontSize: 13, fontWeight: 700 },
  header: { maxWidth: 1400, margin: '0 auto 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap' },
  headerActions: { display: 'flex', gap: 10 },
  summaryGrid: { maxWidth: 1400, margin: '0 auto 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 },
  summaryCard: { background: '#191d1d', border: '1px solid #303737', borderRadius: 18, padding: 18 },
  summaryIcon: { width: 38, height: 38, borderRadius: 11, background: '#262d2b', display: 'grid', placeItems: 'center', color: '#f2c64d', marginBottom: 12 },
  summaryLabel: { display: 'block', color: '#9da7a3', fontSize: 12, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase' },
  summaryValue: { display: 'block', marginTop: 6, fontSize: 25 },
  panel: { maxWidth: 1400, margin: '0 auto 18px', background: '#171b1b', border: '1px solid #2e3534', borderRadius: 20, padding: 22, overflow: 'hidden' },
  panelHeading: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', marginBottom: 18, flexWrap: 'wrap' },
  rateBadge: { border: '1px solid #34403c', background: '#202724', color: '#b7c1bc', borderRadius: 999, padding: '8px 12px', fontSize: 11, fontWeight: 800 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 980 },
  th: { padding: '12px 10px', textAlign: 'left', color: '#8f9995', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid #303737' },
  td: { padding: '14px 10px', borderBottom: '1px solid #242a29', fontSize: 13, verticalAlign: 'top' },
  materials: { marginTop: 4, color: '#89928f', fontSize: 11, lineHeight: 1.5 },
  bottomGrid: { maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 18 },
  inventoryGrid: { display: 'grid', gap: 10, marginTop: 18 },
  inventoryCard: { display: 'flex', justifyContent: 'space-between', gap: 15, alignItems: 'center', background: '#1d2221', border: '1px solid #2c3432', borderRadius: 13, padding: '12px 14px', fontSize: 13 },
  metricList: { marginTop: 18, display: 'grid', gap: 3 },
  metricRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #2a302f', color: '#aab2ae', fontSize: 14 },
  note: { marginTop: 18, padding: 12, borderRadius: 12, background: '#1e2523', color: '#aeb9b4', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, lineHeight: 1.45 },
}
