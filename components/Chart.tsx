import { StyleSheet, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFont } from "@shopify/react-native-skia";
import spaceMono from "../assets/fonts/SpaceMono-Regular.ttf";
import {
  listenCreate,
  SQLEntries,
  SQLEntry,
  useDatabaseContext,
} from "@/providers/database";
import React from "react";

export default function Chart() {
  const db = useDatabaseContext();
  const font = useFont(spaceMono, 12);
  const [updated, setUpdated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
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
      setLoading(true);
      const data = await db.getAllAsync<SQLEntry>(
        "SELECT * FROM entries WHERE cycle IS NOT NULL ORDER BY date ASC LIMIT 36",
      );
      setEntries(data);
      setLoading(false);
    }

    getEntries();
  }, [updated]);

  const border = useThemeColor(
    { light: undefined, dark: undefined },
    "chartHeader",
  );
  const line = useThemeColor(
    { light: undefined, dark: undefined },
    "chartLine",
  );

  let min = Infinity;
  let max = 0;
  for (const e of entries) {
    const value = e.cycle ?? 0;
    min = Math.min(value, min);
    max = Math.max(value, max);
  }

  const startDate = entries[0]?.date;
  const endDate = entries[entries.length - 1]?.date;

  if (!loading && !entries.length) return null;
  return (
    <ThemedView style={[{ borderColor: border }, styles.view]}>
      <ThemedView style={styles.header} colorName="chartHeader">
        {!loading && (
          <ThemedText>
            Cycle Durations ({`${new Date(startDate).toLocaleDateString()}`} -{" "}
            {`${new Date(endDate).toLocaleDateString()}`})
          </ThemedText>
        )}
      </ThemedView>
      <ThemedView style={styles.content}>
        <View style={{ height: 212 }}>
          {!loading && (
            <CartesianChart
              data={entries}
              xKey="date"
              yKeys={["cycle"]}
              yAxis={[{ font, tickCount: Math.min(max + 1 - (min - 1), 6) }]}
              xAxis={{
                tickCount: entries.length,
              }}
              domain={{ y: [min - 1, max + 1] }}
              padding={{ bottom: -4 }}
            >
              {({ points }) => (
                <Line points={points.cycle} color={line} strokeWidth={1} />
              )}
            </CartesianChart>
          )}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: { borderRadius: 4, overflow: "hidden", borderWidth: 1 },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 28,
    paddingBottom: 1,
  },
  content: { height: 212, padding: 8, paddingLeft: 4 },
});
