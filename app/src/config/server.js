import AsyncStorage from '@react-native-async-storage/async-storage'

// EDIT THIS when your Laravel/nginx server's local IP changes.
export const DEFAULT_HOST = '192.168.8.101'

// Laravel is served directly (no nginx SSL) for local dev.
export const DEFAULT_USE_HTTPS = false

export const DEFAULT_API_PORT = 8000
export const DEFAULT_API_PATH = '/api/v1'
export const DEFAULT_REVERB_PORT = 8080
export const DEFAULT_REVERB_APP_KEY = 'ermkkqviogptdnurqg5c'

const STORAGE_KEY = 'busbook_server_config'

let cache = null

export async function getServerConfig() {
  if (cache) return cache

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) {
      cache = JSON.parse(raw)
      return cache
    }
  } catch (e) {
    // fall through to defaults
  }

  cache = {
    host: DEFAULT_HOST,
    useHttps: DEFAULT_USE_HTTPS,
    apiPort: DEFAULT_API_PORT,
    apiPath: DEFAULT_API_PATH,
    reverbPort: DEFAULT_REVERB_PORT,
    reverbAppKey: DEFAULT_REVERB_APP_KEY,
  }
  return cache
}

export async function setServerConfig(partial) {
  const current = await getServerConfig()
  const next = { ...current, ...partial }
  cache = next
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export async function resetServerConfig() {
  cache = null
  await AsyncStorage.removeItem(STORAGE_KEY)
  return getServerConfig()
}

export async function getApiBaseUrl() {
  const cfg = await getServerConfig()
  const scheme = cfg.useHttps ? 'https' : 'http'
  const port = cfg.useHttps ? '' : `:${cfg.apiPort}`
  return `${scheme}://${cfg.host}${port}${cfg.apiPath}`
}

export async function getReverbConfig() {
  const cfg = await getServerConfig()
  return {
    key: cfg.reverbAppKey,
    wsHost: cfg.host,
    wsPort: cfg.reverbPort,
    wssPort: cfg.reverbPort,
    forceTLS: cfg.useHttps,
    enabledTransports: cfg.useHttps ? ['ws', 'wss'] : ['ws'],
  }
}