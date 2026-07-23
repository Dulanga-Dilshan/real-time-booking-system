import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getDrivers, assignDriver, unassignDriver } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import dayjs from 'dayjs'

export default function DriversPage() {
  const { t }                   = useTranslation()
  const [staff, setStaff]       = useState([])
  const [routes, setRoutes]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [assignments, setAssignments] = useState({})

  const load = async () => {
    try {
      const res = await getDrivers()
      setStaff(res.data.staff ?? [])
      setRoutes(res.data.routes ?? [])
      const init = {}
      res.data.staff?.forEach(s => {
        init[s.id] = s.driver_assignment?.bus_route_id ?? ''
      })
      setAssignments(init)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAssign = async (user) => {
    const routeId = assignments[user.id]
    if (!routeId) { toast.error('Select a route first'); return }
    try {
      await assignDriver(user.id, { bus_route_id: parseInt(routeId) })
      toast.success(`Route assigned to ${user.name}`)
      load()
    } catch {
      toast.error(t('common.error'))
    }
  }

  const handleUnassign = async (user) => {
    if (!confirm(`Remove assignment from ${user.name}?`)) return
    try {
      await unassignDriver(user.id)
      toast.success('Assignment removed')
      load()
    } catch {
      toast.error(t('common.error'))
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('admin.manage_drivers')}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        Bus staff register via the normal auth page. Assign them to routes here.
      </p>

      {staff.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-slate-400 text-sm">No bus staff accounts yet.</p>
          <p className="text-slate-400 text-xs mt-1">Staff should register on the site, then you can assign them here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {['Staff member', 'Current assignment', 'Assign route', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800 dark:text-white">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.driver_assignment ? (
                      <span className="text-slate-600 dark:text-slate-400">
                        {s.driver_assignment.bus_route?.from_location} → {s.driver_assignment.bus_route?.to_location}
                        <span className="ml-2 text-xs text-slate-400">
                          {dayjs(`1970-01-01T${s.driver_assignment.bus_route?.departure_time}`).format('h:mm A')}
                        </span>
                      </span>
                    ) : (
                      <Badge variant="amber">Not assigned</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={assignments[s.id] ?? ''}
                        onChange={e => setAssignments(p => ({ ...p, [s.id]: e.target.value }))}
                        className="border rounded-lg px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select route</option>
                        {routes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.from_location} → {r.to_location} ({dayjs(`1970-01-01T${r.departure_time}`).format('h:mm A')})
                          </option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => handleAssign(s)}>Assign</Button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.driver_assignment && (
                      <Button size="sm" variant="danger" onClick={() => handleUnassign(s)}>
                        Unassign
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
