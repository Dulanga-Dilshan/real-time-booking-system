import { View, Text } from 'react-native'
import { Picker } from '@react-native-picker/picker'

export default function Select({ label, error, children, selectedValue, onValueChange, className = '' }) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Text>
      )}
      <View className={`border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${className}`}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          {children}
        </Picker>
      </View>
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  )
}

Select.Item = Picker.Item