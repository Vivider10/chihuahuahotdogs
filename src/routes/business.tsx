import { createFileRoute } from '@tanstack/react-router'
import '../business-theme.css'
import BusinessDashboard from '../components/BusinessDashboard'

export const Route = createFileRoute('/business')({
  component: Business,
})

function Business() {
  return <div className="business-page"><BusinessDashboard /></div>
}
