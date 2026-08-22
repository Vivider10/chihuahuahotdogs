# Kindred POS

A fast, touch-friendly point-of-sale interface for building an order and calculating its final total. It includes preset products, custom item entry, quantity controls, live totals, a one-tap 10% first responder discount, and a simple sale-completion flow.

## Technologies

- TanStack Start and TanStack Router
- React 19 with TypeScript
- Tailwind CSS 4 and custom CSS
- Lucide React icons
- Netlify deployment adapter

## Run Locally

Requirements: Node.js 22 and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal. To create a production bundle, run `pnpm build`.

## Usage

1. Tap a menu card to add it to the current order.
2. Use the plus and minus controls to adjust quantities.
3. Add an open-priced product with **Custom item** when needed.
4. Toggle **First responder** to apply a 10% discount.
5. Review the total and select **Charge** to complete and clear the sale.

The current version is a checkout calculator and does not process real payments or save sales after the page is refreshed.
