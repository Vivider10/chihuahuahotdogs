import { createFileRoute } from '@tanstack/react-router'
import '../discount.css'
import PointOfSale from '../components/PointOfSale'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <PointOfSale />
}
