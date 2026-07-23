const variants = {
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red:   'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  blue:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

export default function Badge({ children, variant = 'slate', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}