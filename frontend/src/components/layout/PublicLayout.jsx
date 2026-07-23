import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white !text-slate-900 dark:!bg-slate-800 dark:!text-white',
        }}
      />
    </div>
  )
}