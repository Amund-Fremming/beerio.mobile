import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { RootStackParamList } from "../../App";
import { useI18n } from "../i18n";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    AsyncStorage.getItem("beerio_active_room").then((room) => {
      if (room) navigation.replace("Room", { roomId: room });
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity
        onPress={() => setLang(lang === "en" ? "no" : "en")}
        style={styles.flagBtn}
      >
        <Text style={{ fontSize: 34 }}>{lang === "en" ? "🇳🇴" : "🇬🇧"}</Text>
      </TouchableOpacity>

      <View style={styles.wordmark}>
        <Text style={styles.wordmarkText}>🍺 beerio</Text>
        <Text style={styles.wordmarkSub}>{t.tagline}</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, styles.createCard]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CreateRoom")}
        >
          <Text style={styles.icon}>⚡</Text>
          <Text style={[styles.label, { color: colors.neonG }]}>
            {t.create}
          </Text>
          <Text style={styles.desc}>{t.createDesc}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.joinCard]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("JoinRoom")}
        >
          <Text style={styles.icon}>🔗</Text>
          <Text style={[styles.label, { color: colors.neonB }]}>{t.join}</Text>
          <Text style={styles.desc}>{t.joinDesc}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>{t.madeFor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 14,
  },
  wordmark: { alignItems: "center", marginBottom: 4 },
  wordmarkText: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.neonY,
    letterSpacing: -2,
  },
  wordmarkSub: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: colors.textMuted,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  createCard: {
    borderColor: "rgba(57,255,20,0.2)",
  },
  joinCard: {
    borderColor: "rgba(0,240,255,0.2)",
  },
  icon: { fontSize: 40 },
  label: { fontSize: 18, fontWeight: "900" },
  desc: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
  footer: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: "center",
    marginTop: 8,
  },
  flagBtn: { position: "absolute", top: 72, right: 20, zIndex: 10 },
});
