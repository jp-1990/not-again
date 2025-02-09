import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function Stage() {
  return (
    <ThemedView style={styles.view}>
      <ThemedView style={styles.header} colorName="stageHeader">
        <ThemedText>degenerate corpus luteum</ThemedText>
      </ThemedView>
      <ThemedView
        style={styles.content}
        colorName="stageBackground"
      ></ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: { width: 120, height: 148, borderRadius: 4, overflow: "hidden" },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  content: { height: 100 },
});
