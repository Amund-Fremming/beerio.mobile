import { StyleSheet } from 'react-native'
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg'

const GRID_SIZE = 32
const LINE_COLOR = 'rgba(245,230,66,0.06)'

export default function GridBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <Line x1="0" y1={GRID_SIZE} x2={GRID_SIZE} y2={GRID_SIZE} stroke={LINE_COLOR} strokeWidth={1} />
          <Line x1={GRID_SIZE} y1="0" x2={GRID_SIZE} y2={GRID_SIZE} stroke={LINE_COLOR} strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grid)" />
    </Svg>
  )
}
