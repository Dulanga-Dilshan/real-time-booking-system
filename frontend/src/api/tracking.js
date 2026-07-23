import client from './client'

export const getAllBuses = ()   => client.get('/tracking')
export const getBus     = (id) => client.get(`/tracking/${id}`)