import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { X } from "phosphor-react-native";

import { apiFetch, EventT } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useToast } from "@/src/toast";
import { queryClient } from "@/src/query-client";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function NewEvent() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [vibe, setVibe] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");

  const createM = useMutation({
    mutationFn: () =>
      apiFetch<EventT>("/events", {
        method: "POST",
        auth: true,
        body: {
          name: name.trim(),
          date: date || undefined,
          vibe: vibe || undefined,
          guest_count: guests ? parseInt(guests, 10) : undefined,
          notes: notes || undefined,
        },
      }),
    onSuccess: (ev) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.replace(`/event/${ev.id}`);
    },
    onError: (e: any) => show(e?.message || "Could not create event", "error"),
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.head}>
        <Text style={styles.title}>New Event</Text>
        <Pressable testID="close-new-event" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/events"))} style={styles.closeBtn}>
          <X size={20} color={colors.onSurfaceSecondary} weight="bold" />
        </Pressable>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.form} bottomOffset={20} showsVerticalScrollIndicator={false}>
        <Field label="Event name" required>
          <TextInput testID="event-name-input" placeholder="Sarah's Summer Wedding" placeholderTextColor={colors.muted} value={name} onChangeText={setName} style={styles.input} />
        </Field>
        <Field label="Date">
          <TextInput testID="event-date-input" placeholder="Aug 24, 2026" placeholderTextColor={colors.muted} value={date} onChangeText={setDate} style={styles.input} />
        </Field>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Vibe">
              <TextInput testID="event-vibe-input" placeholder="Boho, tropical..." placeholderTextColor={colors.muted} value={vibe} onChangeText={setVibe} style={styles.input} />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Guests">
              <TextInput testID="event-guests-input" placeholder="80" placeholderTextColor={colors.muted} value={guests} onChangeText={setGuests} keyboardType="number-pad" style={styles.input} />
            </Field>
          </View>
        </View>
        <Field label="Notes">
          <TextInput testID="event-notes-input" placeholder="Anything the bar team should know..." placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.textarea]} />
        </Field>

        <Button
          testID="save-event-button"
          title="Create Event"
          onPress={() => (name.trim() ? createM.mutate() : show("Give your event a name", "info"))}
          loading={createM.isPending}
          style={{ marginTop: 12 }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28, fontWeight: "700" },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  form: { padding: 16 },
  label: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { height: 50, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 14, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  textarea: { height: 100, paddingTop: 14, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
}));
