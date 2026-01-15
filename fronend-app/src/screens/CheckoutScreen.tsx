import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Truck, CreditCard, Banknote, MapPin } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ navigation }: any) {
    const { total, clearCart, checkout, items } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        setLoading(true);

        // Mock shipping address for MVP
        const shippingAddress = {
            address: "123 Fashion Ave",
            city: "New York",
            postalCode: "10012",
            country: "USA"
        };

        const success = await checkout(shippingAddress, paymentMethod);
        setLoading(false);

        if (success) {
            Alert.alert(
                "Order Placed!",
                "Thank you for your purchase. We will contact you shortly.",
                [
                    {
                        text: "OK", onPress: () => {
                            navigation.navigate('MainTabs', { screen: 'Orders' });
                        }
                    }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Shipping Address */}
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.card}>
                    <View style={styles.inputRow}>
                        <MapPin size={20} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Address"
                            defaultValue="123 Fashion Ave, NY 10012"
                        />
                    </View>
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentContainer}>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentActive]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Banknote size={24} color={paymentMethod === 'cod' ? Colors.text : Colors.textSecondary} />
                        <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextActive]}>Cash on Delivery</Text>
                        {paymentMethod === 'cod' && <Check size={16} color={Colors.success} style={styles.checkIcon} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentActive]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <CreditCard size={24} color={paymentMethod === 'card' ? Colors.text : Colors.textSecondary} />
                        <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>Credit Card</Text>
                        {paymentMethod === 'card' && <Check size={16} color={Colors.success} style={styles.checkIcon} />}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Truck size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>Estimated Delivery: 2-3 Business Days</Text>
                </View>

                {/* Summary */}
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.card}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>Free</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
                    <Text style={styles.placeText}>Confirm Order</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 8,
    },
    paymentContainer: {
        gap: 12,
        marginBottom: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        position: 'relative',
        gap: 12,
    },
    paymentActive: {
        borderColor: Colors.text,
        backgroundColor: '#FAFAFA',
    },
    paymentText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    paymentTextActive: {
        color: Colors.text,
        fontWeight: '700',
    },
    checkIcon: {
        position: 'absolute',
        right: 16,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    infoText: {
        color: Colors.text,
        fontSize: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primary,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    placeBtn: {
        backgroundColor: Colors.text,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    placeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    }
});
