import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Styles';
import { getMyOrders } from '../api/orders';
import { useFocusEffect } from '@react-navigation/native';
import { Truck, CheckCircle, Package, Clock, ChevronRight } from 'lucide-react-native';

const STEPS = [
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

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
                                    color={isActive ? '#fff' : Colors.textLight}
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
        const firstImage = item.orderItems?.[0]?.image || 'https://via.placeholder.com/150';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, item.isDelivered && styles.textSuccess]}>
                            {item.isDelivered ? 'Complete' : (item.status || 'Processing')}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Image source={{ uri: firstImage }} style={styles.itemImage} />
                    <View style={styles.details}>
                        <Text style={styles.date}>Placed on {date}</Text>
                        <Text style={styles.itemsInfo}>{item.orderItems?.length} items • ${item.totalPrice}</Text>
                        {item.trackingNumber && (
                            <Text style={styles.tracking}>Track: {item.trackingNumber}</Text>
                        )}
                    </View>
                    <ChevronRight color={Colors.textLight} size={20} />
                </View>

                {/* Progress Timeline */}
                <View style={styles.timelineSection}>
                    <OrderTimeline status={item.status} isDelivered={item.isDelivered} />
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
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={64} color={Colors.textLight} />
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
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.background,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    statusBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    textSuccess: {
        color: 'green',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    itemImage: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
    },
    details: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    date: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 4,
    },
    itemsInfo: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    tracking: {
        fontSize: 12,
        color: Colors.secondary,
        marginTop: 4,
    },
    timelineSection: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
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
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    stepDotActive: {
        backgroundColor: Colors.secondary,
    },
    stepDotCompleted: {
        backgroundColor: Colors.primary, // or secondary
    },
    stepLabel: {
        fontSize: 10,
        color: Colors.textLight,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    lineBase: {
        position: 'absolute',
        top: 11, // half of dot height (24/2) minus half line height (2/2) roughly
        left: 30,
        right: 30,
        height: 2,
        backgroundColor: '#eee',
        zIndex: 1,
    },
    lineProgress: {
        position: 'absolute',
        top: 11,
        left: 30,
        height: 2,
        backgroundColor: Colors.secondary,
        zIndex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
        marginTop: 8,
    }
});
