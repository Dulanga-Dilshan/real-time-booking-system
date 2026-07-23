import client from './client'

export const createBooking  = (data)      => client.post('/bookings', data)
export const getBooking     = (ref)       => client.get(`/bookings/${ref}`)
export const cancelBooking  = (ref, data) => client.post(`/bookings/${ref}/cancel`, data)
export const emailReceipt   = (ref)       => client.post(`/bookings/${ref}/email-receipt`)
export const downloadReceipt = (ref)      => 
  client.get(`/bookings/${ref}/receipt`, { responseType: 'blob' })