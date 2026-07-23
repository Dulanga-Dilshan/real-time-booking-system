const variants = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
  error:   'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  info:    'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
}

export default function Alert({ children, variant = 'info', className = '' }) {
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}