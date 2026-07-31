import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, TextInput, LayoutAnimation, Platform, UIManager, Animated, Easing, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ShoppingCart, Heart, Check, Trash, ChevronLeft } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { toggleWishlist, getMe } from '../api/auth';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProduct, useRelatedProducts, useReviews, useAddReview, useDeleteReview } from '../hooks/useProductDetails';
import { Review } from '../types';

const { width, height } = Dimensions.get('window');
const GALLERY_HEIGHT = height * 0.52;

// review.user comes back as either a populated { _id, name } or a bare id
// string depending on the endpoint/population state.
const getReviewUserId = (review: Review): string | undefined =>
    typeof review.user === 'string' ? review.user : review.user?._id;

const getReviewUserName = (review: Review): string | undefined =>
    typeof review.user === 'string' ? undefined : review.user?.name;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StarRating = ({ value, size = 12 }: { value: number; size?: number }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={size} fill={n <= Math.round(value) ? Colors.accent : 'transparent'} stroke={Colors.accent} />
        ))}
    </View>
);

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { product: passedProduct, productId } = route.params || {};
    const id = passedProduct?._id || productId;

    const { data: product, isLoading: productLoading } = useProduct(id, passedProduct);
    const { data: relatedProducts = [] } = useRelatedProducts(product?._id);
    const { data: reviews = [] } = useReviews(product?._id);
    const addReviewMutation = useAddReview(product?._id);
    const deleteReviewMutation = useDeleteReview(product?._id);

    const [selectedSize, setSelectedSize] = useState(passedProduct?.sizes?.[0] || '');
    const [selectedColor, setSelectedColor] = useState(passedProduct?.colors?.[0] || '');
    const [activeSlide, setActiveSlide] = useState(0);
    const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isAdded, setIsAdded] = useState(false);

    const galleryRef = useRef<ScrollView>(null);
    const heartScale = useRef(new Animated.Value(1)).current;
    const addPulse = useRef(new Animated.Value(1)).current;

    const { user } = useAuth();
    const { addToCart } = useCart();
    const queryClient = useQueryClient();

    // Shares the exact ['user', 'me'] cache WishlistScreen reads, seeded from
    // AuthContext's already-loaded user so there's no loading flash. Toggling
    // here writes through the same cache entry, so the Wishlist screen shows
    // the change immediately instead of only after its own refetch/restart.
    const { data: meData } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => (await getMe()).data,
        initialData: user ?? undefined,
        enabled: !!user,
    });

    const isWishlisted = !!product && (meData?.wishlist?.some((p: any) => (p?._id ?? p) === product._id) ?? false);

    // Reset the size/color selectors whenever we land on a (possibly
    // different) product, e.g. pushing into a related product's details.
    useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes?.[0] || '');
            setSelectedColor(product.colors?.[0] || '');
            setActiveSlide(0);
        }
    }, [product?._id]);

    const pulseHeart = () => {
        heartScale.setValue(1);
        Animated.sequence([
            Animated.timing(heartScale, { toValue: 1.4, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(heartScale, { toValue: 0.9, duration: 100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(heartScale, { toValue: 1, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]).start();
    };

    const toggleWishlistMutation = useMutation({
        mutationFn: (productId: string) => toggleWishlist(productId),
        onMutate: async (productId: string) => {
            await queryClient.cancelQueries({ queryKey: ['user', 'me'] });
            const previousMe = queryClient.getQueryData(['user', 'me']);

            queryClient.setQueryData(['user', 'me'], (old: any) => {
                if (!old) return old;
                const exists = old.wishlist?.some((p: any) => (p?._id ?? p) === productId);
                return {
                    ...old,
                    wishlist: exists
                        ? old.wishlist.filter((p: any) => (p?._id ?? p) !== productId)
                        // We have the full product object on this screen, so unlike
                        // WishlistScreen's own toggle, adding can be optimistic too.
                        : [...(old.wishlist || []), product],
                };
            });

            return { previousMe };
        },
        onError: (_err, _productId, context) => {
            if (context?.previousMe) {
                queryClient.setQueryData(['user', 'me'], context.previousMe);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });

    const handleToggleWishlist = () => {
        if (!user) {
            Alert.alert(
                "Login Required",
                "Please login to add items to your wishlist",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }
        if (!product) return;
        pulseHeart();
        toggleWishlistMutation.mutate(product._id);
    };

    const openReviewSheet = () => {
        setNewReview({ rating: 5, comment: '' });
        setReviewSheetOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!user) {
            setReviewSheetOpen(false);
            Alert.alert(
                "Login Required",
                "Please login to write a review",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        if (!newReview.comment) {
            Alert.alert('Error', 'Please add a comment');
            return;
        }

        try {
            await addReviewMutation.mutateAsync(newReview);
            setReviewSheetOpen(false);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to add review';
            Alert.alert('Error', message);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        Alert.alert(
            "Delete Review",
            "Are you sure you want to delete this review?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteReviewMutation.mutateAsync(reviewId);
                        } catch (error: any) {
                            const message = error.response?.data?.error || 'Failed to delete review';
                            Alert.alert('Error', message);
                        }
                    }
                }
            ]
        );
    };

    const handleAddToCart = () => {
        if (isAdded) {
            navigation.navigate('Cart' as never);
            return;
        }
        if (!product) return;

        addToCart(product, selectedSize, selectedColor);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsAdded(true);
        addPulse.setValue(1);
        Animated.sequence([
            Animated.timing(addPulse, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(addPulse, { toValue: 1, duration: 160, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]).start();
    };

    const goToSlide = (index: number) => {
        setActiveSlide(index);
        galleryRef.current?.scrollTo({ x: index * width, animated: true });
    };

    if (productLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.sansRegular }}>Loading...</Text>
            </View>
        );
    }

    if (!product) return null;

    const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 70 }} showsVerticalScrollIndicator={false}>
                {/* Gallery */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        ref={galleryRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const slide = Math.round(e.nativeEvent.contentOffset.x / width);
                            if (slide !== activeSlide) setActiveSlide(slide);
                        }}
                        scrollEventThrottle={16}
                    >
                        {galleryImages.map((img: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={styles.image}
                                contentFit="cover"
                                placeholder={require('../../assets/icon.png')}
                            />
                        ))}
                    </ScrollView>

                    {/* Tap zones for prev/next, mirroring the design's split-image nav */}
                    {galleryImages.length > 1 && (
                        <>
                            <Pressable
                                style={styles.galleryTapZoneLeft}
                                onPress={() => goToSlide(Math.max(0, activeSlide - 1))}
                            />
                            <Pressable
                                style={styles.galleryTapZoneRight}
                                onPress={() => goToSlide(Math.min(galleryImages.length - 1, activeSlide + 1))}
                            />
                        </>
                    )}

                    <View style={[styles.glassButton, styles.backButtonFloating]}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                        <TouchableOpacity style={styles.glassButtonTouch} onPress={() => navigation.goBack()}>
                            <ChevronLeft size={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={[styles.glassButton, styles.wishlistButtonFloating, { transform: [{ scale: heartScale }] }]}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                        <TouchableOpacity
                            style={styles.glassButtonTouch}
                            onPress={handleToggleWishlist}
                            testID="wishlist-toggle-button"
                            accessibilityRole="button"
                            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            accessibilityState={{ selected: isWishlisted }}
                        >
                            <Heart
                                size={17}
                                color={Colors.text}
                                fill={isWishlisted ? Colors.secondary : 'transparent'}
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    {galleryImages.length > 1 && (
                        <View style={styles.pagination}>
                            {galleryImages.map((_: string, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.content}>
                    <Text style={styles.title}>{product.name}</Text>
                    <View style={styles.ratingRow}>
                        <StarRating value={product.rating || 0} size={14} />
                        <Text style={styles.ratingNum}>{(product.rating || 0).toFixed(1)}</Text>
                        <Text style={styles.ratingCount}>· {reviews.length} reviews</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>DA{product.price}</Text>
                        {product.originalPrice && (
                            <Text style={styles.oldPrice}>DA{product.originalPrice}</Text>
                        )}
                    </View>

                    <Text style={styles.description}>
                        {product.description || "Elevate your wardrobe with this stunning piece designed for the modern elegant woman. Crafted from high-quality fabrics offering both comfort and luxury."}
                    </Text>

                    {/* Color Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <View style={styles.selectorGroup}>
                            <Text style={styles.sectionLabel}>
                                Color — <Text style={styles.sectionLabelValue}>{selectedColor || product.colors[0]}</Text>
                            </Text>
                            <View style={styles.colorRow}>
                                {product.colors.map((color: string, index: number) => {
                                    const selected = selectedColor === color;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.colorRing, selected && styles.colorRingSelected]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <View style={styles.selectorGroup}>
                            <Text style={styles.sectionLabel}>Size</Text>
                            <View style={styles.sizeRow}>
                                {product.sizes.map((size: string, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.sizeOption,
                                            selectedSize === size && styles.sizeSelected
                                        ]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[
                                            styles.sizeText,
                                            selectedSize === size && styles.sizeTextSelected
                                        ]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Style Inspiration */}
                    {relatedProducts.length > 0 && (
                        <View style={styles.similarSection}>
                            <Text style={styles.sectionHeading}>Style Inspiration</Text>
                            <Text style={styles.sectionSubheading}>Complete the look</Text>
                            <View style={styles.gridContainer}>
                                {relatedProducts.map((item) => (
                                    <TouchableOpacity
                                        key={item._id}
                                        style={styles.similarCard}
                                        onPress={() => navigation.push('ProductDetails', { product: item })}
                                        activeOpacity={0.9}
                                    >
                                        <Image source={{ uri: item.image }} style={styles.similarImage} contentFit="cover" />
                                        <Text style={styles.similarTitle} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.similarPrice}>${item.price}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeading}>Reviews</Text>
                            <TouchableOpacity onPress={openReviewSheet}>
                                <Text style={styles.writeReviewText}>Write a review</Text>
                            </TouchableOpacity>
                        </View>

                        {reviews.map((review, index) => (
                            <View key={index} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{getReviewUserName(review) || 'User'}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Text style={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</Text>
                                        {user && user._id === getReviewUserId(review) && (
                                            <TouchableOpacity onPress={() => handleDeleteReview(review._id)}>
                                                <Trash size={14} color={Colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <StarRating value={review.rating} />
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={styles.tryOnButton}
                        onPress={() => navigation.navigate('TryOn', {
                            productImage: product.pureImage || product.image,
                            productName: product.name
                        })}
                    >
                        <Text style={styles.tryOnButtonText}>Try it on me</Text>
                    </TouchableOpacity>

                    <Animated.View style={[styles.addToCartWrap, { transform: [{ scale: addPulse }] }]}>
                        <TouchableOpacity
                            style={[styles.addToCartButton, isAdded && styles.goToCartButton]}
                            onPress={handleAddToCart}
                            activeOpacity={0.85}
                        >
                            {isAdded ? (
                                <Check size={18} color={Colors.text} />
                            ) : (
                                <ShoppingCart size={18} color={Colors.darkText} />
                            )}
                            <Text style={[styles.addToCartText, isAdded && styles.goToCartText]}>
                                {isAdded ? "Go to Cart" : "Add to Cart"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>

            {/* Write a Review — bottom sheet */}
            <Modal
                visible={reviewSheetOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setReviewSheetOpen(false)}
            >
                <Pressable style={styles.sheetScrim} onPress={() => setReviewSheetOpen(false)} />
                <View style={styles.reviewSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Write a Review</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity key={s} onPress={() => setNewReview({ ...newReview, rating: s })}>
                                <Star
                                    size={30}
                                    fill={s <= newReview.rating ? Colors.primary : 'transparent'}
                                    stroke={s <= newReview.rating ? Colors.primary : Colors.borderStrong}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Share your experience with this piece…"
                        placeholderTextColor={Colors.textLight}
                        multiline
                        value={newReview.comment}
                        onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
                    />
                    <TouchableOpacity style={styles.submitReviewButton} onPress={handleSubmitReview}>
                        <Text style={styles.submitReviewText}>Submit Review</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    imageContainer: {
        width: width,
        height: GALLERY_HEIGHT,
        backgroundColor: Colors.surfaceSunken,
    },
    image: {
        width: width,
        height: '100%',
    },
    galleryTapZoneLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '50%',
    },
    galleryTapZoneRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '50%',
    },
    glassButton: {
        position: 'absolute',
        top: 56,
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
    },
    glassButtonTouch: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonFloating: {
        left: 20,
    },
    wishlistButtonFloating: {
        right: 20,
    },
    pagination: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    paginationDot: {
        height: 6,
        borderRadius: 3,
    },
    paginationDotActive: {
        width: 18,
        backgroundColor: Colors.text,
    },
    paginationDotInactive: {
        width: 6,
        backgroundColor: 'rgba(28,24,21,0.25)',
    },
    content: {
        padding: 20,
        backgroundColor: Colors.background,
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 25,
        lineHeight: 30,
        color: Colors.text,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    ratingNum: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 13,
        color: Colors.text,
    },
    ratingCount: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textLight,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 10,
    },
    price: {
        fontFamily: Fonts.sansBold,
        fontSize: 20,
        color: Colors.text,
    },
    oldPrice: {
        fontFamily: Fonts.sansRegular,
        fontSize: 15,
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    description: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textSecondary,
        marginTop: 14,
    },
    selectorGroup: {
        marginTop: 22,
    },
    sectionLabel: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 13,
        color: Colors.text,
    },
    sectionLabelValue: {
        color: Colors.secondary,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    colorRing: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorRingSelected: {
        borderColor: Colors.text,
    },
    colorSwatch: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(28,24,21,0.1)',
    },
    sizeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        flexWrap: 'wrap',
    },
    sizeOption: {
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.borderStrong,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeSelected: {
        backgroundColor: Colors.text,
        borderColor: Colors.text,
    },
    sizeText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    sizeTextSelected: {
        color: Colors.darkText,
    },
    sectionHeading: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
    },
    sectionSubheading: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    similarSection: {
        marginTop: 32,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    similarCard: {
        width: '48%',
        marginBottom: 16,
    },
    similarImage: {
        width: '100%',
        aspectRatio: 1 / 1.15,
        borderRadius: 12,
        backgroundColor: Colors.surfaceSunken,
    },
    similarTitle: {
        fontFamily: Fonts.sansMedium,
        fontSize: 13,
        color: Colors.text,
        marginTop: 8,
    },
    similarPrice: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
        marginTop: 2,
    },
    reviewsSection: {
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    writeReviewText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.secondary,
    },
    reviewCard: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewerName: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 13,
        color: Colors.text,
    },
    reviewDate: {
        fontFamily: Fonts.sansRegular,
        fontSize: 11,
        color: Colors.textLight,
    },
    reviewComment: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        lineHeight: 20,
        color: Colors.textSecondary,
        marginTop: 6,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.94)',
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    tryOnButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: Colors.text,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tryOnButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.text,
    },
    addToCartWrap: {
        flex: 1.3,
    },
    addToCartButton: {
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.text,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.darkText,
    },
    goToCartButton: {
        backgroundColor: Colors.surfaceSunken,
    },
    goToCartText: {
        color: Colors.text,
    },
    // ─── Review Sheet ─────────────────────────────────────
    sheetScrim: {
        flex: 1,
        backgroundColor: 'rgba(28,24,21,0.45)',
    },
    reviewSheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,
    },
    sheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.borderStrong,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 16,
    },
    reviewInput: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 12,
        height: 90,
        textAlignVertical: 'top',
        borderWidth: 1.5,
        borderColor: Colors.borderStrong,
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.text,
    },
    submitReviewButton: {
        backgroundColor: Colors.text,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
    },
    submitReviewText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.darkText,
    },
});
