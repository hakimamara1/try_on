import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Truck, CreditCard, Banknote, MapPin, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ navigation }: any) {
    const { total, clearCart, checkout, items } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod');
    const [loading, setLoading] = useState(false);

    // Form states
    const [address, setAddress] = useState("123 Fashion Ave");
    const [city, setCity] = useState("New York");
    const [zip, setZip] = useState("10012");

    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            Alert.alert("Cart Empty", "Please add items to your cart before checking out.");
            return;
        }
        setLoading(true);

        const shippingAddress = {
            address,
            city,
            postalCode: zip,
            country: "USA"
        };

        const success = await checkout(shippingAddress, paymentMethod);
        setLoading(false);

        if (success) {
            Alert.alert(
                "Order Confirmed! 🎉",
                paymentMethod === 'cod'
                    ? "Your order has been placed successfully. Please have the cash ready upon delivery."
                    : "Your order has been placed successfully.",
                [
                    {
                        text: "Continue Shopping", onPress: () => {
                            navigation.navigate('MainTabs', { screen: 'Shop' });
                        }
                    }
                ]
            );
        }
    };

    const EmptyCartView = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <ShoppingBag size={48} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Add some items to get started!</Text>
            <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
            >
                <Text style={styles.continueBtnText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Checkout</Text>
                </View>
                <EmptyCartView />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Checkout</Text>
                <View style={styles.stepContainer}>
                    <View style={styles.stepActive}>
                        <Text style={styles.stepText}>1</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={[styles.stepActive, { backgroundColor: Colors.text }]}>
                        <Check size={12} color="#fff" />
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Delivery Section */}
                    <View style={styles.sectionHeader}>
                        <MapPin size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Street Address</Text>
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="123 Fashion Street"
                                placeholderTextColor={Colors.textLight}
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    value={city}
                                    onChangeText={setCity}
                                    placeholder="New York"
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                            <View style={[styles.inputGroup, { width: 100 }]}>
                                <Text style={styles.label}>ZIP Code</Text>
                                <TextInput
                                    style={styles.input}
                                    value={zip}
                                    onChangeText={setZip}
                                    placeholder="10001"
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.textLight}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Payment Section */}
                    <View style={styles.sectionHeader}>
                        <CreditCard size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>

                    <View style={styles.paymentContainer}>
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'cod' && styles.paymentActive
                            ]}
                            onPress={() => setPaymentMethod('cod')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.paymentIconContainer}>
                                <Banknote size={24} color={paymentMethod === 'cod' ? '#fff' : Colors.text} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={[styles.paymentMethodTitle, paymentMethod === 'cod' && styles.textActive]}>
                                    Cash on Delivery
                                </Text>
                                <Text style={styles.paymentMethodDesc}>Pay when you receive your order</Text>
                            </View>
                            <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>
                                {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'card' && styles.paymentActive
                            ]}
                            onPress={() => setPaymentMethod('card')}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.paymentIconContainer, { backgroundColor: paymentMethod === 'card' ? Colors.text : '#F5F5F5' }]}>
                                <CreditCard size={24} color={paymentMethod === 'card' ? '#fff' : Colors.text} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={[styles.paymentMethodTitle, paymentMethod === 'card' && styles.textActive]}>
                                    Credit Card
                                </Text>
                                <Text style={styles.paymentMethodDesc}>Visa, Mastercard, Amex</Text>
                            </View>
                            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
                                {paymentMethod === 'card' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Summary Section */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.paramTitle}>Order Summary</Text>

                        {/* Order Items List */}
                        <View style={styles.itemsList}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <View style={styles.itemImageContainer}>
                                        {/* Use a placeholder if image is missing or invalid URL */}
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <Image
                                                source={{ uri: item.image }}
                                                style={styles.itemImage as any}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <ShoppingBag size={20} color={Colors.textLight} />
                                        )}
                                        <View style={styles.quantityBadge}>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemVariant}>
                                            {item.size} • <View style={[styles.colorDot, { backgroundColor: item.color }]} /> {item.color}
                                        </Text>
                                        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                                    </View>
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
                            <View style={styles.freeBadge}>
                                <Text style={styles.freeText}>FREE</Text>
                            </View>
                        </View>

                        <View style={styles.totalRow}>
                            <View>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalSub}>Incl. VAT</Text>
                            </View>
                            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Delivery Info */}
                    <View style={styles.deliveryInfo}>
                        <Truck size={20} color={Colors.textSecondary} />
                        <Text style={styles.deliveryText}>
                            Estimated delivery: <Text style={{ fontWeight: '600', color: Colors.text }}>2-3 business days</Text>
                        </Text>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, loading && styles.btnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text style={styles.checkoutBtnText}>
                        {loading ? 'Processing...' : `Confirm Order • $${total.toFixed(2)}`}
                    </Text>
                    {!loading && <ChevronRight size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepActive: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F8F9FB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    paymentContainer: {
        gap: 12,
        marginBottom: 24,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        gap: 16,
    },
    paymentActive: {
        borderColor: Colors.primary,
        backgroundColor: '#fff',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    paymentIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.text,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentMethodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    textActive: {
        color: Colors.primary,
    },
    paymentMethodDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
    },
    paramTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
        color: Colors.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
    },
    itemsList: {
        marginBottom: 16,
        gap: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    quantityBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: Colors.text,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    quantityText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    itemVariant: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 16,
    },
    freeBadge: {
        backgroundColor: '#E7F9ED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    freeText: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: '700',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    totalLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    totalSub: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    deliveryText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    checkoutBtn: {
        backgroundColor: Colors.text,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 8,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    checkoutBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    continueBtn: {
        backgroundColor: Colors.text,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 100,
    },
    continueBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
