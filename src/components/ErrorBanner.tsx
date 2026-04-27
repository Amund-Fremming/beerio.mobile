import { StyleSheet, Text, View } from 'react-native'

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠ {message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 45, 120, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 120, 0.35)',
    borderRadius: 16,
    padding: 13,
    width: '100%',
  },
  text: {
    color: '#ff7aaa',
    fontSize: 14,
    fontWeight: '600',
  },
})
