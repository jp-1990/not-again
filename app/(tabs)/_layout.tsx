import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    "tabIconSelected",
  );
  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    "tabBarBackground",
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: () => {
            return (
              <ThemedText colorName="tabIconSelected" type="xs">
                Home
              </ThemedText>
            );
          },
          tabBarIcon: () => (
            <IconSymbol size={28} name="house.fill" color={iconColor} />
          ),
          tabBarStyle: {
            backgroundColor,
            borderTopWidth: 1,
            borderColor: backgroundColor,
          },
        }}
      />
    </Tabs>
  );
}
