import { View, Text } from 'react-native'

const variants = {
  green: 'bg-emerald-50 dark:bg-emerald-900/30',
  red:   'bg-red-50 dark:bg-red-900/30',
  blue:  'bg-blue-50 dark:bg-blue-900/30',
  amber: 'bg-amber-50 dark:bg-amber-900/30',
  slate: 'bg-slate-100 dark:bg-slate-800',
}

const textVariants = {
  green: 'text-emerald-700 dark:text-emerald-400',
  red:   'text-red-600 dark:text-red-400',
  blue:  'text-blue-700 dark:text-blue-400',
  amber: 'text-amber-700 dark:text-amber-400',
  slate: 'text-slate-600 dark:text-slate-400',
}

export default function Badge({ children, variant = 'slate', className = '' }) {
  return (
    <View className={`self-start px-2.5 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      <Text className={`text-xs font-medium ${textVariants[variant]}`}>{children}</Text>
    </View>
  )
}