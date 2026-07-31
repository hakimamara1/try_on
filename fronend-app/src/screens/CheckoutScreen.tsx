import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Banknote, ShoppingBag } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/auth';
import WilayaPicker from '../components/WilayaPicker';

export default function CheckoutScreen({ navigation }: any) {
    const { total, checkout, items } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [commune, setCommune] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [prefilled, setPrefilled] = useState(false);

    // Shares the same ['user', 'me'] cache the Profile/Wishlist screens use.
    const { data: meData } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => (await getMe()).data,
        initialData: user ?? undefined,
        enabled: !!user,
    });

    // Prefill delivery details from the saved profile once, the first time
    // it's available — after that, leave whatever the user typed alone (this
    // order's address doesn't have to match their saved preference).
    useEffect(() => {
        if (meData && !prefilled) {
            setFullName(meData.name || '');
            setPhone(meData.phone || '');
            setWilaya(meData.wilaya || '');
            setCommune(meData.commune || '');
            setPrefilled(true);
        }
    }, [meData, prefilled]);

    const isAddressComplete = fullName.trim() && phone.trim() && wilaya && commune.trim() && addressLine.trim();

    const handlePlaceOrder = async () => {
        if (!isAddressComplete) return;

        setLoading(true);

        const shippingAddress = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            wilaya,
            commune: commune.trim(),
            addressLine: addressLine.trim(),
            country: 'DZ',
        };

        const order = await checkout(shippingAddress, 'Cash on Delivery');
        setLoading(false);

        if (order) {
            navigation.navigate('OrderConfirmation', {
                orderId: order._id,
                total: order.totalPrice ?? total,
                paymentMethod: 'cod',
            });
        }
    };

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Delivery Details</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <ShoppingBag size={38} color={Colors.borderStrong} />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptyText}>Add some items to get started!</Text>
                    <TouchableOpacity
                        style={styles.emptyCta}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
                    >
                        <Text style={styles.emptyCtaText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Delivery Details</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                            <WilayaPicker label="Wilaya" value={wilaya} onChange={setWilaya} />
                        </View>
                        <View style={[styles.field, { flex: 1 }]}>
                            <Text style={styles.label}>Commune</Text>
                            <TextInput
                                style={styles.input}
                                value={commune}
                                onChangeText={setCommune}
                                placeholder="e.g. Hydra"
                                placeholderTextColor={Colors.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={addressLine}
                            onChangeText={setAddressLine}
                            placeholder="Street, building, floor…"
                            placeholderTextColor={Colors.textLight}
                            multiline
                        />
                    </View>

                    {/* Payment */}
                    <Text style={[styles.label, { marginTop: 8, marginBottom: 10 }]}>Payment</Text>
                    <View style={styles.paymentOption}>
                        <Banknote size={20} color={Colors.text} />
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentMethodTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentMethodDesc}>Pay in cash when your order arrives</Text>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        <View style={styles.itemsList}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemVariant}>{item.size} · Qty {item.quantity}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>Free</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.placeOrderBtn, (!isAddressComplete || loading) && styles.btnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={!isAddressComplete || loading}
                >
                    <Text style={styles.placeOrderText}>
                        {loading ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    content: {
        paddingHorizontal: 20,
        gap: 16,
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
    textArea: {
        height: 70,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1.5,
        borderColor: Colors.text,
        borderRadius: 14,
        padding: 14,
        backgroundColor: Colors.surfaceSunken,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentMethodTitle: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    paymentMethodDesc: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    summaryCard: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        padding: 16,
        backgroundColor: Colors.surface,
        marginTop: 8,
    },
    summaryTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 16,
        color: Colors.text,
        marginBottom: 14,
    },
    itemsList: {
        gap: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    itemImage: {
        width: 44,
        height: 52,
        borderRadius: 8,
        backgroundColor: Colors.surfaceSunken,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 13,
        color: Colors.text,
    },
    itemVariant: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
    itemPrice: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    totalLabel: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.text,
    },
    totalAmount: {
        fontFamily: Fonts.sansBold,
        fontSize: 16,
        color: Colors.text,
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 20,
        paddingBottom: 34,
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    placeOrderBtn: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.5,
    },
    placeOrderText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.darkText,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
        marginTop: -60,
    },
    emptyTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
    },
    emptyText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    emptyCta: {
        backgroundColor: Colors.text,
        paddingHorizontal: 22,
        paddingVertical: 13,
        borderRadius: 23,
        marginTop: 6,
    },
    emptyCtaText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 13,
    },
});
