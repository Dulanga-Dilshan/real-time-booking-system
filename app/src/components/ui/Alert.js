import { View, Text } from 'react-native'

const variants = {
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
  error:   'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  info:    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
}

const textVariants = {
  success: 'text-emerald-800 dark:text-emerald-300',
  error:   'text-red-700 dark:text-red-300',
  info:    'text-blue-700 dark:text-blue-300',
  warning: 'text-amber-700 dark:text-amber-300',
}

export default function Alert({ children, variant = 'info', className = '' }) {
  return (
    <View className={`border rounded-xl px-4 py-3 flex-row items-start gap-2 ${variants[variant]} ${className}`}>
      <Text className={`text-sm ${textVariants[variant]}`}>{children}</Text>
    </View>
  )
}