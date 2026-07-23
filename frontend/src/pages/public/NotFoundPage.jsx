import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="text-center py-24">
      <p className="text-8xl font-black text-slate-200 dark:text-slate-800 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('errors.not_found')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{t('errors.not_found_hint')}</p>
      <Link to="/"><Button size="lg">{t('errors.go_home')}</Button></Link>
    </div>
  )
}