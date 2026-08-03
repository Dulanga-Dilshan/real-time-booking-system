import { useState } from 'react'
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { login, register } from '@/api/auth'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import toast from '@/lib/toast'

export default function AuthScreen({ navigation }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
  })

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await login(loginForm)
      await setAuth(res.data.user, res.data.token)
      toast.success('Welcome back!')
    } catch (err) {
      console.log('LOGIN ERROR:', JSON.stringify({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      }, null, 2))
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await register(regForm)
      await setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(
        errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message ?? 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
        <View className="mb-6 items-center">
          <Text className="text-2xl font-bold text-slate-800 dark:text-white">Welcome</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to book your bus</Text>
        </View>

        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <View className="flex-row border-b border-slate-200 dark:border-slate-800">
            {['login', 'register'].map((t2) => (
              <Pressable
                key={t2}
                onPress={() => { setTab(t2); setError(null) }}
                className={`flex-1 py-3.5 items-center border-b-2 ${
                  tab === t2 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent'
                }`}
              >
                <Text className={`text-sm font-medium ${tab === t2 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {t2 === 'login' ? 'Log in' : 'Register'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="p-6 gap-4">
            {error && <Alert variant="error">{error}</Alert>}

            {tab === 'login' ? (
              <>
                <Input
                  label="Email"
                  value={loginForm.email}
                  onChangeText={(v) => setLoginForm((p) => ({ ...p, email: v }))}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  value={loginForm.password}
                  onChangeText={(v) => setLoginForm((p) => ({ ...p, password: v }))}
                  secureTextEntry
                  autoComplete="current-password"
                />
                <Button title="Log in" size="lg" loading={loading} onPress={handleLogin} />
              </>
            ) : (
              <>
                <Input
                  label="Name"
                  value={regForm.name}
                  onChangeText={(v) => setRegForm((p) => ({ ...p, name: v }))}
                />
                <Input
                  label="Email"
                  value={regForm.email}
                  onChangeText={(v) => setRegForm((p) => ({ ...p, email: v }))}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Input
                  label="Password"
                  value={regForm.password}
                  onChangeText={(v) => setRegForm((p) => ({ ...p, password: v }))}
                  secureTextEntry
                />
                <Input
                  label="Confirm password"
                  value={regForm.password_confirmation}
                  onChangeText={(v) => setRegForm((p) => ({ ...p, password_confirmation: v }))}
                  secureTextEntry
                />
                <Button title="Create account" size="lg" loading={loading} onPress={handleRegister} />
              </>
            )}
          </View>
        </View>

        <Pressable className="mt-6 items-center" onPress={() => navigation.navigate('ServerSettings')}>
          <Text className="text-xs text-slate-400">Server Settings</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}