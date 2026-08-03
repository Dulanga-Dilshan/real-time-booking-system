import { Pressable, Text, ActivityIndicator } from 'react-native'

const variants = {
  primary:   'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700',
  danger:    'bg-red-500 active:bg-red-600',
  ghost:     'bg-transparent active:bg-slate-100 dark:active:bg-slate-800',
  outline:   'bg-transparent border border-slate-200 active:bg-slate-50 dark:border-slate-700 dark:active:bg-slate-800',
}

const textVariants = {
  primary:   'text-white',
  secondary: 'text-slate-700 dark:text-slate-200',
  danger:    'text-white',
  ghost:     'text-slate-600 dark:text-slate-300',
  outline:   'text-slate-600 dark:text-slate-300',
}

const sizes = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3',
  xl: 'px-8 py-3.5',
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
  xl: 'text-base',
}

export default function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onPress,
  style,
}) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? '#fff' : '#334155'} />}
      <Text className={`font-medium ${textVariants[variant]} ${textSizes[size]}`}>
        {title ?? children}
      </Text>
    </Pressable>
  )
}