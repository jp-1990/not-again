import Button from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  emitCreate,
  listenCreate,
  SQLEntries,
  SQLEntry,
  useDatabaseContext,
} from "@/providers/database";
import { MaterialIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Constants from "expo-constants";
import { Link } from "expo-router";
import React from "react";
import { View, StyleSheet, ScrollView, ToastAndroid } from "react-native";

type Index = number;

export default function Data() {
  const db = useDatabaseContext();
  const [data, setData] = React.useState<SQLEntries>([]);

  const [updated, setUpdated] = React.useState(false);
  const [selected, setSelected] = React.useState<[Index, SQLEntry][]>([]);

  React.useEffect(() => {
    const unsub = listenCreate(() => {
      setUpdated((prev) => !prev);
    });

    return () => {
      unsub();
    };
  }, []);

  React.useEffect(() => {
    async function getData() {
      const res = await db.getAllAsync<SQLEntry>(
        "SELECT id, date, notes, cycle FROM entries ORDER BY date DESC",
      );

      setData(res);
    }
    getData();
  }, [updated]);

  const tableHeader = useThemeColor(
    { light: undefined, dark: undefined },
    "tableHeader",
  );

  const tableRowDark = useThemeColor(
    { light: undefined, dark: undefined },
    "tableRowDark",
  );

  const tableRowLight = useThemeColor(
    { light: undefined, dark: undefined },
    "tableRowLight",
  );

  const primaryButtonBackground = useThemeColor(
    { light: undefined, dark: undefined },
    "primaryButtonBackground",
  );

  const primaryButtonText = useThemeColor(
    { light: undefined, dark: undefined },
    "primaryButtonText",
  );

  const checkboxColor = useThemeColor(
    { light: undefined, dark: undefined },
    "checkboxColor",
  );

  function toggleAllSelected(checked: boolean) {
    if (checked) {
      return setSelected(data.map((d, i) => [i, d]));
    }
    setSelected([]);
  }

  async function deleteSelected() {
    if (!selected.length) return;

    const selectedSorted = selected.sort((a, b) => {
      return a[0] - b[0];
    });

    // split selected items into contiguous groups by index
    let lastIndex = selectedSorted[0][0] - 1;
    let batches: [Index, SQLEntry][][] = [];
    let batchIndex = 0;
    for (let i = 0; i < selectedSorted.length; i++) {
      if (lastIndex !== selectedSorted[i][0] - 1) {
        batchIndex++;
      }
      batches[batchIndex] ??= [] as any;
      batches[batchIndex].push(selectedSorted[i]);

      lastIndex = selectedSorted[i][0];
    }

    try {
      await db.withTransactionAsync(async () => {
        for (let i = 0; i < batches.length; i++) {
          // get the id of the lowest index item in the batch
          const mostRecent = batches[i][0][1];

          // fetch the next item after that by date
          const nextEntry = await db.getFirstAsync<SQLEntry>(
            "SELECT id, date, cycle FROM entries WHERE date > ? ORDER BY date ASC LIMIT 1",
            new Date(mostRecent.date).getTime(),
          );

          if (nextEntry) {
            // add the cycle lengths of all items in the batch plus the fetched item
            let updatedCycle = nextEntry.cycle ?? 0;
            for (let j = 0; j < batches[i].length; j++) {
              updatedCycle += batches[i][j][1].cycle ?? 0;
            }

            // update the fetched item cycle
            await db.runAsync(
              "UPDATE entries SET cycle = ? WHERE id = ?",
              updatedCycle,
              nextEntry.id,
            );
          }
        }

        await db.runAsync(
          `DELETE FROM entries WHERE id IN (${selected.map((_) => "?").join(", ")})`,
          ...selected.map((s) => s[1].id),
        );
      });
    } catch (_) {
      ToastAndroid.show("Something went wrong!", ToastAndroid.LONG);
    }

    setSelected([]);
    emitCreate();
  }

  return (
    <ThemedView style={styles.view} colorName="background">
      <ThemedView style={styles.header} colorName="header" />
      <View style={styles.headerContainer}>
        <ThemedText colorName="nextText" style={styles.titleText}>
          Data Management
        </ThemedText>
        <View style={styles.downloadContainer}>
          <Link href="/DataManagement" asChild>
            <Button
              onPress={(e) => e?.preventDefault}
              buttonStyle={[
                {
                  backgroundColor: primaryButtonBackground,
                  borderColor: primaryButtonBackground,
                },
                styles.downloadContainerButton,
              ]}
            >
              <View style={{ flexDirection: "row" }}>
                <MaterialIcons
                  name="download"
                  size={26}
                  color={primaryButtonText}
                />
                <ThemedText colorName="primaryButtonText">|</ThemedText>
                <MaterialIcons
                  name="upload"
                  size={26}
                  color={primaryButtonText}
                />
              </View>
            </Button>
          </Link>
          <ThemedText colorName="nextText">
            Upload or download your data
          </ThemedText>
        </View>
      </View>
      <ThemedView
        style={[
          {
            backgroundColor: tableHeader,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            marginHorizontal: 8,
          },
          styles.dataTableRow,
        ]}
      >
        <Checkbox
          value={!!selected.length}
          onValueChange={toggleAllSelected}
          color={tableRowDark}
        />
        <View style={{ width: 86, paddingVertical: 4 }}>
          <ThemedText colorName="primaryButtonText">Date</ThemedText>
        </View>
        <View style={{ width: 48, paddingVertical: 4 }}>
          <ThemedText colorName="primaryButtonText">Cycle</ThemedText>
        </View>
        <View style={{ flex: 1, paddingVertical: 4 }}>
          <ThemedText colorName="primaryButtonText">Notes</ThemedText>
        </View>
      </ThemedView>
      <View style={styles.dataTableActionsOverlay}>
        <Button
          onPress={deleteSelected}
          buttonStyle={[
            {
              backgroundColor: primaryButtonBackground,
              borderColor: primaryButtonBackground,
            },
            styles.downloadContainerButton,
          ]}
        >
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons name="delete" size={26} color={primaryButtonText} />
          </View>
        </Button>
      </View>
      <ScrollView style={styles.dataContainer}>
        <View style={styles.dataTable}>
          {data.map((d, i) => {
            const backgroundColor = i % 2 === 0 ? tableRowDark : tableRowLight;

            function onCheckboxChange(checked: boolean) {
              setSelected((prev) => {
                if (!checked) {
                  return prev.filter((e) => e[1].id !== d.id);
                }
                return [...prev, [i, d]];
              });
            }

            return (
              <ThemedView
                key={i}
                style={[{ backgroundColor }, styles.dataTableRowContainer]}
              >
                <View style={styles.dataTableRow}>
                  <Checkbox
                    value={!!selected.find((e) => e[1].id === d.id)}
                    onValueChange={onCheckboxChange}
                    color={checkboxColor}
                  />
                  <View style={{ width: 86, paddingVertical: 4 }}>
                    <ThemedText colorName="nextText">
                      {new Date(+d.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={{ width: 48, paddingVertical: 4 }}>
                    <ThemedText colorName="nextText">{d.cycle}</ThemedText>
                  </View>
                  <View style={{ flex: 1, paddingVertical: 4 }}>
                    <ThemedText colorName="nextText">{d.notes}</ThemedText>
                  </View>
                </View>
              </ThemedView>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: {
    position: "relative",
    display: "flex",
    flex: 1,
  },
  header: {
    height: Constants.statusBarHeight,
    width: "100%",
  },
  headerContainer: {
    padding: 16,
  },
  titleText: {
    fontSize: 36,
    lineHeight: 36 * 1.2,
    fontWeight: 900,
    marginBottom: 8,
  },
  downloadContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  downloadContainerButton: {
    width: 78,
  },
  dataContainer: {},
  dataTable: { overflow: "hidden" },
  dataTableRowContainer: {
    marginHorizontal: 8,
  },
  dataTableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  dataTableCell: {
    paddingVertical: 4,
  },
  dataTableActionsOverlay: {
    position: "absolute",
    height: 48,
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
});
