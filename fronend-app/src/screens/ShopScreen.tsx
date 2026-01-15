import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Newest', 'Price: Low-High', 'Price: High-Low', 'On Sale'];

export default function ShopScreen({ navigation }: any) {
    const { count } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeFilter, setActiveFilter] = useState('All');

    // React Query Hooks
    const { data: rawProducts, isLoading: loadingProducts, refetch: refetchProducts, isRefetching } = useProducts();
    const { data: rawCategories, isLoading: loadingCategories } = useCategories();

    // Derived State
    const products = React.useMemo(() => {
        if (!rawProducts) return [];
        // Handle { data: [...] } wrapper if present, otherwise assume array
        return rawProducts.data || (Array.isArray(rawProducts) ? rawProducts : []);
    }, [rawProducts]);

    const categories = React.useMemo(() => {
        if (!rawCategories) return [];
        // Handle { data: [...] } wrapper if present
        const list = rawCategories.data || rawCategories;
        // Mapping based on previous logic: if objects with name property, map to name, else use as is
        return Array.isArray(list) ? list.map((c: any) => c.name || c) : [];
    }, [rawCategories]);

    const loading = loadingProducts || loadingCategories;

    const filteredProducts = products.filter((p: any) =>
        (activeCategory === 'All' || (p.category && p.category.name === activeCategory) || p.categoryName === activeCategory) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {item.discount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Shop</Text>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <ShoppingBag color={Colors.text} size={24} />
                    {count > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search color={Colors.textSecondary} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search collection..."
                        placeholderTextColor={Colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color={Colors.textSecondary} size={18} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <SlidersHorizontal color={Colors.text} size={20} />
                </TouchableOpacity>
            </View>

            {/* Categories / Filters */}
            <View style={styles.filtersWrapper}>
                <FlatList
                    horizontal
                    data={['All', ...categories]}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                activeCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setActiveCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                activeCategory === item && styles.categoryTextActive
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Product Grid */}
            <FlatList
                data={filteredProducts}
                numColumns={2}
                renderItem={renderProduct}
                keyExtractor={item => item._id || item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetchProducts} />
                }
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No items found</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
    },
    cartButton: {
        padding: 5,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.secondary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.text,
    },
    filterButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryChipActive: {
        backgroundColor: Colors.text,
        borderColor: Colors.text,
    },
    categoryText: {
        fontSize: 14,
        color: Colors.text,
    },
    categoryTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 55) / 2,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        height: 180,
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: Colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    }
});
