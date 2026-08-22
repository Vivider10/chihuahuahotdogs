import { createFileRoute } from '@tanstack/react-router'
import PointOfSale from '../components/PointOfSale'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <PointOfSale />
}
