import { Modal as RNModal, View, Text, Pressable } from 'react-native'

export default function Modal({ open, onClose, title, children }) {
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center p-4" onPress={onClose}>
        <Pressable className="bg-white dark:bg-slate-900 rounded-2xl w-full max-h-[90%]" onPress={(e) => e.stopPropagation()}>
          {title && (
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <Text className="text-base font-semibold text-slate-800 dark:text-white">{title}</Text>
              <Pressable onPress={onClose}>
                <Text className="text-slate-400 text-lg">✕</Text>
              </Pressable>
            </View>
          )}
          <View className="p-6">{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}