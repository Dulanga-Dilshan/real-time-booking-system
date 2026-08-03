import { View } from 'react-native'

export default function Card({ children, className = '', dark = false, style }) {
  const base = dark
    ? 'bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-2xl'
    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl'

  return (
    <View className={`${base} ${className}`} style={style}>
      {children}
    </View>
  )
}