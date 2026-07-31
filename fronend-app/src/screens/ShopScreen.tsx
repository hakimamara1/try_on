import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Modal,
    Pressable,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, ShoppingBag, X, Check } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import { useCart } from '../context/CartContext';
import { Product, Category, ProductQueryParams } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Sort Options ────────────────────────────────────────
const SORT_OPTIONS = [
    { label: 'Newest', value: '-createdAt' },
    { label: 'Price: Low → High', value: 'price' },
    { label: 'Price: High → Low', value: '-price' },
    { label: 'Name: A → Z', value: 'name' },
] as const;

// ─── Skeleton Placeholder ────────────────────────────────
const ProductSkeleton = ({ cardWidth }: { cardWidth: number }) => (
    <View style={[styles.productCard, { width: cardWidth }]}>
        <View style={[styles.imageContainer, styles.skeletonBg]} />
        <View style={styles.productInfo}>
            <View style={[styles.skeletonLine, { width: '75%' }]} />
            <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
        </View>
    </View>
);

const SkeletonGrid = ({ cardWidth }: { cardWidth: number }) => (
    <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
            <ProductSkeleton key={i} cardWidth={cardWidth} />
        ))}
    </View>
);

// ─── Main Component ──────────────────────────────────────
export default function ShopScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
    const { width } = useWindowDimensions();
    const cardWidth = (width - 54) / 2;
    const { count } = useCart();

    // Local UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
    const [activeSort, setActiveSort] = useState('-createdAt');
    const [showSortModal, setShowSortModal] = useState(false);

    // Debounce the search input by 400ms
    const debouncedSearch = useDebounce(searchQuery, 400);

    // Build server-side query params
    const queryParams: ProductQueryParams = {
        sort: activeSort,
        select: 'name,price,image,discount,category',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(activeCategoryId ? { category: activeCategoryId } : {}),
    };

    // React Query hooks
    const {
        data: productsData,
        isLoading: loadingProducts,
        refetch: refetchProducts,
        isRefetching,
        isError: productsError,
    } = useProducts(queryParams);

    const { data: categoriesData, isLoading: loadingCategories } = useCategories();

    // Derived data
    const products: Product[] = productsData?.data ?? [];
    const categories: Category[] = categoriesData?.data ?? [];
    const loading = loadingProducts || loadingCategories;

    // Handle category tap
    const handleCategoryPress = useCallback((cat: string, catId?: string) => {
        setActiveCategory(cat);
        setActiveCategoryId(catId);
    }, []);

    // ─── Render Functions ────────────────────────────────
    const renderProduct = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.productCard, { width: cardWidth }]}
            onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
            activeOpacity={0.85}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image || undefined }}
                    style={styles.productImage}
                    contentFit="cover"
                    placeholder={require('../../assets/icon.png')}
                />
                {item.discount ? (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>SALE</Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
                    {item.originalPrice ? (
                        <Text style={styles.oldPrice}>${item.originalPrice}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    ), [cardWidth, navigation]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Shop</Text>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <ShoppingBag color={Colors.text} size={20} />
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
                    <Search color={Colors.textSecondary} size={19} />
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
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowSortModal(true)}
                >
                    <SlidersHorizontal color={Colors.text} size={19} />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.filtersWrapper}>
                <FlatList
                    horizontal
                    data={[{ _id: 'all', name: 'All', slug: 'all' } as Category, ...categories]}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                activeCategory === item.name && styles.categoryChipActive,
                            ]}
                            onPress={() =>
                                handleCategoryPress(
                                    item.name,
                                    item._id === 'all' ? undefined : item._id
                                )
                            }
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    activeCategory === item.name && styles.categoryTextActive,
                                ]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {productsError && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>Couldn't reach the server — pull down to try again.</Text>
                </View>
            )}

            {/* Product Grid */}
            {loading ? (
                <SkeletonGrid cardWidth={cardWidth} />
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetchProducts} tintColor={Colors.primary} />
                    }
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                {debouncedSearch
                                    ? `No results for "${debouncedSearch}"`
                                    : 'No items found'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
                    <View style={styles.sortSheet}>
                        <Text style={styles.sortSheetTitle}>Sort by</Text>
                        {SORT_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                style={styles.sortOption}
                                onPress={() => {
                                    setActiveSort(opt.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.sortOptionText,
                                        activeSort === opt.value && styles.sortOptionActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                                {activeSort === opt.value && (
                                    <Check color={Colors.primary} size={18} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────
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
        paddingVertical: 14,
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 23,
        color: Colors.text,
    },
    cartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: Colors.secondary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontFamily: Fonts.sansBold,
        fontSize: 9,
        color: Colors.darkText,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 22,
        paddingHorizontal: 14,
        height: 44,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.sansRegular,
        fontSize: 15,
        color: Colors.text,
    },
    filterButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    categoriesList: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        height: 34,
        paddingHorizontal: 16,
        borderRadius: 17,
        backgroundColor: Colors.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
    },
    categoryChipActive: {
        backgroundColor: Colors.text,
        borderColor: Colors.text,
    },
    categoryText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.text,
    },
    categoryTextActive: {
        color: Colors.darkText,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    productCard: {
        marginBottom: 18,
    },
    imageContainer: {
        aspectRatio: 1 / 1.2,
        borderRadius: 14,
        backgroundColor: Colors.surfaceSunken,
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    discountText: {
        fontFamily: Fonts.sansBold,
        color: Colors.text,
        fontSize: 10,
        letterSpacing: 0.3,
    },
    productInfo: {
        paddingTop: 8,
    },
    productName: {
        fontFamily: Fonts.sansMedium,
        fontSize: 13,
        color: Colors.text,
        marginBottom: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    productPrice: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    oldPrice: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    errorBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#FBE8E6',
    },
    errorBannerText: {
        fontFamily: Fonts.sansMedium,
        fontSize: 12,
        color: Colors.error,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontFamily: Fonts.sansRegular,
        color: Colors.textSecondary,
        fontSize: 15,
    },
    // ─── Skeleton Styles ─────────────────────────────────
    skeletonBg: {
        backgroundColor: Colors.surfaceSunken,
    },
    skeletonLine: {
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.surfaceSunken,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    // ─── Sort Modal Styles ───────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28,24,21,0.45)',
        justifyContent: 'flex-end',
    },
    sortSheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    sortSheetTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
        marginBottom: 16,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sortOptionText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 16,
        color: Colors.text,
    },
    sortOptionActive: {
        fontFamily: Fonts.sansBold,
    },
});
