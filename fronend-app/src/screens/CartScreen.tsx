import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, X, ChevronLeft, ShoppingBag } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { useCart, CartItem } from '../context/CartContext';

export default function CartScreen({ navigation }: any) {
    const { items, removeFromCart, updateQuantity, total } = useCart();

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id, item.size, item.color)} hitSlop={8}>
                        <X size={15} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>
                <View style={styles.variantRow}>
                    <Text style={styles.variant}>{item.size}</Text>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                </View>
                <View style={styles.row}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.qtBtn}
                            onPress={() => item.quantity > 1 ? updateQuantity(item.id, item.size, item.color, -1) : removeFromCart(item.id, item.size, item.color)}
                        >
                            <Minus size={13} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtBtn}
                            onPress={() => updateQuantity(item.id, item.size, item.color, 1)}
                        >
                            <Plus size={13} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Cart</Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => `${item.id}-${item.size}-${item.color}`}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ShoppingBag size={38} color={Colors.borderStrong} />
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyText}>Add pieces you love and they'll show up here.</Text>
                        <TouchableOpacity
                            style={styles.emptyCta}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
                        >
                            <Text style={styles.emptyCtaText}>Browse Products</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {items.length > 0 && (
                <View style={styles.footer}>
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
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Checkout' })}
                    >
                        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        backgroundColor: Colors.surface,
    },
    image: {
        width: 64,
        height: 76,
        borderRadius: 10,
        backgroundColor: Colors.surfaceSunken,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        flex: 1,
        fontFamily: Fonts.sansSemiBold,
        fontSize: 13,
        color: Colors.text,
    },
    variantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    variant: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textLight,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.borderStrong,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    qtBtn: {
        width: 14,
        alignItems: 'center',
    },
    qtText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
        minWidth: 14,
        textAlign: 'center',
    },
    price: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.text,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
        gap: 12,
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
    footer: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 34,
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        marginBottom: 10,
    },
    totalLabel: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 14,
        color: Colors.text,
    },
    totalAmount: {
        fontFamily: Fonts.sansBold,
        fontSize: 18,
        color: Colors.text,
    },
    checkoutBtn: {
        backgroundColor: Colors.text,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 14,
    },
});
