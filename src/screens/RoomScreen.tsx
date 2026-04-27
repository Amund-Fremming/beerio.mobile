import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import ErrorBanner from "../components/ErrorBanner";
import GridBackground from "../components/GridBackground";
import { useI18n } from "../i18n";
import { api, isApiError, type RoomState } from "../services/api";
import { colors } from "../theme";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "../utils/scaling";

function avatarEmoji(name: string) {
  const emojis = [
    "🐻",
    "🦊",
    "🐺",
    "🦁",
    "🐯",
    "🐸",
    "🦄",
    "🐼",
    "🦋",
    "🐙",
    "🦈",
    "🐊",
    "🦩",
    "🦧",
    "🐘",
    "🦬",
    "🦎",
    "🐫",
    "🦥",
    "🦦",
    "🐳",
    "🦜",
    "🐝",
    "🐨",
    "🦔",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return emojis[Math.abs(hash) % emojis.length];
}

function formatScore(score: number, unitSize: number) {
  const litres = score * unitSize;
  return `${score.toFixed(2)} units · ${litres.toFixed(2)}L`;
}

type Props = NativeStackScreenProps<RootStackParamList, "Room">;

export default function RoomScreen({ navigation, route }: Props) {
  const { roomId } = route.params;

  const { t } = useI18n();
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drinkSize, setDrinkSize] = useState<0.33 | 0.5>(0.33);
  const [pendingDrink, setPendingDrink] = useState<string | null>(null);
  const [pendingUndrink, setPendingUndrink] = useState<string | null>(null);
  const [drinkError, setDrinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(`beerio_username_${roomId}`).then((name) => {
      if (!name) {
        navigation.replace("Username", { roomId });
      } else {
        setMyUsername(name);
        AsyncStorage.setItem("beerio_active_room", roomId);
      }
    });
  }, [roomId, navigation]);

  const fetchRoom = useCallback(async () => {
    try {
      const data = await api.getRoom(roomId);
      setRoom(data);
      setLoadError(null);
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        setLoadError(t.roomNotFound);
      } else {
        setLoadError(t.lostConnection);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (!myUsername) return;
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom, myUsername]);

  async function handleDrink(username: string) {
    if (pendingDrink) return;
    setPendingDrink(username);
    setDrinkError(null);
    try {
      const updated = await api.drink(roomId, username, drinkSize);
      setRoom(updated);
    } catch (err) {
      if (isApiError(err)) {
        setDrinkError(`${t.failedDrink} (${err.status}): ${err.message}`);
      } else {
        setDrinkError(t.failedDrink);
      }
    } finally {
      setPendingDrink(null);
    }
  }

  async function handleUndrink(username: string) {
    if (pendingUndrink) return;
    const player = room?.players.find((p) => p.username === username);
    if (!player || player.score <= 0) return;
    setPendingUndrink(username);
    setDrinkError(null);
    try {
      const updated = await api.undrink(roomId, username, drinkSize);
      setRoom(updated);
    } catch (err) {
      if (isApiError(err)) {
        setDrinkError(`${t.failedUndrink} (${err.status}): ${err.message}`);
      } else {
        setDrinkError(t.failedUndrink);
      }
    } finally {
      setPendingUndrink(null);
    }
  }

  async function handleShare() {
    const url = `beerio://room/${roomId}/join`;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Share.share({ message: `Join my Beerio room! ${url}` });
  }

  async function handleLeave() {
    await AsyncStorage.removeItem("beerio_active_room");
    navigation.replace("Home");
  }

  if (!myUsername) return null;

  if (!room && !loadError) {
    return (
      <View style={[styles.screen, { justifyContent: "center" }]}>
        <GridBackground />
        <ActivityIndicator color={colors.neonY} size="large" />
      </View>
    );
  }

  const topScore = room ? Math.max(...room.players.map((p) => p.score), 0) : 0;

  return (
    <View style={styles.screen}>
      <GridBackground />
      {/* Leave modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLeaveModal(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t.leaveRoom}</Text>
            <Text style={styles.modalDesc}>{t.leaveDesc}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={styles.btnGhostText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={handleLeave}>
                <Text style={styles.btnDangerText}>{t.leaveBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.topbar}>
        <View style={styles.codeDisplay}>
          <Text style={styles.codePrefix}>{t.room}</Text>
          <Text style={styles.codeValue}>{roomId}</Text>
        </View>
        <View style={styles.topbarActions}>
          <TouchableOpacity
            style={[styles.sharePill, copied && styles.sharePillCopied]}
            onPress={handleShare}
          >
            <Text
              style={[styles.sharePillText, copied && { color: colors.neonG }]}
            >
              {copied ? t.copied : t.share}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.leavePill}
            onPress={() => setShowLeaveModal(true)}
          >
            <Text style={styles.leavePillText}>{t.leave}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loadError && <ErrorBanner message={loadError} />}

      {/* Progress */}
      {room && (
        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{t.goalProgress}</Text>
            <Text style={styles.progressLabel}>
              {topScore.toFixed(2)} / {room.unit_goal} {t.units}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((topScore / room.unit_goal) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Drink size toggle */}
      <View style={styles.sizeRow}>
        <Text style={styles.sizeLabel}>{t.beerSize}</Text>
        <View style={styles.sizeToggle}>
          <TouchableOpacity onPress={() => setDrinkSize(0.33)}>
            <Text
              style={[
                styles.sizeOpt,
                drinkSize === 0.33 && styles.sizeOptActive,
              ]}
            >
              0.33L
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleTrack,
              drinkSize === 0.5 && styles.toggleTrackOn,
            ]}
            onPress={() => setDrinkSize(drinkSize === 0.33 ? 0.5 : 0.33)}
          >
            <View
              style={[
                styles.toggleThumb,
                drinkSize === 0.5 && styles.toggleThumbOn,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDrinkSize(0.5)}>
            <Text
              style={[
                styles.sizeOpt,
                drinkSize === 0.5 && styles.sizeOptActive,
              ]}
            >
              0.5L
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {drinkError && <ErrorBanner message={drinkError} />}

      {/* Player list */}
      <ScrollView
        style={styles.playersList}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
      >
        {room && room.players.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32 }}>🍺</Text>
            <Text style={styles.emptyText}>{t.noPlayers}</Text>
          </View>
        )}
        {room &&
          [...room.players]
            .sort((a, b) => b.score - a.score)
            .map((player, idx) => {
              const isMe = player.username === myUsername;
              return (
                <View
                  key={player.username}
                  style={[styles.playerRow, isMe && styles.playerRowMe]}
                >
                  {/* Left accent bar */}
                  <View
                    style={[
                      styles.playerAccent,
                      isMe && { backgroundColor: colors.neonY },
                      idx === 0 &&
                        room.players.length > 1 && {
                          backgroundColor: colors.neonG,
                        },
                    ]}
                  />

                  <View style={styles.playerAvatar}>
                    <Text style={{ fontSize: 18 }}>
                      {avatarEmoji(player.username)}
                    </Text>
                  </View>

                  <View style={styles.playerInfo}>
                    <View style={styles.playerNameRow}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {idx === 0 && room.players.length > 1 ? "👑 " : ""}
                        {player.username}
                      </Text>
                      {isMe && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>{t.you}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.playerScore}>
                      <Text style={styles.playerScoreBold}>
                        {player.score.toFixed(2)}
                      </Text>{" "}
                      {formatScore(player.score, room.unit_size)}
                    </Text>
                  </View>

                  <View style={styles.playerActions}>
                    <TouchableOpacity
                      style={styles.btnMinus}
                      disabled={
                        pendingUndrink === player.username || player.score <= 0
                      }
                      onPress={() => handleUndrink(player.username)}
                    >
                      {pendingUndrink === player.username ? (
                        <ActivityIndicator color={colors.neonR} size="small" />
                      ) : (
                        <Text style={styles.btnMinusText}>−</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnPlus}
                      disabled={pendingDrink === player.username}
                      onPress={() => handleDrink(player.username)}
                    >
                      {pendingDrink === player.username ? (
                        <ActivityIndicator color={colors.neonG} size="small" />
                      ) : (
                        <Text style={styles.btnPlusText}>+</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#04040a",
    padding: horizontalScale(16),
    paddingTop: verticalScale(78),
    gap: verticalScale(12),
  },
  // Topbar
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: horizontalScale(8),
  },
  codePrefix: {
    fontSize: moderateScale(22),
    fontWeight: "900",
    color: colors.text,
  },
  codeValue: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  topbarActions: {
    flexDirection: "row",
    gap: horizontalScale(8),
    alignItems: "center",
  },
  sharePill: {
    backgroundColor: "rgba(245, 230, 66, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(245, 230, 66, 0.22)",
    borderRadius: 99,
    paddingVertical: verticalScale(7),
    paddingHorizontal: horizontalScale(16),
  },
  sharePillCopied: {
    borderColor: "rgba(57, 255, 20, 0.4)",
    backgroundColor: "rgba(57, 255, 20, 0.08)",
  },
  sharePillText: {
    color: colors.accent,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  leavePill: {
    backgroundColor: "rgba(255, 45, 120, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 45, 120, 0.22)",
    borderRadius: 99,
    paddingVertical: verticalScale(7),
    paddingHorizontal: horizontalScale(16),
  },
  leavePillText: {
    color: colors.red,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },

  // Progress
  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    gap: verticalScale(8),
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: colors.surface2,
    borderRadius: 99,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: colors.neonG,
  },

  // Size toggle
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(2),
  },
  sizeLabel: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  sizeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
  },
  sizeOpt: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: colors.textDim,
  },
  sizeOptActive: { color: colors.neonY },
  toggleTrack: {
    width: horizontalScale(52),
    height: verticalScale(28),
    borderRadius: 99,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    padding: moderateScale(3),
  },
  toggleTrackOn: {
    backgroundColor: "rgba(245, 230, 66, 0.12)",
    borderColor: "rgba(245, 230, 66, 0.35)",
  },
  toggleThumb: {
    width: horizontalScale(20),
    height: verticalScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: colors.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: colors.neonY,
    alignSelf: "flex-end",
  },

  // Players
  playersList: { flex: 1, width: "100%" },
  emptyState: {
    alignItems: "center",
    padding: moderateScale(32),
    gap: verticalScale(10),
  },
  emptyText: { color: colors.textMuted, fontSize: moderateScale(14) },
  playerRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
    overflow: "hidden",
  },
  playerRowMe: {
    borderColor: "rgba(245, 230, 66, 0.3)",
  },
  playerAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: horizontalScale(3),
    backgroundColor: colors.border,
    borderTopLeftRadius: moderateScale(16),
    borderBottomLeftRadius: moderateScale(16),
  },
  playerAvatar: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: "center",
    justifyContent: "center",
  },
  playerInfo: { flex: 1 },
  playerNameRow: { flexDirection: "row", alignItems: "center" },
  playerName: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },
  youBadge: {
    backgroundColor: "rgba(245, 230, 66, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 230, 66, 0.2)",
    borderRadius: moderateScale(4),
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(1),
    marginLeft: horizontalScale(8),
  },
  youBadgeText: {
    fontSize: moderateScale(9),
    fontWeight: "800",
    color: colors.neonY,
    letterSpacing: 1,
  },
  playerScore: {
    fontSize: moderateScale(12),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  playerScoreBold: {
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: colors.neonG,
  },
  playerActions: { flexDirection: "row", gap: horizontalScale(8) },
  btnMinus: {
    width: horizontalScale(44),
    height: verticalScale(44),
    borderRadius: moderateScale(10),
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: "rgba(255, 45, 120, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.35,
  },
  btnMinusText: {
    color: colors.neonR,
    fontSize: moderateScale(20),
    fontWeight: "900",
  },
  btnPlus: {
    width: horizontalScale(44),
    height: verticalScale(44),
    borderRadius: moderateScale(10),
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: "rgba(57, 255, 20, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlusText: {
    color: colors.neonG,
    fontSize: moderateScale(20),
    fontWeight: "900",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(24),
  },
  modalBox: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderActive,
    borderRadius: moderateScale(24),
    padding: moderateScale(28),
    width: "100%",
    maxWidth: horizontalScale(340),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: colors.text,
    marginBottom: verticalScale(6),
  },
  modalDesc: {
    fontSize: moderateScale(13),
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  modalActions: { flexDirection: "row", gap: horizontalScale(10) },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(22),
  },
  btnGhostText: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
  btnDanger: {
    backgroundColor: "rgba(255, 45, 120, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 45, 120, 0.4)",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(22),
  },
  btnDangerText: {
    color: colors.red,
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
});
