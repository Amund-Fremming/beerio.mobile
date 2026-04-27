import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { RootStackParamList } from '../../App'
import ErrorBanner from '../components/ErrorBanner'
import { useI18n } from '../i18n'
import { api, isApiError } from '../services/api'
import { colors } from '../theme'

type Props = NativeStackScreenProps<RootStackParamList, 'JoinRoom'>

export default function JoinRoomScreen({ navigation }: Props) {
  const { t } = useI18n()
  const [roomId, setRoomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const id = roomId.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      await api.getRoom(id)
      navigation.replace('Username', { roomId: id })
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        setError(`"${id}" ${t.roomNotFoundShort}`)
      } else if (isApiError(err)) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError(t.serverDown)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
        <Text style={styles.backText}>{t.back}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t.roomId}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.roomIdPlaceholder}
            placeholderTextColor={colors.textDim}
            value={roomId}
            onChangeText={setRoomId}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>

        {error && <ErrorBanner message={error} />}

        <TouchableOpacity
          style={[styles.btnPrimary, (loading || !roomId.trim()) && { opacity: 0.35 }]}
          onPress={handleSubmit}
          disabled={loading || !roomId.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#040408" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>{t.joinRoom}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 60,
    gap: 14,
  },
  backLink: { alignSelf: 'flex-start' },
  backText: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 22,
    gap: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.neonB,
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    padding: 14,
  },
  btnPrimary: {
    backgroundColor: colors.neonY,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#040408', fontWeight: '800', fontSize: 16 },
})
