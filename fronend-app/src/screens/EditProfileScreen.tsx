import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { getMe, updateDetails } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import WilayaPicker from '../components/WilayaPicker';

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    // Shares the same ['user', 'me'] cache the Wishlist/ProductDetails
    // screens read, so a save here is reflected everywhere immediately.
    const { data: meData } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => (await getMe()).data,
        initialData: user ?? undefined,
        enabled: !!user,
    });

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [commune, setCommune] = useState('');

    useEffect(() => {
        if (meData) {
            setFullName(meData.name || '');
            setPhone(meData.phone || '');
            setWilaya(meData.wilaya || '');
            setCommune(meData.commune || '');
        }
    }, [meData?._id]);

    const saveMutation = useMutation({
        mutationFn: () => updateDetails({ name: fullName.trim(), phone: phone.trim(), wilaya, commune: commune.trim() }),
        onSuccess: async (res) => {
            queryClient.setQueryData(['user', 'me'], res.data);
            await refreshUser();
            navigation.goBack();
        },
    });

    const initial = fullName.trim()?.[0]?.toUpperCase() || '?';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>My Profile</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.identityRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                        <View>
                            <Text style={styles.displayName}>{fullName || 'Your name'}</Text>
                            <View style={styles.pointsRow}>
                                <View style={styles.pointsDot} />
                                <Text style={styles.pointsText}>{user?.points ?? 0} pts</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="e.g. Amina Belkacem"
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="05XX XX XX XX"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.field, { flex: 1 }]}>
                            <WilayaPicker label="Preferred Wilaya" value={wilaya} onChange={setWilaya} />
                        </View>
                        <View style={[styles.field, { flex: 1 }]}>
                            <Text style={styles.label}>Preferred Commune</Text>
                            <TextInput
                                style={styles.input}
                                value={commune}
                                onChangeText={setCommune}
                                placeholder="e.g. Hydra"
                                placeholderTextColor={Colors.textLight}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saveMutation.isPending && styles.saveButtonDisabled]}
                        onPress={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                    >
                        <Text style={styles.saveButtonText}>
                            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 16,
    },
    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 4,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.primaryDark,
    },
    displayName: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 15,
        color: Colors.text,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 3,
    },
    pointsDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    pointsText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.primaryDark,
    },
    field: {},
    label: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.text,
    },
    input: {
        height: 46,
        marginTop: 6,
        borderWidth: 1.5,
        borderColor: Colors.borderStrong,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.text,
        backgroundColor: Colors.surface,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    saveButton: {
        height: 52,
        marginTop: 8,
        borderRadius: 26,
        backgroundColor: Colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.darkText,
    },
});
