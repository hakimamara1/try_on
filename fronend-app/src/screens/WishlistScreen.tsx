import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, ShoppingBag, Heart } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { getMe, toggleWishlist } from '../api/auth';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 24;

export default function WishlistScreen() {
    const navigation = useNavigation<any>();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await getMe();

            setWishlist(data.wishlist || []);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            // Optimistic update
            setWishlist(prev => prev.filter(item => item._id !== productId));
            await toggleWishlist(productId);
        } catch (error) {
            console.error('Failed to remove from wishlist', error);
            fetchWishlist(); // Revert on error
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item._id);
                    }}
                >
                    <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>DA{item.price}</Text>

                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        // Simple add to cart with defaults - logic from ShopScreen/ProductDetails
                        navigation.navigate('ProductDetails', { product: item }); // Maybe better to go to details to pick size? 
                        // Or straight add if no size/color? Assuming products have variants, safest is details.
                        // For this button, let's just make it a "View Details" call to action or effectively duplicate the card press behaviour but visually explicit.
                        // Actually the user task said "wishlist button ... best for ui and ux".
                        // Let's keep it simple: Card click -> Details.
                    }}
                >
                    <Text style={styles.addToCartText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
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
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                <View style={{ width: 40 }} />
            </View>

            {wishlist.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <Heart size={64} color={Colors.textLight} fill="#F0F0F0" />
                    </View>
                    <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                    <Text style={styles.emptyText}>Save items you love here to check them out later!</Text>
                    <TouchableOpacity
                        style={styles.startShoppingButton}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={styles.startShoppingText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlist}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    listContainer: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 200,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    contentContainer: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 10,
    },
    addToCartButton: {
        backgroundColor: Colors.text,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: -40,
    },
    emptyIconContainer: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    startShoppingButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
    },
    startShoppingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
