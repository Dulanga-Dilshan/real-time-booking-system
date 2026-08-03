import client from './client'

export const getStats = () => client.get('/admin/stats')

export const getAdminRoutes = ()         => client.get('/admin/routes')
export const createRoute    = (data)     => client.post('/admin/routes', data)
export const updateRoute    = (id, data) => client.put(`/admin/routes/${id}`, data)
export const deleteRoute    = (id)       => client.delete(`/admin/routes/${id}`)

export const getAdminBookings   = (params) => client.get('/admin/bookings', { params })
export const cancelAdminBooking = (id)     => client.post(`/admin/bookings/${id}/cancel`)

export const getDrivers     = ()         => client.get('/admin/drivers')
export const assignDriver   = (id, data) => client.post(`/admin/drivers/${id}/assign`, data)
export const unassignDriver = (id)       => client.post(`/admin/drivers/${id}/unassign`)

export const getTemplates   = ()         => client.get('/admin/route-templates')
export const createTemplate = (data)     => client.post('/admin/route-templates', data)
export const updateTemplate = (id, data) => client.put(`/admin/route-templates/${id}`, data)
export const deleteTemplate = (id)       => client.delete(`/admin/route-templates/${id}`)