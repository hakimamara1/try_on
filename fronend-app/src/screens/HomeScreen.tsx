import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingBag, Shirt, Sparkles, Star } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { getProducts, getCategories, getProduct } from '../api/products';
import { getLoyaltyInfo } from '../api/loyalty';
import { getHeroes, Hero } from '../api/hero';
import { useCart } from '../context/CartContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');



export default function HomeScreen({ navigation }: any) {
    const { count } = useCart();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [products, setProducts] = React.useState<any[]>([]);
    const [heroSlides, setHeroSlides] = React.useState<Hero[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [points, setPoints] = React.useState(0);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsData, categoriesData, heroesData] = await Promise.all([
                getProducts(),
                getCategories(),
                getHeroes()
            ]);
            setProducts(productsData.data || productsData);
            setHeroSlides(heroesData);
            const catList = categoriesData.data ? categoriesData.data.map((c: any) => c.name) : [];
            setCategories(catList);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPoints();
        }, [])
    );

    const fetchPoints = async () => {
        try {
            const data = await getLoyaltyInfo();
            setPoints(data.points);

            // Pop animation when points update
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.ease),
                })
            ]).start();
        } catch (error) {
            console.error('Failed to fetch points', error);
        }
    };

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const handleHeroPress = async (slide: Hero) => {
        if (slide.linkType === 'product' && slide.linkValue) {
            try {
                // Fetch product details first to pass valid object
                const product = await getProduct(slide.linkValue);
                if (product && product.data) {
                    navigation.navigate('ProductDetails', { product: product.data });
                } else {
                    // Fallback or error handling
                    console.warn('Product not found');
                }
            } catch (err) {
                console.error('Failed to navigate to product', err);
            }
        } else if (slide.linkType === 'category') {
            // Navigate to shop with category
            navigation.navigate('Shop', { category: slide.linkValue });
        } else {
            // Default action
            navigation.navigate('Shop');
        }
    };
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
                            <Star size={18} fill={Colors.primary} color={Colors.primary} />
                            <Text style={styles.pointsText}>{points}</Text>
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        activeOpacity={0.7}
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
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Hero Banner */}
                {/* Hero Carousel */}
                <View>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.heroCarousel}
                    >
                        {heroSlides.map((slide) => (
                            <View key={slide._id} style={styles.heroSlide}>
                                <Image source={{ uri: slide.image }} style={styles.heroImage} />
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

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {heroSlides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeIndex === index ? styles.dotActive : styles.dotInactive
                                ]}
                            />
                        ))}
                    </View>
                </View>




                {/* Products Grid */}
                <View style={styles.productsGrid}>
                    {products.map((item) => (
                        <TouchableOpacity
                            key={item._id || item.id}
                            style={styles.productCard}
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                            activeOpacity={0.9}
                        >
                            <View style={styles.productImageContainer}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                                {item.discount && (
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>{item.discount}</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.tryOnButton}>
                                    <Shirt size={16} color={Colors.surface} />
                                    <Text style={styles.tryOnText}>Try On</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.productPrice}>${item.price}</Text>
                                    {item.originalPrice && (
                                        <Text style={styles.productOldPrice}>${item.originalPrice}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Reward Banner */}
                <View style={styles.rewardBanner}>
                    <Text style={styles.rewardText}>✨ You have 120 points – Invite friends & earn discounts</Text>
                </View>
            </ScrollView>
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
    logo: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 1,
        color: Colors.text,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
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
    heroCarousel: {
        marginTop: 10,
        height: 400,
    },
    heroSlide: {
        width: width, // Full width
        height: 400,
        position: 'relative',
    },
    heroImage: {
        width: width - 40, // Add margin inside
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 20,
        marginHorizontal: 20,
        backgroundColor: '#ccc',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: Colors.text,
        width: 20, // stretch active dot
    },
    dotInactive: {
        backgroundColor: Colors.border,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 20, // Match slide margin
        right: 20, // Match slide margin
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.3)', // subtle text protection
        alignItems: 'flex-start',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#eee',
        marginBottom: 16,
    },
    heroButton: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
    },
    heroButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    categoriesContainer: {
        marginTop: 24,
        paddingLeft: 20,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#eee',
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
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 24,
    },
    productCard: {
        width: (width - 55) / 2, // 2 column grid
        marginBottom: 24,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        paddingBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    productImageContainer: {
        height: 220,
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tryOnButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    tryOnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    productInfo: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    productName: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    productOldPrice: {
        fontSize: 14,
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    rewardBanner: {
        margin: 20,
        padding: 16,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        alignItems: 'center',
    },
    rewardText: {
        color: '#fff',
        fontWeight: '600',
    },
    pointsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        gap: 6,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    }
});
