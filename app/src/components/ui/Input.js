import { View, Text, TextInput } from 'react-native'

export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#94a3b8"
        className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <Text className="text-xs text-slate-400">{hint}</Text>}
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  )
}