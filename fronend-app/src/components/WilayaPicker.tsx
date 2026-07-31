import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, TextInput } from 'react-native';
import { ChevronDown, Search, Check } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { WILAYAS } from '../constants/Wilayas';

interface WilayaPickerProps {
    label: string;
    value: string;
    onChange: (wilaya: string) => void;
}

export default function WilayaPicker({ label, value, onChange }: WilayaPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return WILAYAS;
        const q = search.trim().toLowerCase();
        return WILAYAS.filter(w => w.toLowerCase().includes(q));
    }, [search]);

    const handleSelect = (wilaya: string) => {
        onChange(wilaya);
        setSearch('');
        setOpen(false);
    };

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
                <Text style={value ? styles.fieldValue : styles.fieldPlaceholder} numberOfLines={1}>
                    {value || 'Select'}
                </Text>
                <ChevronDown size={16} color={Colors.textLight} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.scrim} onPress={() => setOpen(false)} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>{label}</Text>
                    <View style={styles.searchBox}>
                        <Search size={16} color={Colors.textLight} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search wilaya..."
                            placeholderTextColor={Colors.textLight}
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item}
                        style={styles.list}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
                                <Text style={styles.rowText}>{item}</Text>
                                {item === value && <Check size={16} color={Colors.primary} />}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No wilaya matches "{search}"</Text>
                        }
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.text,
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 46,
        marginTop: 6,
        borderWidth: 1.5,
        borderColor: Colors.borderStrong,
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: Colors.surface,
    },
    fieldValue: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
    fieldPlaceholder: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.textLight,
        flex: 1,
    },
    scrim: {
        flex: 1,
        backgroundColor: 'rgba(28,24,21,0.45)',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        height: '70%',
    },
    sheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.borderStrong,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
        marginBottom: 14,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 44,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 22,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.text,
    },
    list: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    rowText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 15,
        color: Colors.text,
    },
    emptyText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 30,
    },
});
