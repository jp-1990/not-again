import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Next() {
  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    "addIcon",
  );
  const iconBackground = useThemeColor(
    { light: undefined, dark: undefined },
    "addBackground",
  );

  const rippleScale = useSharedValue(1);
  const [rippleVisible, setRippleVisible] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleVisible ? 0.3 : 0,
  }));

  function handlePressIn() {
    setRippleVisible(true);
    rippleScale.value = withTiming(1.5, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }

  function handlePressOut() {
    rippleScale.value = withTiming(
      1,
      { duration: 300, easing: Easing.in(Easing.ease) },
      () => runOnJS(setRippleVisible)(false),
    );
  }

  return (
    <ThemedView style={styles.view}>
      <ThemedView style={[{ borderColor: iconBackground }, styles.content]}>
        <ThemedView style={styles.header} colorName="nextHeader">
          <ThemedText>NEXT PERIOD: Tue Sept 26 2022</ThemedText>
        </ThemedView>
        <ThemedView style={styles.text} colorName="nextBackground">
          <View style={styles.textNumberContainer}>
            <ThemedText style={styles.textNumber}>7</ThemedText>
            <View style={styles.textNumberTextContainer}>
              <ThemedText style={styles.textNumberText}>Days</ThemedText>
              <ThemedText style={styles.textNumberText}>Away</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ThemedView>

      <Link
        asChild
        href="/modal"
        style={[
          { borderColor: iconColor, backgroundColor: iconBackground },
          styles.button,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{
            color: "rgba(255,255,255,0.3)",
            borderless: false,
          }}
        >
          <View>
            {Platform.OS === "ios" && (
              <Animated.View style={[styles.ripple, animatedStyle]} />
            )}
            <View>
              <IconSymbol name="add" size={96} color={iconColor} />
            </View>
          </View>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },

  header: {
    display: "flex",
    height: 36,
    overflow: "hidden",
    justifyContent: "center",
    paddingLeft: 8,
  },
  text: {
    flex: 1,
    paddingLeft: 8,
    marginTop: -8,
    overflow: "hidden",
    flexDirection: "column",
  },

  textNumberContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  textNumber: {
    alignItems: "center",
    justifyContent: "center",
    fontSize: 48,
    lineHeight: 48 * 1.3,
    marginRight: 8,
  },
  textNumberTextContainer: {
    flexDirection: "column",
  },
  textNumberText: {
    fontSize: 16,
    lineHeight: 16 * 1.3,
  },

  button: {
    width: 96,
    height: 96,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  ripple: {
    position: "absolute",
    width: 96,
    height: 96,
    backgroundColor: "white",
    borderRadius: 50,
  },
});
