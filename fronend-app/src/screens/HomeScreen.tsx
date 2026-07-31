import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    ScrollView,
    RefreshControl,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { getProduct } from '../api/products';
import { getLoyaltyInfo } from '../api/loyalty';
import { Hero } from '../api/hero';
import { useProducts } from '../hooks/useProducts';
import { useHeroes } from '../hooks/useHeroes';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductRow from '../components/ProductRow';

// Signature Rewards banner is a decorative progress indicator toward a
// synthetic "Atelier Tier" threshold — no backend tier concept exists yet.
const ATELIER_TIER_THRESHOLD = 2000;

// ─── Hero Skeleton ───────────────────────────────────────
const HeroSkeleton = ({ width: w }: { width: number }) => (
    <View style={[styles.heroSlide, { width: w }]}>
        <View style={[styles.heroImage, { width: w - 40, backgroundColor: Colors.surfaceSunken }]} />
    </View>
);

// ─── Auto-Scroll Interval ────────────────────────────────
const AUTO_SCROLL_INTERVAL = 4200;

// ─── Main Component ──────────────────────────────────────
export default function HomeScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
    const { width } = useWindowDimensions();
    const { count } = useCart();
    const { user } = useAuth();

    const [activeIndex, setActiveIndex] = React.useState(0);
    const [points, setPoints] = React.useState(0);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const heroScrollRef = useRef<ScrollView>(null);
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    // ─── React Query Hooks ───────────────────────────────
    const { data: heroSlides, isLoading: loadingHeroes, refetch: refetchHeroes } = useHeroes();

    // Promo and Newest Arrivals both want the same latest-6-products query
    // (same sort/limit) — fetch it once and derive both sections from it
    // instead of firing two near-duplicate /products requests.
    const {
        data: homeData,
        isLoading: loadingHome,
        refetch: refetchHome,
        isRefetching: isRefetchingHome,
        isError: homeError,
    } = useProducts({
        limit: 6,
        sort: '-createdAt',
        select: 'name,price,image,discount,originalPrice,pureImage,tags',
    });

    const {
        data: bestBuyData,
        isLoading: loadingBest,
        refetch: refetchBest,
        isError: bestBuyError,
    } = useProducts({
        limit: 6,
        sort: '-rating,-reviews',
        select: 'name,price,image,rating,reviews,pureImage',
    });

    const heroes: Hero[] = heroSlides ?? [];

    const promoProducts: Product[] = homeData?.data?.filter(p => p.tags?.includes('promo')) ?? [];
    const newestProducts: Product[] = homeData?.data ?? [];
    const bestBuyProducts: Product[] = bestBuyData?.data ?? [];

    const isRefreshing = isRefetchingHome;
    const handleRefresh = useCallback(() => {
        refetchHeroes();
        refetchHome();
        refetchBest();
    }, [refetchHeroes, refetchHome, refetchBest]);

    // ─── Loyalty Points ──────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchPoints();
            } else {
                setPoints(0);
            }
        }, [user])
    );

    const fetchPoints = async () => {
        try {
            const data = await getLoyaltyInfo();
            setPoints(data.points);
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
            ]).start();
        } catch {
            // Silently swallow
        }
    };

    // ─── Hero Auto-Scroll ────────────────────────────────
    useEffect(() => {
        if (heroes.length <= 1) return;

        autoScrollTimer.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % heroes.length;
                heroScrollRef.current?.scrollTo({ x: next * width, animated: true });
                return next;
            });
        }, AUTO_SCROLL_INTERVAL);

        return () => {
            if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        };
    }, [heroes.length, width]);

    const handleScroll = useCallback((event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setActiveIndex(index);
    }, []);

    const handleScrollBeginDrag = useCallback(() => {
        // Pause auto-scroll on user touch
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    }, []);

    const handleScrollEndDrag = useCallback(() => {
        // Resume auto-scroll after user releases
        if (heroes.length <= 1) return;
        autoScrollTimer.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % heroes.length;
                heroScrollRef.current?.scrollTo({ x: next * width, animated: true });
                return next;
            });
        }, AUTO_SCROLL_INTERVAL);
    }, [heroes.length, width]);

    const handleHeroPress = useCallback(async (slide: Hero) => {
        if (slide.linkType === 'product' && slide.linkValue) {
            try {
                const product = await getProduct(slide.linkValue);
                if (product?.data) {
                    navigation.navigate('ProductDetails', { product: product.data });
                }
            } catch { /* silently fail */ }
        } else if (slide.linkType === 'category') {
            navigation.navigate('Shop', { category: slide.linkValue });
        } else {
            navigation.navigate('Shop');
        }
    }, [navigation]);

    // ─── Navigation Helpers ──────────────────────────────
    const handleProductPress = useCallback((productId: string) => {
        navigation.navigate('ProductDetails', { productId });
    }, [navigation]);

    const handleTryOn = useCallback((product: Product) => {
        navigation.navigate('TryOn', {
            productImage: product.pureImage || product.image,
            productName: product.name,
        });
    }, [navigation]);

    const pointsToNextTier = Math.max(0, ATELIER_TIER_THRESHOLD - points);
    const tierProgressPct = Math.min(100, (points / ATELIER_TIER_THRESHOLD) * 100);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>ZED DREAM</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.pointsButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Points')}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={styles.pointsDot} />
                            <Text style={styles.pointsText}>{points.toLocaleString()} pts</Text>
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        activeOpacity={0.7}
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
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
            >
                {(homeError || bestBuyError) && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>Couldn't reach the server — pull down to try again.</Text>
                    </View>
                )}

                {/* ─── Hero Carousel ──────────────────────── */}
                {loadingHeroes ? (
                    <HeroSkeleton width={width} />
                ) : heroes.length > 0 ? (
                    <View>
                        <ScrollView
                            ref={heroScrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            onScrollBeginDrag={handleScrollBeginDrag}
                            onScrollEndDrag={handleScrollEndDrag}
                            scrollEventThrottle={16}
                            style={styles.heroCarousel}
                        >
                            {heroes.map((slide) => (
                                <View key={slide._id} style={[styles.heroSlide, { width }]}>
                                    <Image
                                        source={{ uri: slide.image }}
                                        style={[styles.heroImage, { width: width - 40 }]}
                                        contentFit="cover"
                                        placeholder={require('../../assets/icon.png')}
                                    />
                                    <LinearGradient
                                        colors={['rgba(14,13,12,0)', 'rgba(14,13,12,0.78)']}
                                        style={[styles.heroScrim, { width: width - 40 }]}
                                        pointerEvents="none"
                                    />
                                    <View style={styles.heroOverlay}>
                                        <Text style={styles.heroTitle}>{slide.title}</Text>
                                        <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                                        <TouchableOpacity
                                            style={styles.heroButton}
                                            activeOpacity={0.8}
                                            onPress={() => handleHeroPress(slide)}
                                        >
                                            <Text style={styles.heroButtonText}>{slide.ctaText}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.pagination}>
                            {heroes.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        activeIndex === index ? styles.dotActive : styles.dotInactive,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* ─── Under the Spotlight (promo) ─────────── */}
                {promoProducts.length > 0 && <ProductRow
                    title="Under the Spotlight"
                    subtitle="Limited-time offers"
                    variant="promo"
                    products={promoProducts}
                    loading={loadingHome}
                    onViewAll={() => navigation.navigate('Shop')}
                    onProductPress={handleProductPress}
                    onTryOn={handleTryOn}
                />}

                {/* ─── Newest Arrivals ──────────────────────── */}
                <ProductRow
                    title="Newest Arrivals"
                    subtitle="Just landed this week"
                    variant="new"
                    products={newestProducts}
                    loading={loadingHome}
                    onViewAll={() => navigation.navigate('Shop')}
                    onProductPress={handleProductPress}
                    onTryOn={handleTryOn}
                />

                {/* ─── Best Buy ────────────────────────────── */}
                <ProductRow
                    title="Best Buy"
                    subtitle="Loved again and again"
                    variant="bestBuy"
                    products={bestBuyProducts}
                    loading={loadingBest}
                    onViewAll={() => navigation.navigate('Shop')}
                    onProductPress={handleProductPress}
                    onTryOn={handleTryOn}
                />

                {/* ─── Reward Banner ──────────────────────── */}
                <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Points')}>
                    <LinearGradient
                        colors={['#2A2521', '#1C1815']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.rewardBanner}
                    >
                        <Text style={styles.rewardEyebrow}>Signature Rewards</Text>
                        <Text style={styles.rewardHeadline}>
                            {pointsToNextTier > 0 ? `${pointsToNextTier.toLocaleString()} points to Atelier Tier` : 'Atelier Tier unlocked'}
                        </Text>
                        <View style={styles.rewardTrack}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.primaryLight]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.rewardFill, { width: `${tierProgressPct}%` }]}
                            />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
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
    logo: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 23,
        letterSpacing: 0.2,
        color: Colors.text,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconButton: {
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
    // ─── Hero ────────────────────────────────────────────
    heroCarousel: {
        marginTop: 6,
        height: 280,
    },
    heroSlide: {
        height: 280,
        position: 'relative',
    },
    heroImage: {
        height: '100%',
        borderRadius: 20,
        marginHorizontal: 20,
        backgroundColor: Colors.surfaceSunken,
    },
    heroScrim: {
        position: 'absolute',
        left: 20,
        bottom: 0,
        height: '65%',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    dotActive: {
        backgroundColor: Colors.text,
        width: 18,
    },
    dotInactive: {
        backgroundColor: 'rgba(28,24,21,0.25)',
        width: 6,
    },
    heroOverlay: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 20,
        alignItems: 'flex-start',
    },
    heroTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 22,
        lineHeight: 26,
        color: Colors.darkText,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: 'rgba(247,243,236,0.85)',
        marginBottom: 12,
    },
    heroButton: {
        backgroundColor: Colors.darkText,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    heroButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.text,
    },
    // ─── Reward Banner ───────────────────────────────────
    rewardBanner: {
        marginHorizontal: 20,
        marginTop: 32,
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    rewardEyebrow: {
        fontFamily: Fonts.sansBold,
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: Colors.primary,
    },
    rewardHeadline: {
        fontFamily: Fonts.serifMedium,
        fontSize: 16,
        color: Colors.darkText,
        marginTop: 6,
    },
    rewardTrack: {
        height: 6,
        backgroundColor: 'rgba(247,243,236,0.15)',
        borderRadius: 3,
        marginTop: 14,
        overflow: 'hidden',
    },
    rewardFill: {
        height: '100%',
        borderRadius: 3,
    },
    // ─── Error banner ─────────────────────────────────────
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
    // ─── Points ──────────────────────────────────────────
    pointsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
        paddingVertical: 7,
        backgroundColor: Colors.surfaceSunken,
        borderRadius: 20,
    },
    pointsDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    pointsText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.primaryDark,
    },
});
