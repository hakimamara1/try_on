import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Shirt, Star } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { Product } from '../types';

export type ProductRowVariant = 'promo' | 'new' | 'bestBuy';

interface ProductRowProps {
    title: string;
    subtitle?: string;
    variant?: ProductRowVariant;
    products: Product[];
    loading?: boolean;
    onViewAll?: () => void;
    onProductPress: (productId: string) => void;
    onTryOn?: (product: Product) => void;
}

// ─── Skeleton Card ───────────────────────────────────────
const CardSkeleton = ({ cardWidth }: { cardWidth: number }) => (
    <View style={[styles.card, { width: cardWidth }]}>
        <View style={[styles.imageBox, { backgroundColor: Colors.surfaceSunken }]} />
        <View style={styles.infoBox}>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: Colors.surfaceSunken, width: '70%' }} />
            <View style={{ height: 10, borderRadius: 5, backgroundColor: Colors.surfaceSunken, width: '45%', marginTop: 6 }} />
        </View>
    </View>
);

// ─── Main Component ──────────────────────────────────────
export default function ProductRow({
    title,
    subtitle,
    variant = 'new',
    products,
    loading = false,
    onViewAll,
    onProductPress,
    onTryOn,
}: ProductRowProps) {
    const { width } = useWindowDimensions();
    const cardWidth = width * 0.4;
    const itemLength = cardWidth + styles.card.marginRight;

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => onProductPress(item._id)}
            activeOpacity={0.9}
        >
            <View style={[styles.imageBox, variant === 'new' && styles.imageBoxOutlined]}>
                <Image
                    source={{ uri: item.image || undefined }}
                    style={styles.image}
                    contentFit="cover"
                    placeholder={require('../../assets/icon.png')}
                />
                {variant === 'promo' && item.discount ? (
                    <View style={styles.saleBadge}>
                        <Text style={styles.saleBadgeText}>SALE</Text>
                    </View>
                ) : null}
                {variant === 'bestBuy' && item.rating ? (
                    <View style={styles.ratingPill}>
                        <Star size={11} fill={Colors.primary} color={Colors.primary} />
                        <Text style={styles.ratingPillText}>{item.rating.toFixed(1)}</Text>
                    </View>
                ) : null}
                {onTryOn && (
                    <TouchableOpacity
                        style={styles.tryOnBtn}
                        onPress={() => onTryOn(item)}
                    >
                        <Shirt size={14} color={Colors.darkText} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.infoBox}>
                {variant === 'new' && <Text style={styles.newLabel}>New</Text>}
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
                    {variant === 'promo' && item.originalPrice ? (
                        <Text style={styles.oldPrice}>${item.originalPrice}</Text>
                    ) : null}
                    {variant === 'bestBuy' && item.reviews ? (
                        <Text style={styles.reviewCount}>{item.reviews} reviews</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    ), [cardWidth, onProductPress, onTryOn, variant]);

    const getItemLayout = useCallback((_data: ArrayLike<Product | number> | null | undefined, index: number) => ({
        length: itemLength,
        offset: itemLength * index,
        index,
    }), [itemLength]);

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={[styles.subtitle, variant === 'promo' && styles.subtitlePromo]}>{subtitle}</Text> : null}
                </View>
                {onViewAll && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Text style={styles.viewAll}>See all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Horizontal List */}
            {loading ? (
                <FlatList
                    horizontal
                    data={[1, 2, 3]}
                    keyExtractor={(item) => String(item)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={() => <CardSkeleton cardWidth={cardWidth} />}
                    getItemLayout={getItemLayout}
                />
            ) : products.length > 0 ? (
                <FlatList
                    horizontal
                    data={products}
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                />
            ) : null}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        marginTop: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    subtitle: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    subtitlePromo: {
        color: Colors.secondary,
    },
    viewAll: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 12,
        color: Colors.textSecondary,
    },
    list: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    card: {
        marginRight: 14,
        backgroundColor: 'transparent',
        borderRadius: 14,
    },
    imageBox: {
        height: 190,
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: Colors.surfaceSunken,
    },
    imageBoxOutlined: {
        borderWidth: 1,
        borderColor: Colors.border,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    saleBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    saleBadgeText: {
        fontFamily: Fonts.sansBold,
        color: Colors.text,
        fontSize: 10,
        letterSpacing: 0.3,
    },
    ratingPill: {
        position: 'absolute',
        left: 8,
        bottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.darkSurface,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingPillText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 11,
    },
    tryOnBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: Colors.darkSurface,
        padding: 6,
        borderRadius: 16,
    },
    infoBox: {
        paddingTop: 10,
    },
    newLabel: {
        fontFamily: Fonts.sansBold,
        fontSize: 10,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: Colors.primary,
        marginBottom: 3,
    },
    name: {
        fontFamily: Fonts.sansMedium,
        fontSize: 14,
        color: Colors.text,
        marginBottom: 3,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    price: {
        fontFamily: Fonts.sansBold,
        fontSize: 15,
        color: Colors.text,
    },
    oldPrice: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    reviewCount: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
