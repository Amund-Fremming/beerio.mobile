import { StyleSheet, Text, View } from "react-native";
import { moderateScale } from "../utils/scaling";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠ {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 45, 120, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 45, 120, 0.35)",
    borderRadius: moderateScale(16),
    padding: moderateScale(13),
    width: "100%",
  },
  text: {
    color: "#ff7aaa",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
