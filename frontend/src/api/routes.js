import client from './client'

export const getRoutes   = (params) => client.get('/routes', { params })
export const getRoute    = (id, params) => client.get(`/routes/${id}`, { params })
export const getSeats    = (id, params) => client.get(`/routes/${id}/seats`, { params })