import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  Coffee,
  Cookie,
  CreditCard,
  Minus,
  Moon,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  Utensils,
  X,
} from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  color: string
  icon: typeof Coffee
}

type CartItem = MenuItem & { quantity: number }
type Theme = 'dark' | 'light'

const menuItems: MenuItem[] = [
  { id: 'regular-wiener', name: 'Regular Wiener', description: 'Hotdog', price: 15, category: 'Hotdogs', color: 'clay', icon: Utensils },
  { id: 'chicago-dog', name: 'Chicago Dog', description: 'Hotdog', price: 20, category: 'Hotdogs', color: 'sage', icon: Utensils },
  { id: 'cheezy-frank', name: 'Cheezy Frank', description: 'Hotdog', price: 20, category: 'Hotdogs', color: 'mustard', icon: Utensils },
  { id: 'bacon-wrapped-frank', name: 'Bacon Wrapped Frank', description: 'Hotdog', price: 21, category: 'Hotdogs', color: 'tomato', icon: Utensils },
  { id: 'footlong-dog', name: 'Footlong Dog', description: 'Hotdog', price: 35, category: 'Hotdogs', color: 'oat', icon: Utensils },
  { id: 'pretzel', name: 'Pretzel', description: 'Snack', price: 8, category: 'Snacks', color: 'clay', icon: Cookie },
  { id: 'sprunk', name: 'Sprunk', description: 'Drink', price: 10, category: 'Drinks', color: 'sage', icon: Coffee },
  { id: 'e-cola', name: 'E-Cola', description: 'Drink', price: 10, category: 'Drinks', color: 'tomato', icon: Coffee },
  { id: 'slushie', name: 'Slushie', description: 'Drink', price: 14, category: 'Drinks', color: 'oat', icon: Sparkles },
]

const categories = ['All', 'Hotdogs', 'Snacks', 'Drinks']
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function PointOfSale() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [showCustomItem, setShowCustomItem] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [notice, setNotice] = useState('')

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const discount = discountEnabled ? subtotal * 0.1 : 0
  const total = subtotal - discount
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = (item: MenuItem) => {
    setNotice('')
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }
      return [...current, { ...item, quantity: 1 }]
    })
  }

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const addCustomItem = () => {
    const price = Number(customPrice)
    if (!customName.trim() || !Number.isFinite(price) || price <= 0) return

    addItem({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      description: 'Custom item',
      price,
      category: 'Custom',
      color: 'ink',
      icon: ReceiptText,
    })
    setCustomName('')
    setCustomPrice('')
    setShowCustomItem(false)
  }

  const completeSale = () => {
    if (!cart.length) return
    setNotice(`Sale completed for ${currency.format(total)}.`)
    setCart([])
    setDiscountEnabled(false)
  }

  return (
    <main className="pos-shell" data-theme={theme}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <img src="/chihuahua-hotdogs-logo.webp" alt="Chihuahua Hotdogs" />
          </div>
          <div>
            <p className="eyebrow">POINT OF SALE · COUNTER 01</p>
            <h1>Chihuahua Hotdogs</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <div className="shift-status"><span /> Register open</div>
        </div>
      </header>

      {notice && (
        <div className="success-toast" role="status">
          <BadgeCheck size={20} /> {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={17} /></button>
        </div>
      )}

      <div className="workspace">
        <section className="catalog-panel">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">QUICK SALE</p>
              <h2>What can we get started?</h2>
            </div>
            <button className="custom-item-button" onClick={() => setShowCustomItem(true)}>
              <Plus size={18} /> Custom item
            </button>
          </div>

          <div className="catalog-tools">
            <div className="category-tabs" aria-label="Product categories">
              {categories.map((name) => (
                <button
                  key={name}
                  className={category === name ? 'active' : ''}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find an item"
                aria-label="Find an item"
              />
            </label>
          </div>

          <div className="product-grid">
            {filteredItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  className={`product-card ${item.color}`}
                  key={item.id}
                  onClick={() => addItem(item)}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <span className="product-icon"><Icon size={25} strokeWidth={1.8} /></span>
                  <span className="product-copy">
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="product-price">{currency.format(item.price)}</span>
                  <span className="add-indicator"><Plus size={16} /></span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="order-panel">
          <div className="order-heading">
            <div>
              <p className="eyebrow">CURRENT ORDER</p>
              <h2>Order #{String(1847 + itemCount).padStart(4, '0')}</h2>
            </div>
            {cart.length > 0 && (
              <button className="clear-button" onClick={() => setCart([])}>
                <Trash2 size={16} /> Clear
              </button>
            )}
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-illustration">
                  <ShoppingBag size={35} strokeWidth={1.4} />
                  <span className="empty-plus"><Plus size={15} /></span>
                </div>
                <h3>Your counter is clear</h3>
                <p>Tap an item to begin this order.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div className="cart-item-copy">
                    <strong>{item.name}</strong>
                    <span>{currency.format(item.price)} each</span>
                  </div>
                  <div className="quantity-control">
                    <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button>
                  </div>
                  <strong className="line-total">{currency.format(item.price * item.quantity)}</strong>
                </div>
              ))
            )}
          </div>

          <div className="checkout-area">
            <button
              className={`responder-discount ${discountEnabled ? 'selected' : ''}`}
              onClick={() => setDiscountEnabled((enabled) => !enabled)}
              aria-pressed={discountEnabled}
            >
              <span className="shield"><ShieldCheck size={23} /></span>
              <span><strong>First responder</strong><small>Apply 10% discount</small></span>
              <span className="discount-toggle"><i /></span>
            </button>

            <div className="totals">
              <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
              {discountEnabled && <div className="discount-line"><span>First responder · 10%</span><strong>−{currency.format(discount)}</strong></div>}
              <div className="grand-total"><span>Total</span><strong>{currency.format(total)}</strong></div>
            </div>

            <button className="charge-button" disabled={!cart.length} onClick={completeSale}>
              <CreditCard size={21} />
              <span>Charge {currency.format(total)}</span>
              <span className="arrow">→</span>
            </button>
            <p className="order-note">Discount is applied before payment.</p>
          </div>
        </aside>
      </div>

      {showCustomItem && (
        <div className="modal-backdrop" onMouseDown={() => setShowCustomItem(false)}>
          <div className="custom-modal" role="dialog" aria-modal="true" aria-labelledby="custom-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCustomItem(false)} aria-label="Close"><X size={20} /></button>
            <p className="eyebrow">OPEN ITEM</p>
            <h2 id="custom-title">Add something custom</h2>
            <p className="modal-description">Enter a name and price to add it directly to this order.</p>
            <label>Item name<input autoFocus value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Example: Catering deposit" /></label>
            <label>Price<div className="price-input"><span>$</span><input type="number" min="0.01" step="0.01" value={customPrice} onChange={(event) => setCustomPrice(event.target.value)} placeholder="0.00" /></div></label>
            <button className="modal-add" disabled={!customName.trim() || Number(customPrice) <= 0} onClick={addCustomItem}>Add to order</button>
          </div>
        </div>
      )}
    </main>
  )
}
