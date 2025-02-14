import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const tint = useThemeColor({ light: undefined, dark: undefined }, "tint");
  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    "tabBarBackground",
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
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
          tabBarLabel: ({ focused }) => {
            const colorName = focused ? "tabIconSelected" : "tabIconDefault";
            return (
              <ThemedText colorName={colorName} type="xs">
                Home
              </ThemedText>
            );
          },
          tabBarIcon: ({ focused }) => {
            const iconColor = useThemeColor(
              { light: undefined, dark: undefined },
              focused ? "tabIconSelected" : "tabIconDefault",
            );

            return <IconSymbol size={28} name="house.fill" color={iconColor} />;
          },
          tabBarStyle: {
            backgroundColor,
            borderTopWidth: 1,
            borderColor: backgroundColor,
          },
        }}
      />
      <Tabs.Screen
        name="Data"
        options={{
          title: "Data",
          tabBarLabel: ({ focused }) => {
            const colorName = focused ? "tabIconSelected" : "tabIconDefault";
            return (
              <ThemedText colorName={colorName} type="xs">
                Data
              </ThemedText>
            );
          },
          tabBarIcon: ({ focused }) => {
            const iconColor = useThemeColor(
              { light: undefined, dark: undefined },
              focused ? "tabIconSelected" : "tabIconDefault",
            );

            return <IconSymbol size={24} name="file" color={iconColor} />;
          },
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
