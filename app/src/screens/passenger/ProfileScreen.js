import { View, Text } from 'react-native'

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <Text className="text-lg font-semibold text-slate-700 dark:text-slate-200">Booking</Text>
      <Text className="text-sm text-slate-400 mt-2">Coming next</Text>
    </View>
  )
}