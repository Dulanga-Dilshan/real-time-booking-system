import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login, register } from '@/api/auth'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

export default function AuthPage() {
  const { t }       = useTranslation()
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm]     = useState({
    name: '', email: '', password: '', password_confirmation: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await login(loginForm)
      setAuth(res.data.user, res.data.token)
      toast.success('Welcome back!')
      const role = res.data.user.role
      if (role === 'admin')     navigate('/admin')
      else if (role === 'bus_staff') navigate('/staff')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message ?? t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await register(regForm)
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message ?? t('common.error')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('auth.welcome')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('auth.welcome_subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {['login', 'register'].map(t2 => (
            <button
              key={t2}
              onClick={() => { setTab(t2); setError(null) }}
              className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t2
                  ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t2 === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label={t('auth.email')} type="email" value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required autoComplete="email"/>
              <Input label={t('auth.password')} type="password" value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required autoComplete="current-password"/>
              <Button type="submit" className="w-full" size="lg" loading={loading}>{t('auth.login_btn')}</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input label={t('auth.full_name')} value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} required/>
              <Input label={t('auth.email')} type="email" value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} required/>
              <Input label={t('auth.password')} type="password" value={regForm.password}
                onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} required/>
              <Input label={t('auth.confirm_password')} type="password" value={regForm.password_confirmation}
                onChange={e => setRegForm(p => ({ ...p, password_confirmation: e.target.value }))} required/>
              <Button type="submit" className="w-full" size="lg" loading={loading}>{t('auth.register_btn')}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}