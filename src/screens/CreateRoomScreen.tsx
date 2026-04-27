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
import GridBackground from "../components/GridBackground";
import { useI18n } from "../i18n";
import { api, isApiError } from "../services/api";
import { colors } from "../theme";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "../utils/scaling";

const UNIT_SIZES = [0.33, 0.5] as const;

type Props = NativeStackScreenProps<RootStackParamList, "CreateRoom">;

export default function CreateRoomScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [unitSize, setUnitSize] = useState<0.33 | 0.5>(0.33);
  const [unitGoal, setUnitGoal] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const goal = parseFloat(unitGoal);
    if (isNaN(goal) || goal <= 0) {
      setError(t.positiveGoal);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { room_id } = await api.createRoom(unitSize, goal);
      navigation.replace("Username", { roomId: room_id });
    } catch (err) {
      if (isApiError(err)) {
        setError(`${t.failedCreateRoom} (${err.status}): ${err.message}`);
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
      <GridBackground />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backLink}
      >
        <Text style={styles.backText}>{t.back}</Text>
      </TouchableOpacity>

      <View style={[styles.card, styles.headerCard]}>
        <Text style={styles.title}>⚡ {t.create}</Text>
        <Text style={styles.sub}>{t.createDesc}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t.unitSize}</Text>
          <View style={styles.segmented}>
            {UNIT_SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.segBtn, unitSize === s && styles.segBtnActive]}
                onPress={() => setUnitSize(s)}
              >
                <Text
                  style={[
                    styles.segBtnText,
                    unitSize === s && styles.segBtnTextActive,
                  ]}
                >
                  🍺 {s}L
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t.unitGoal}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.unitGoalPlaceholder}
            placeholderTextColor={colors.textDim}
            value={unitGoal}
            onChangeText={setUnitGoal}
            keyboardType="decimal-pad"
          />
          <Text style={styles.hint}>{t.unitGoalHint}</Text>
        </View>

        {error && <ErrorBanner message={error} />}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.35 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#040408" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>{t.createRoom}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#04040a",
    padding: horizontalScale(20),
    paddingTop: verticalScale(80),
    gap: verticalScale(14),
  },
  backLink: { alignSelf: "flex-start", paddingVertical: verticalScale(4) },
  backText: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  sub: { fontSize: moderateScale(13), color: colors.textMuted },
  headerCard: {
    height: verticalScale(110),
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(24),
    padding: moderateScale(22),
    gap: verticalScale(20),
  },
  field: { gap: verticalScale(8) },
  fieldLabel: {
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.neonB,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(16),
    padding: moderateScale(4),
    gap: horizontalScale(4),
  },
  segBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
  },
  segBtnActive: {
    backgroundColor: colors.neonY,
  },
  segBtnText: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  segBtnTextActive: { color: "#040408" },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(16),
    color: colors.text,
    fontSize: moderateScale(16),
    fontWeight: "600",
    padding: moderateScale(14),
  },
  hint: { fontSize: moderateScale(12), color: colors.textMuted },
  btnPrimary: {
    backgroundColor: colors.neonY,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#040408",
    fontWeight: "800",
    fontSize: moderateScale(16),
  },
});
