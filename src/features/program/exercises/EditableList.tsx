import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChoiceChip } from '@/components/choice-chip';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  addPlaceholder?: string;
}

// Shared by guided_list and decisional_balance_compare's gains list — tap a
// suggestion chip to add it, or type your own.
export function EditableList({ items, onChange, suggestions = [], addPlaceholder = 'Add your own' }: Props) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  function addItem(text: string) {
    const trimmed = text.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setDraft('');
  }

  function removeItem(text: string) {
    onChange(items.filter((i) => i !== text));
  }

  const availableSuggestions = suggestions.filter((s) => !items.includes(s));

  return (
    <View>
      {availableSuggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {availableSuggestions.map((s) => (
            <ChoiceChip key={s} label={s} selected={false} onPress={() => addItem(s)} />
          ))}
        </View>
      ) : null}

      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={addPlaceholder}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
          onSubmitEditing={() => addItem(draft)}
          accessibilityLabel={addPlaceholder}
        />
        <Pressable
          onPress={() => addItem(draft)}
          accessibilityRole="button"
          accessibilityLabel="Add item"
          style={[styles.addButton, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="add" size={20} color={theme.accent} />
        </Pressable>
      </View>

      {items.map((item) => (
        <View key={item} style={[styles.itemRow, { borderColor: theme.border }]}>
          <ThemedText type="default" style={styles.itemText}>
            {item}
          </ThemedText>
          <Pressable
            onPress={() => removeItem(item)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item}`}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: { marginBottom: Spacing.two },
  addRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  addButton: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: Spacing.two,
  },
  itemText: { flex: 1, marginRight: Spacing.two },
});
