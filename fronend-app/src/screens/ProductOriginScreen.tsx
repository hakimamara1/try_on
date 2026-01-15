import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ShieldCheck, Award, ArrowRight, Home } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ProductOriginScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { product, points } = route.params || {};

    // Fallback data if accessed directly (shouldn't happen in flow)
    const productName = product?.name || "Premium Product";
    const originCountry = product?.origin || "Italy";
    const earnedPoints = points || 200;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Success Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <CheckCircle size={60} color={Colors.primary} fill="#E8F5E9" />
                    </View>
                    <Text style={styles.title}>Product Verified!</Text>
                    <Text style={styles.subtitle}>Thank you for your confidence.</Text>
                </View>

                {/* Product Card */}
                <View style={styles.card}>
                    <View style={styles.productHeader}>
                        <ShieldCheck size={24} color={Colors.secondary} />
                        <Text style={styles.cardTitle}>Authentic Origin</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.productInfo}>
                        <Text style={styles.label}>Product</Text>
                        <Text style={styles.value}>{productName}</Text>
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.label}>Origin</Text>
                        <Text style={styles.value}>{originCountry}</Text>
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.label}>Material</Text>
                        <Text style={styles.value}>100% Premium Silk</Text>
                    </View>
                </View>

                {/* Points Reward */}
                <View style={styles.pointsCard}>
                    <Award size={32} color="#FFD700" />
                    <View>
                        <Text style={styles.pointsTitle}>Rewards Earned</Text>
                        <Text style={styles.pointsValue}>+{earnedPoints} Points</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    This product has been verified as authentic and originally sourced.
                    Enjoy your elegant modesty.
                </Text>

            </ScrollView>

            {/* Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                >
                    <Text style={styles.primaryButtonText}>Back to Profile</Text>
                    <Home size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
                >
                    <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                    <ArrowRight size={20} color={Colors.text} />
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
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    productInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: Colors.textLight,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    pointsCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary, // Using primary color for impact, or generic nice gradient could work
        padding: 20,
        borderRadius: 16,
        gap: 16,
        marginBottom: 32,
    },
    pointsTitle: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    pointsValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    footerText: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: Colors.text,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    secondaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});
