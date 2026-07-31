import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/Styles';
import { getMyOrders } from '../api/orders';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Truck, CheckCircle, Package, ChevronLeft } from 'lucide-react-native';

const STEPS = [
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

// Matches the design's order status pill treatment.
const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
    Delivered: { color: '#4B5C3E', bg: '#E7EADF', label: 'Delivered' },
    Shipped: { color: '#7A5B23', bg: '#F3E6CC', label: 'In Transit' },
    Processing: { color: Colors.textSecondary, bg: Colors.surfaceSunken, label: 'Processing' },
};

const OrderTimeline = ({ status, isDelivered }: { status: string, isDelivered: boolean }) => {
    // Determine current step index
    let currentStep = 0;
    if (isDelivered || status === 'Delivered') {
        currentStep = 3; // Completed
    } else if (status === 'Shipped') {
        currentStep = 1;
    } else {
        currentStep = 0; // Processing
    }

    return (
        <View style={styles.timelineContainer}>
            {/* Progress Line */}
            <View style={styles.lineBase} />
            <View style={[styles.lineProgress, { width: `${Math.min(currentStep * 25, 100)}%` }]} />

            {/* Steps */}
            <View style={styles.stepsRow}>
                {STEPS.map((step, index) => {
                    const isActive = index <= currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <View key={step.key} style={styles.stepWrapper}>
                            <View style={[
                                styles.stepDot,
                                isActive && styles.stepDotActive,
                                isCompleted && styles.stepDotCompleted
                            ]}>
                                <step.icon
                                    size={12}
                                    color={isActive ? Colors.darkText : Colors.textLight}
                                />
                            </View>
                            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadOrders = async () => {
        try {
            const data = await getMyOrders();
            // Ensure data is array
            setOrders(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const statusKey = item.isDelivered ? 'Delivered' : (item.status || 'Processing');
        const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.Processing;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                <Text style={styles.date}>{date} · {item.orderItems?.length} {item.orderItems?.length === 1 ? 'item' : 'items'}</Text>

                <View style={styles.thumbsRow}>
                    {(item.orderItems || []).slice(0, 4).map((oi: any, idx: number) => (
                        <Image key={idx} source={{ uri: oi.image }} style={styles.itemThumb} contentFit="cover" />
                    ))}
                </View>

                {/* Progress Timeline */}
                <View style={styles.timelineSection}>
                    <OrderTimeline status={item.status} isDelivered={item.isDelivered} />
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${item.totalPrice}</Text>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={40} color={Colors.borderStrong} />
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubtext}>Looks like you haven't placed any orders.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: Colors.background,
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
    headerTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontFamily: Fonts.sansBold,
        fontSize: 11,
    },
    date: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    thumbsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    itemThumb: {
        width: 44,
        height: 52,
        borderRadius: 8,
        backgroundColor: Colors.surfaceSunken,
    },
    timelineSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    timelineContainer: {
        position: 'relative',
        height: 50, // space for dots and labels
        justifyContent: 'flex-start',
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    stepWrapper: {
        alignItems: 'center',
        width: 60,
    },
    stepDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    stepDotActive: {
        backgroundColor: Colors.primary,
    },
    stepDotCompleted: {
        backgroundColor: Colors.text,
    },
    stepLabel: {
        fontFamily: Fonts.sansMedium,
        fontSize: 10,
        color: Colors.textLight,
        textAlign: 'center',
    },
    stepLabelActive: {
        fontFamily: Fonts.sansBold,
        color: Colors.text,
    },
    lineBase: {
        position: 'absolute',
        top: 11,
        left: 30,
        right: 30,
        height: 2,
        backgroundColor: Colors.surfaceSunken,
        zIndex: 1,
    },
    lineProgress: {
        position: 'absolute',
        top: 11,
        left: 30,
        height: 2,
        backgroundColor: Colors.primary,
        zIndex: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    totalLabel: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textSecondary,
    },
    totalValue: {
        fontFamily: Fonts.sansBold,
        fontSize: 15,
        color: Colors.text,
    },
    emptyContainer: {
        alignItems: 'center',
        gap: 10,
        marginTop: 80,
    },
    emptyText: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
        marginTop: 6,
    },
    emptySubtext: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textLight,
    }
});
