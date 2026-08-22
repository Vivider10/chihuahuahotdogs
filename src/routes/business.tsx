import { createFileRoute } from '@tanstack/react-router'
import BusinessDashboard from '../components/BusinessDashboard'

export const Route = createFileRoute('/business')({
  component: Business,
})

function Business() {
  return <BusinessDashboard />
}
