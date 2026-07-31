import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';

export default function OrderConfirmationScreen({ route, navigation }: any) {
    const { orderId, total, paymentMethod } = route.params || {};
    const shortId = orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : '';

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Check size={26} color={Colors.darkText} strokeWidth={2.6} />
                </View>
                <Text style={styles.title}>Order Placed</Text>
                <Text style={styles.subtitle}>
                    Order {shortId}{typeof total === 'number' ? ` · $${total.toFixed(2)}` : ''}
                </Text>
                <Text style={styles.description}>
                    {paymentMethod === 'card'
                        ? 'We\'ll process your payment and start preparing your order.'
                        : 'Cash on Delivery — please have the total ready when your order arrives.'}
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.outlineButton}
                        onPress={() => navigation.navigate('Orders')}
                    >
                        <Text style={styles.outlineButtonText}>View My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filledButton}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                    >
                        <Text style={styles.filledButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 14,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 22,
        color: Colors.text,
    },
    subtitle: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    description: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        maxWidth: 260,
    },
    actions: {
        width: '100%',
        maxWidth: 280,
        gap: 10,
        marginTop: 12,
    },
    outlineButton: {
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: Colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    filledButton: {
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filledButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.darkText,
    },
});
