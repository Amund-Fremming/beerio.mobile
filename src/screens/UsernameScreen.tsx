import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import ErrorBanner from "../components/ErrorBanner";
import { useI18n } from "../i18n";
import { api, isApiError } from "../services/api";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Username">;

export default function UsernameScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const name = username.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      await api.joinRoom(roomId, name);
      await AsyncStorage.setItem(`beerio_username_${roomId}`, name);
      await AsyncStorage.setItem("beerio_active_room", roomId);
      navigation.replace("Room", { roomId });
    } catch (err) {
      if (isApiError(err) && err.status === 400) {
        setError(t.nameTaken);
      } else if (isApiError(err) && err.status === 404) {
        setError(t.roomNotFound);
      } else if (isApiError(err)) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError(t.serverDown);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backLink}
      >
        <Text style={styles.backText}>{t.back}</Text>
      </TouchableOpacity>

      <View style={[styles.card, styles.headerCard]}>
        <Text style={styles.title}>{t.whatsYourName}</Text>
        <Text style={styles.sub}>
          {t.joiningRoom}{" "}
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            {roomId}
          </Text>
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t.yourName}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.namePlaceholder}
            placeholderTextColor={colors.textDim}
            value={username}
            onChangeText={setUsername}
            autoFocus
            maxLength={32}
          />
        </View>

        {error && <ErrorBanner message={error} />}

        <TouchableOpacity
          style={[
            styles.btnPrimary,
            (loading || !username.trim()) && { opacity: 0.35 },
          ]}
          onPress={handleSubmit}
          disabled={loading || !username.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#040408" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>{t.letsDrink}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 80,
    gap: 14,
  },
  backLink: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerCard: {
    height: 110,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 22,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 13, color: colors.textMuted },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
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
    fontWeight: "600",
    padding: 14,
  },
  btnPrimary: {
    backgroundColor: colors.neonY,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: { color: "#040408", fontWeight: "800", fontSize: 16 },
});
