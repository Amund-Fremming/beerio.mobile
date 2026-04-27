import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GridBackground from "../components/GridBackground";
import type { RootStackParamList } from "../../App";
import { useI18n } from "../i18n";
import { colors } from "../theme";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "../utils/scaling";

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
      <GridBackground />
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
    backgroundColor: "#04040a",
    alignItems: "center",
    justifyContent: "center",
    padding: horizontalScale(20),
    gap: verticalScale(14),
  },
  wordmark: { alignItems: "center", marginBottom: verticalScale(4) },
  wordmarkText: {
    fontSize: moderateScale(56),
    fontWeight: "900",
    color: colors.neonY,
    letterSpacing: -2,
  },
  wordmarkSub: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    letterSpacing: 3,
    color: colors.textMuted,
    marginTop: verticalScale(4),
  },
  grid: {
    flexDirection: "row",
    gap: horizontalScale(12),
    width: "100%",
    marginTop: verticalScale(8),
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: moderateScale(24),
    padding: moderateScale(28),
    alignItems: "center",
    gap: verticalScale(10),
  },
  createCard: {
    borderColor: "rgba(57,255,20,0.2)",
  },
  joinCard: {
    borderColor: "rgba(0,240,255,0.2)",
  },
  icon: { fontSize: moderateScale(40) },
  label: { fontSize: moderateScale(18), fontWeight: "900" },
  desc: {
    fontSize: moderateScale(12),
    color: colors.textMuted,
    textAlign: "center",
  },
  footer: {
    fontSize: moderateScale(11),
    color: colors.textDim,
    textAlign: "center",
    marginTop: verticalScale(8),
  },
  flagBtn: {
    position: "absolute",
    top: verticalScale(72),
    right: horizontalScale(20),
    zIndex: 10,
  },
});
