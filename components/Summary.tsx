import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  listenCreate,
  SQLEntry,
  useDatabaseContext,
} from "@/providers/database";
import React from "react";
import { getDaysBetweenDates } from "@/utils/date";

export default function Summary() {
  const db = useDatabaseContext();
  const [updated, setUpdated] = React.useState(false);
  const [data, setData] = React.useState([
    {
      label: "Last recorded period:",
      value: "",
    },
    {
      label: "Current day of cycle:",
      value: "",
    },
    { label: "Current cycle phase:", value: "" },
    { label: "Average cycle duration:", value: "" },
    {
      label: "Last estimated ovulation:",
      value: "",
    },
    {
      label: "Next estimated ovulation:",
      value: "",
    },
    { label: "Cycle Standard Deviation:", value: "" },
  ]);

  const light = useThemeColor(
    { light: undefined, dark: undefined },
    "summaryLightStripe",
  );
  const dark = useThemeColor(
    { light: undefined, dark: undefined },
    "summaryDarkStripe",
  );
  const border = useThemeColor(
    { light: undefined, dark: undefined },
    "summaryBorder",
  );

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
      const [entry, avgCycle, stddev] = await Promise.all([
        db.getFirstAsync<SQLEntry>(
          "SELECT * FROM entries ORDER BY date DESC LIMIT 1",
        ),
        db.getFirstAsync<{ avgCycle: number }>(
          "SELECT AVG(cycle) AS avgCycle FROM entries",
        ),
        db.getFirstAsync<{ stddev: number }>(
          "SELECT AVG(cycle * cycle) - AVG(cycle) * AVG(cycle) AS stddev FROM entries",
        ),
      ]);

      if (!entry || !avgCycle || !stddev) {
        setData([
          {
            label: "Last recorded period:",
            value: "",
          },
          { label: "Average cycle duration:", value: "" },
          {
            label: "Current day of cycle:",
            value: "",
          },
          { label: "Estimated cycle phase:", value: "" },
          // {
          //   label: "Last estimated ovulation:",
          //   value: "",
          // },
          // {
          //   label: "Next estimated ovulation:",
          //   value: "",
          // },
          { label: "Cycle Standard Deviation:", value: "" },
        ]);
        return;
      }

      // const prevOv = new Date(entry.date);
      // prevOv.setDate(prevOv.getDate() - (entry.cycle ?? 28) / 2);
      //
      // const nextOv = new Date(entry.date);
      // nextOv.setDate(nextOv.getDate() + (entry.cycle ?? 28) / 2);

      const currentDayOfCycle = getDaysBetweenDates(
        new Date(),
        new Date(entry.date),
      );

      let phase = "Follicular";
      if (currentDayOfCycle === 14) phase = "Ovulation";
      if (currentDayOfCycle > 14) phase = "Luteal";

      setData([
        {
          label: "Last recorded period:",
          value: `${new Date(entry.date).toDateString()} (${currentDayOfCycle} day${currentDayOfCycle === 1 ? "" : "s"} ago)`,
        },
        {
          label: "Average cycle duration:",
          value: `${Math.ceil(avgCycle.avgCycle) ? `${Math.ceil(avgCycle.avgCycle)} day${avgCycle.avgCycle === 1 ? "" : "s"}` : "-"}`,
        },
        {
          label: "Current day of cycle:",
          value: `Day ${currentDayOfCycle}`,
        },
        { label: "Estimated cycle phase:", value: phase },
        // {
        //   // todo: abs value is messing this up
        //   label: "Last estimated ovulation:",
        //   value: `${prevOv.toDateString()} (${getDaysBetweenDates(new Date(), prevOv)} day${getDaysBetweenDates(new Date(), prevOv) === 1 ? "" : "s"} ago)`,
        // },
        // {
        //   // todo: abs value is messing this up
        //   label: "Next estimated ovulation:",
        //   value: `${nextOv.toDateString()} (${getDaysBetweenDates(new Date(), nextOv)} day${getDaysBetweenDates(new Date(), nextOv) === 1 ? "" : "s"} away)`,
        // },
        {
          label: "Cycle Standard Deviation:",
          value: `${Math.sqrt(stddev.stddev).toFixed(2) !== "0.00" ? `${Math.sqrt(stddev.stddev).toFixed(2)}` : "-"}`,
        },
      ]);
    }

    getEntries();
  }, [updated]);

  return (
    <ThemedView style={styles.view}>
      <ThemedView style={[{ borderColor: border }, styles.content]}>
        {data.map((d, i) => {
          return (
            <ThemedView
              key={d.label}
              style={[
                { backgroundColor: i % 2 === 0 ? dark : light },
                styles.row,
              ]}
            >
              <ThemedText style={styles.rowText}>{d.label}</ThemedText>
              <ThemedText style={styles.rowText}>{d.value}</ThemedText>
            </ThemedView>
          );
        })}
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
    display: "flex",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  row: { flexDirection: "row", paddingHorizontal: 4, gap: 16 },
  rowText: {
    fontSize: 14,
    lineHeight: 14 * 1.6,
  },
});
