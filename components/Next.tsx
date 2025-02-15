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
import {
  listenCreate,
  SQLEntry,
  useDatabaseContext,
} from "@/providers/database";

export default function Next() {
  const db = useDatabaseContext();
  const [updated, setUpdated] = React.useState(false);
  const [nextDate, setNextDate] = React.useState<{
    date: Date;
    days: number;
  }>();

  React.useEffect(() => {
    const unsub = listenCreate(() => {
      setUpdated((prev) => !prev);
    });

    return () => {
      unsub();
    };
  }, []);

  React.useEffect(() => {
    async function getEntries() {
      const data = await db.getAllAsync<SQLEntry>(
        "SELECT date, cycle FROM entries ORDER BY date DESC",
      );

      if (!data.length || data.length === 1) {
        setNextDate(undefined);
        return;
      }

      let high = 28;
      let low = 28;
      let total = 0;
      let dataPoints = 0;
      for (let i = 0; i < data.length; i++) {
        const cycle = data[i].cycle ?? 0;
        if (cycle > high && cycle < high + 10) {
          high = cycle;
        }
        if (cycle < low && cycle > low - 10) {
          low = cycle;
        }

        if (cycle < high + 10 && cycle > low - 10) {
          total += cycle;
          dataPoints++;
        }
      }

      const avgCycle = Math.floor(total / dataPoints);
      const expectedDate = new Date(data[0].date);
      expectedDate.setDate(expectedDate.getDate() + avgCycle);
      expectedDate.setHours(0, 0, 0, 0);
      const now = new Date();

      const utcA = expectedDate.getTime();
      const utcB = now.setHours(0, 0, 0, 0);

      const differenceInMs = utcA - utcB;
      const expectedDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

      setNextDate({ date: expectedDate, days: expectedDays });
    }

    getEntries();
  }, [updated]);

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
          <ThemedText colorName="nextText">
            NEXT PERIOD: {nextDate?.date.toDateString() ?? "-"}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.text} colorName="nextBackground">
          <View style={styles.textNumberContainer}>
            <ThemedText colorName="nextText" style={styles.textNumber}>
              {nextDate?.days ?? "?"}
            </ThemedText>
            <View style={styles.textNumberTextContainer}>
              <ThemedText colorName="nextText" style={styles.textNumberText}>
                Days
              </ThemedText>
              <ThemedText colorName="nextText" style={styles.textNumberText}>
                Away
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ThemedView>

      <Link
        asChild
        href="/AddData"
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
