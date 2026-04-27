import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import GridBackground from "./src/components/GridBackground";
import { I18nProvider } from "./src/i18n";
import CreateRoomScreen from "./src/screens/CreateRoomScreen";
import HomeScreen from "./src/screens/HomeScreen";
import JoinRoomScreen from "./src/screens/JoinRoomScreen";
import RoomScreen from "./src/screens/RoomScreen";
import UsernameScreen from "./src/screens/UsernameScreen";

export type RootStackParamList = {
  Home: undefined;
  CreateRoom: undefined;
  JoinRoom: undefined;
  Username: { roomId: string };
  Room: { roomId: string };
};

const prefix = Linking.createURL("/");

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, "beerio://"],
  config: {
    screens: {
      Home: "",
      CreateRoom: "create",
      JoinRoom: "join",
      Username: "room/:roomId/join",
      Room: "room/:roomId",
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <I18nProvider>
      <View style={styles.root}>
        <GridBackground />
        <NavigationContainer
          linking={linking}
          theme={{
            dark: true,
            colors: {
              primary: "#f5e642",
              background: "transparent",
              card: "transparent",
              text: "#f0f0ff",
              border: "transparent",
              notification: "#f5e642",
            },
            fonts: {
              regular: { fontFamily: "System", fontWeight: "400" },
              medium: { fontFamily: "System", fontWeight: "500" },
              bold: { fontFamily: "System", fontWeight: "700" },
              heavy: { fontFamily: "System", fontWeight: "900" },
            },
          }}
        >
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#04040a" },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
            <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
            <Stack.Screen name="Username" component={UsernameScreen} />
            <Stack.Screen name="Room" component={RoomScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#04040a" },
});
