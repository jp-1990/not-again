import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import DatabaseProvider, { useDatabaseContext } from "@/providers/database";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const headerColor = useThemeColor(
    { light: undefined, dark: undefined },
    "header",
  );

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <DatabaseProvider>
      <DrizzleStudio />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="AddData"
            options={{
              title: "Add a Date",
              presentation: "transparentModal",
              headerStyle: {
                backgroundColor: headerColor,
              },
            }}
          />
          <Stack.Screen
            name="DataManagement"
            options={{
              title: "Data Management",
              presentation: "transparentModal",
              headerStyle: {
                backgroundColor: headerColor,
              },
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DatabaseProvider>
  );
}

function DrizzleStudio() {
  const db = useDatabaseContext();
  useDrizzleStudio(db);
  return null;
}
