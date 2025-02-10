import { StyleSheet, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import { ThemedView } from "@/components/ThemedView";
import Constants from "expo-constants";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { emitCreate, SQLEntry, useDatabaseContext } from "@/providers/database";
import { getDaysBetweenDates } from "@/utils/date";
import { useNavigation } from "expo-router";

type Data = {
  date: string;
  notes: string;
}[];

export default function DataManagement() {
  const db = useDatabaseContext();
  const navigation = useNavigation();
  const [data, setData] = React.useState<Data>([]);

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
    "tableRowDark",
  );

  const primaryButtonBackground = useThemeColor(
    { light: undefined, dark: undefined },
    "primaryButtonBackground",
  );

  const primaryButtonText = useThemeColor(
    { light: undefined, dark: undefined },
    "primaryButtonText",
  );

  function onDownload() {}

  async function onPrepareImport() {
    const file = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
    if (!file.assets) return;

    let str = await FileSystem.readAsStringAsync(file.assets[0].uri);
    str = str.replace(/\r\n/g, "\n");

    const lines = str.split("\n");
    const headers = lines[0].split(",");

    const dateColIdx = headers.findIndex(
      (e) => e.trim().toLowerCase() === "date",
    );
    const notesColIdx = headers.findIndex(
      (e) => e.trim().toLowerCase() === "notes",
    );

    const output: Data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");
      const obj = {
        date: line[dateColIdx],
        notes: line[notesColIdx],
      };
      output.push(obj);
    }

    setData(output);
  }

  async function onConfirmImport() {
    for (const d of data) {
      const date = new Date(+d.date);
      date.setHours(0, 0, 0, 0);
      const notes = d.notes;

      const checkExists = await db.getFirstAsync<SQLEntry>(
        "SELECT id FROM entries WHERE date = ? LIMIT 1",
        date.getTime(),
      );
      if (checkExists) continue;

      const lastEntry = await db.getFirstAsync<SQLEntry>(
        "SELECT * FROM entries WHERE date < ? ORDER BY date DESC LIMIT 1",
        date.getTime(),
      );

      let cycle = null;
      if (lastEntry?.date) {
        cycle = getDaysBetweenDates(date, new Date(lastEntry.date));
      }

      await db.runAsync(
        "INSERT INTO entries (date, notes, cycle) VALUES (?, ?, ?)",
        date.getTime(),
        notes ? notes : null,
        cycle,
      );

      const nextEntry = await db.getFirstAsync<SQLEntry>(
        "SELECT * FROM entries WHERE date > ? ORDER BY date ASC LIMIT 1",
        date.getTime(),
      );

      if (nextEntry?.date) {
        const updatedCycle = getDaysBetweenDates(
          date,
          new Date(nextEntry.date),
        );

        await db.runAsync(
          "UPDATE entries SET cycle = ? WHERE id = ?",
          updatedCycle,
          nextEntry.id,
        );
      }
    }

    setData([]);
    emitCreate();
    navigation.navigate("index");
  }

  function onCancelImport() {
    setData([]);
  }

  return (
    <View style={styles.view}>
      <ThemedView style={styles.header} colorName="header" />
      <ThemedView style={styles.viewInner}>
        <ThemedText style={styles.titleText}>Data Management</ThemedText>
        <View style={styles.downloadContainer}>
          <Button
            onPress={onDownload}
            buttonStyle={[
              {
                backgroundColor: primaryButtonBackground,
                borderColor: primaryButtonBackground,
              },
              styles.downloadContainerButton,
            ]}
          >
            <View style={{ flexDirection: "row", gap: 4 }}>
              <MaterialIcons
                name="download"
                size={26}
                color={primaryButtonText}
              />
              <ThemedText colorName="primaryButtonText">Download</ThemedText>
            </View>
          </Button>
          <ThemedText>Get your data as a .csv file</ThemedText>
        </View>

        <ThemedView style={styles.divider} colorName="divider" />

        <ThemedText>
          Do you already have some data you'd like to import?
        </ThemedText>

        <View style={styles.importContainer}>
          <View style={styles.importContainerText}>
            <ThemedText>
              We need a .csv file with the following columns:
            </ThemedText>
            <ThemedText>date | notes</ThemedText>
          </View>
          <Button
            onPress={onPrepareImport}
            buttonStyle={[
              {
                borderColor: primaryButtonBackground,
              },
              styles.importContainerButton,
            ]}
          >
            <View style={{ flexDirection: "row", gap: 4 }}>
              <MaterialIcons
                name="attach-file"
                size={24}
                color={primaryButtonBackground}
              />
              <ThemedText colorName="primaryButtonBackground">
                Select a file
              </ThemedText>
            </View>
          </Button>
        </View>

        {data.length ? (
          <>
            <View style={styles.previewContainer}>
              <ThemedText>Preview (top 5 rows)</ThemedText>
              <View style={styles.previewTable}>
                <ThemedView
                  style={[
                    { backgroundColor: tableHeader },
                    styles.previewTableRow,
                  ]}
                >
                  <View style={{ flex: 1, paddingVertical: 4 }}>
                    <ThemedText>Date</ThemedText>
                  </View>
                  <View style={{ flex: 3, paddingVertical: 4 }}>
                    <ThemedText>Notes</ThemedText>
                  </View>
                </ThemedView>

                {data.slice(0, 5).map((d, i) => {
                  const backgroundColor =
                    i % 2 === 0 ? tableRowDark : tableRowLight;
                  return (
                    <ThemedView
                      key={d.date}
                      style={[{ backgroundColor }, styles.previewTableRow]}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText>
                          {new Date(+d.date).toLocaleDateString()}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 3 }}>
                        <ThemedText>{d.notes}</ThemedText>
                      </View>
                    </ThemedView>
                  );
                })}
              </View>
            </View>

            <ThemedText>
              *We assume each date is the start of your period
            </ThemedText>

            <View style={styles.spacer} />

            <View style={styles.actionsContainer}>
              <Button
                onPress={onCancelImport}
                buttonStyle={[
                  {
                    flex: 2,
                    borderColor: primaryButtonBackground,
                  },
                  styles.actionsContainerButton,
                ]}
              >
                <ThemedText colorName="primaryButtonBackground">
                  Cancel
                </ThemedText>
              </Button>
              <Button
                onPress={onConfirmImport}
                buttonStyle={[
                  {
                    flex: 3,
                    backgroundColor: primaryButtonBackground,
                    borderColor: primaryButtonBackground,
                  },
                  styles.actionsContainerButton,
                ]}
              >
                <ThemedText colorName="primaryButtonText">
                  Confirm Import
                </ThemedText>
              </Button>
            </View>
          </>
        ) : null}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    display: "flex",
    flex: 1,
  },
  viewInner: {
    flex: 1,
    padding: 16,
  },
  header: {
    height: Constants.statusBarHeight,
    width: "100%",
  },
  titleText: {
    fontSize: 36,
    lineHeight: 36 * 1.2,
    fontWeight: 900,
    marginBottom: 12,
  },
  downloadContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  downloadContainerButton: {
    width: 130,
    paddingRight: 6,
  },
  divider: {
    height: 2,
    marginHorizontal: 24,
    marginVertical: 16,
  },
  importContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },
  importContainerText: {
    width: "45%",
    rowGap: 4,
  },
  importContainerButton: {
    width: 148,
    height: 86,
    paddingRight: 4,
  },
  previewContainer: {
    marginTop: 16,
  },
  previewTable: { borderRadius: 4, overflow: "hidden" },
  previewTableRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  previewTableCell: {},
  spacer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  actionsContainerButton: {},
});
