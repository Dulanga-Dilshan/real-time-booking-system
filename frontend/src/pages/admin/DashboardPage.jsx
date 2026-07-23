import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { getStats } from '@/api/admin'
import { getAdminRoutes } from '@/api/admin'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

function StatCard({ label, value, color = 'text-slate-800 dark:text-white' }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats]   = useState(null)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getAdminRoutes()])
      .then(([s, r]) => {
        setStats(s.data)
        setRoutes(r.data.routes ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.dashboard')}</h1>
        <Link to="/admin/routes">
          <Button>+ {t('admin.add_route')}</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label={t('admin.total_routes')}   value={stats?.total_routes   ?? 0}/>
        <StatCard label={t('admin.total_bookings')} value={stats?.total_bookings ?? 0}/>
        <StatCard label={t('admin.today_bookings')} value={stats?.today_bookings ?? 0} color="text-blue-600 dark:text-blue-400"/>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { to: '/admin/routes',    label: t('admin.all_routes')      },
          { to: '/admin/bookings',  label: t('admin.view_bookings')   },
          { to: '/admin/drivers',   label: t('admin.manage_drivers')  },
          { to: '/admin/templates', label: t('admin.route_templates') },
        ].map(item => (
          <Link key={item.to} to={item.to}>
            <Card className="p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Routes table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.all_routes')}</h2>
          <Link to="/admin/routes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {t('admin.view_bookings')} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {['Route', t('admin.departure'), t('admin.seats'), t('admin.price'), 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {routes.map(route => (
                <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {route.bus_number && (
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {route.bus_number}
                        </span>
                      )}
                      <span className="font-medium text-slate-800 dark:text-white">
                        {route.from_location} → {route.to_location}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{route.total_seats}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">LKR {Number(route.price).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={route.is_active ? 'green' : 'slate'}>
                      {route.is_active ? t('admin.active') : t('admin.inactive')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}