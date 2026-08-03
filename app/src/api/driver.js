import client from './client'

export const getDriverDashboard = ()     => client.get('/driver')
export const updateLocation     = (data) => client.post('/driver/location', data)
export const updateGps          = (data) => client.post('/driver/gps', data)
export const setTrackingMode    = (data) => client.post('/driver/mode', data)