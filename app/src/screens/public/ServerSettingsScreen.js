import { useEffect, useState } from 'react'
import { View, Text, TextInput, Switch, StyleSheet, Alert, ScrollView } from 'react-native'
import { getServerConfig, setServerConfig, resetServerConfig, DEFAULT_HOST } from '@/config/server'
import { resetEcho } from '@/lib/echo'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ServerSettingsScreen({ navigation }) {
  const [host, setHost] = useState('')
  const [apiPort, setApiPort] = useState('')
  const [reverbPort, setReverbPort] = useState('')
  const [useHttps, setUseHttps] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServerConfig().then((cfg) => {
      setHost(cfg.host)
      setApiPort(String(cfg.apiPort))
      setReverbPort(String(cfg.reverbPort))
      setUseHttps(cfg.useHttps)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!host.trim()) {
      Alert.alert('Server address is required')
      return
    }

    await setServerConfig({
      host: host.trim(),
      apiPort: Number(apiPort) || 8000,
      reverbPort: Number(reverbPort) || 8080,
      useHttps,
    })
    resetEcho()

    Alert.alert('Saved', 'Server address updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ])
  }

  const handleReset = async () => {
    const cfg = await resetServerConfig()
    setHost(cfg.host)
    setApiPort(String(cfg.apiPort))
    setReverbPort(String(cfg.reverbPort))
    setUseHttps(cfg.useHttps)
    resetEcho()
  }

  if (loading) return null

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Server Settings</Text>
        <Text style={styles.subtitle}>
          Point the app at your Laravel/nginx server on the local network.
        </Text>

        <Text style={styles.label}>Server IP / hostname</Text>
        <TextInput
          style={styles.input}
          value={host}
          onChangeText={setHost}
          placeholder={DEFAULT_HOST}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.row}>
          <Text style={styles.label}>Use HTTPS (via nginx)</Text>
          <Switch value={useHttps} onValueChange={setUseHttps} />
        </View>

        {!useHttps && (
          <>
            <Text style={styles.label}>API port (Laravel)</Text>
            <TextInput
              style={styles.input}
              value={apiPort}
              onChangeText={setApiPort}
              keyboardType="number-pad"
            />
          </>
        )}

        <Text style={styles.label}>Reverb (websocket) port</Text>
        <TextInput
          style={styles.input}
          value={reverbPort}
          onChangeText={setReverbPort}
          keyboardType="number-pad"
        />

        <Button title="Save" onPress={handleSave} style={{ marginTop: 16 }} />
        <Button title="Reset to default" onPress={handleReset} variant="secondary" style={{ marginTop: 8 }} />
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  card: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
})