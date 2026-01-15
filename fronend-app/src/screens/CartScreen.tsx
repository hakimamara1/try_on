import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }: any) {
    const { items, removeFromCart, updateQuantity, total } = useCart();

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.variant}>{item.size} • <View style={[styles.colorDot, { backgroundColor: item.color }]} /></Text>

                <View style={styles.row}>
                    <Text style={styles.price}>${item.price}</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.qtBtn}
                            onPress={() => item.quantity > 1 ? updateQuantity(item.id, item.size, item.color, -1) : removeFromCart(item.id, item.size, item.color)}
                        >
                            <Minus size={14} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtBtn}
                            onPress={() => updateQuantity(item.id, item.size, item.color, 1)}
                        >
                            <Plus size={14} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => removeFromCart(item.id, item.size, item.color)}
            >
                <Trash2 size={18} color={Colors.textLight} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Shopping Cart</Text>
                <Text style={styles.count}>{items.length} items</Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => `${item.id}-${item.size}-${item.color}`}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Your cart is empty.</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' })}>
                            <Text style={styles.link}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {items.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={() => navigation.navigate('Checkout')}
                    >
                        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                        <ArrowRight size={20} color="#fff" />
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
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    count: {
        fontSize: 14,
        color: Colors.textLight,
    },
    list: {
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    details: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    variant: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.background,
        padding: 4,
        borderRadius: 8,
    },
    qtBtn: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    qtText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 8,
        justifyContent: 'center',
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    link: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
    },
    checkoutBtn: {
        backgroundColor: Colors.text,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        gap: 10,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    }
});
