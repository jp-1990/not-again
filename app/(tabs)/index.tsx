import { StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Constants from "expo-constants";
import Next from "@/components/Nextv2";
import Recent from "@/components/Recent";
import Summary from "@/components/Summary";
import Chart from "@/components/Chart";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.view}>
      <ThemedView style={styles.header} colorName="header" />
      <ThemedView style={styles.title}>
        <ThemedText style={styles.titleText} colorName="titleA">
          not
        </ThemedText>
        <ThemedText style={styles.titleText} colorName="titleB">
          {" "}
          again
        </ThemedText>
        <ThemedText style={styles.titleText} colorName="titleC">
          {" "}
          ...
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.nextContainer}>
        <Next />
      </ThemedView>
      <ThemedView style={styles.recentContainer}>
        <Recent />
      </ThemedView>
      <ThemedView style={styles.summaryContainer}>
        <Summary />
      </ThemedView>
      <ThemedView style={styles.chartContainer}>
        <Chart />
      </ThemedView>
      <View style={styles.spacer} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: {
    display: "flex",
    flex: 1,
  },
  header: {
    height: Constants.statusBarHeight,
    width: "100%",
  },
  title: {
    marginLeft: 8,
    marginTop: 8,
    flexDirection: "row",
  },
  titleText: {
    fontSize: 42,
    lineHeight: 42 * 1.2,
    fontWeight: 900,
  },
  nextContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  recentContainer: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  summaryContainer: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  chartContainer: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    height: Constants.statusBarHeight,
    width: "100%",
  },
});
