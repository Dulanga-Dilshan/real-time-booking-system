import client from './client'

export const getProfile       = ()     => client.get('/profile')
export const getMyBookings    = ()     => client.get('/profile/bookings')
export const updatePassword   = (data) => client.post('/profile/password', data)