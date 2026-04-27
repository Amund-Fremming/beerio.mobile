import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { horizontalScale, moderateScale } from "../utils/scaling";

const GRID_SIZE = 32;
const LINE_COLOR = "rgba(245,230,66,0.03)";

export default function GridBackground() {
  const { width, height } = Dimensions.get("window");

  const lines: React.ReactElement[] = [];

  for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
    lines.push(
      <View
        key={`v${x}`}
        style={{
          position: "absolute",
          left: horizontalScale(x),
          top: 0,
          width: 1,
          height,
          backgroundColor: LINE_COLOR,
        }}
      />,
    );
  }

  for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
    lines.push(
      <View
        key={`h${y}`}
        style={{
          position: "absolute",
          top: y,
          left: 0,
          height: 1,
          width,
          backgroundColor: LINE_COLOR,
        }}
      />,
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {lines}
    </View>
  );
}
