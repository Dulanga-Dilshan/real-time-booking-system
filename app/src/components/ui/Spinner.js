import { ActivityIndicator } from 'react-native'

const sizes = { sm: 'small', md: 'small', lg: 'large' }

export default function Spinner({ size = 'md' }) {
  return <ActivityIndicator size={sizes[size]} color="#2563eb" />
}