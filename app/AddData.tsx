import React from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useHeaderHeight } from "@react-navigation/elements";
import Constants from "expo-constants";
import { useNavigation } from "expo-router";
import { emitCreate, SQLEntry, useDatabaseContext } from "@/providers/database";
import { getDaysBetweenDates } from "@/utils/date";
import Button from "@/components/Button";

export default function AddData() {
  const { height } = useWindowDimensions();
  const hHeight = useHeaderHeight();
  const navigation = useNavigation();
  const db = useDatabaseContext();

  const [headerHeight] = React.useState(hHeight);
  const [date, setDate] = React.useState(new Date());
  const [show, setShow] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  const notesRef = React.useRef<TextInput | null>(null);

  const inputBorder = useThemeColor(
    { light: undefined, dark: undefined },
    "inputBorder",
  );
  const inputBackground = useThemeColor(
    { light: undefined, dark: undefined },
    "inputBackground",
  );
  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    "inputBorder",
  );

  const primaryButtonBackground = useThemeColor(
    { light: undefined, dark: undefined },
    "primaryButtonBackground",
  );

  function onChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    const currentDate = selectedDate;
    if (!currentDate) return;

    setShow(false);
    setDate(currentDate);
    notesRef.current?.focus();
  }

  function showDatepicker() {
    setShow(true);
  }

  async function onSubmit() {
    date.setHours(0, 0, 0, 0);

    const lastEntry = await db.getFirstAsync<SQLEntry>(
      "SELECT date FROM entries WHERE date < ? ORDER BY date DESC LIMIT 1",
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
      "SELECT id, date FROM entries WHERE date > ? ORDER BY date ASC LIMIT 1",
      date.getTime(),
    );

    if (nextEntry?.date) {
      const updatedCycle = getDaysBetweenDates(date, new Date(nextEntry.date));

      await db.runAsync(
        "UPDATE entries SET cycle = ? WHERE id = ?",
        updatedCycle,
        nextEntry.id,
      );
    }

    emitCreate();
    navigation.goBack();
  }

  return (
    <ThemedView
      style={[
        {
          height: height - headerHeight + Constants.statusBarHeight,
        },
        styles.view,
      ]}
      colorName="nextBackground"
    >
      <ThemedText colorName="nextText">
        This date represents the start of your cycle. You can choose to add some
        notes to help track anything out of the ordinary.
      </ThemedText>
      <Pressable style={styles.dateInputContainer} onPressOut={showDatepicker}>
        <View>
          <ThemedText colorName="nextText" style={styles.inputLabel}>
            Date
          </ThemedText>
          <ThemedText
            style={[
              { borderColor: inputBorder, backgroundColor: inputBackground },
              styles.dateInput,
            ]}
          >
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.dateIcon}>
          <IconSymbol name="calendar" size={64} color={iconColor} />
        </View>
      </Pressable>
      {show && (
        <DateTimePicker value={date} mode={"date"} onChange={onChange} />
      )}

      <View style={styles.notesInputContainer}>
        <ThemedText colorName="nextText" style={styles.inputLabel}>
          Notes
        </ThemedText>
        <TextInput
          ref={notesRef}
          editable
          multiline
          maxLength={500}
          onChangeText={setNotes}
          value={notes}
          style={[
            { borderColor: inputBorder, backgroundColor: inputBackground },
            styles.notesInput,
          ]}
        />
      </View>
      <View style={styles.spacer} />
      <View style={styles.submitButtonContainer}>
        <Button
          onPressOut={onSubmit}
          buttonStyle={[
            {
              backgroundColor: primaryButtonBackground,
              borderColor: primaryButtonBackground,
              width: "100%",
            },
          ]}
        >
          <ThemedText colorName="primaryButtonText">Submit</ThemedText>
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  view: {
    display: "flex",
    padding: 16,
  },
  inputLabel: {
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 14 * 1.2,
  },
  dateInputContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  dateIcon: {
    marginBottom: -2,
  },
  notesInputContainer: {
    width: "100%",
    height: 204,
    marginTop: -4,
  },
  notesInput: {
    flex: 1,
    textAlignVertical: "top",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    paddingHorizontal: 12,
  },
  spacer: {
    flex: 1,
  },
  submitButtonContainer: {
    borderRadius: 8,
  },
});
