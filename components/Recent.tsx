import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {
  listenCreate,
  SQLEntries,
  SQLEntry,
  useDatabaseContext,
} from "@/providers/database";

export default function Recent() {
  const db = useDatabaseContext();
  const [updated, setUpdated] = React.useState(false);
  const [entries, setEntries] = React.useState<SQLEntries>([]);

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
        "SELECT date, cycle FROM entries ORDER BY date DESC LIMIT 8",
      );
      setEntries(data);
    }

    getEntries();
  }, [updated]);

  const data = entries.map((e) => {
    return {
      date: new Date(e.date).toLocaleDateString(),
      cycle: e.cycle,
    };
  });

  const left = data.slice(0, Math.ceil(data.length / 2));
  const right = data.slice(Math.ceil(data.length / 2));

  return (
    <ThemedView style={styles.view}>
      <ThemedView style={styles.header} colorName="recentHeader">
        <ThemedText>MOST RECENT</ThemedText>
      </ThemedView>
      <ThemedView style={styles.content} colorName="recentBackground">
        <View style={styles.contentInner}>
          {left.map((d) => {
            return (
              <View key={d.date} style={styles.contentTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.contentText}>
                  {d.date}
                </ThemedText>
                <ThemedText
                  style={styles.contentText}
                >{`${d.cycle ? `${d.cycle} day cycle` : "-"}`}</ThemedText>
              </View>
            );
          })}
        </View>
        <View style={styles.contentInner}>
          {right.map((d) => {
            return (
              <View key={d.date} style={styles.contentTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.contentText}>
                  {d.date}
                </ThemedText>
                <ThemedText
                  style={styles.contentText}
                >{`${d.cycle ? `${d.cycle} day cycle` : "-"}`}</ThemedText>
              </View>
            );
          })}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: { borderRadius: 4, overflow: "hidden" },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contentInner: {},
  contentTextContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 14 * 1.4,
  },
});
