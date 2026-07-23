export default function Card({ children, className = '', dark = false, ...props }) {
  if (dark) {
    return (
      <div className={`bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-2xl ${className}`} {...props}>
        {children}
      </div>
    )
  }
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}