import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, ShoppingCart, ArrowRight, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Styles';
import { getProduct, getRelatedProducts } from '../api/products';
import { getMe, toggleWishlist } from '../api/auth';
import { getReviews, addReview } from '../api/reviews';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { product } = route.params || {};
    const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
    const [activeSlide, setActiveSlide] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [user, setUser] = useState<any>(null);

    const { addToCart } = useCart();

    useEffect(() => {
        if (product?._id) {
            fetchData();
        }
    }, [product?._id]);

    const fetchData = async () => {
        try {
            const [related, userData, productReviews] = await Promise.all([
                getRelatedProducts(product._id),
                getMe(),
                getReviews(product._id)
            ]);

            setRelatedProducts(related.data || []);
            setUser(userData.data);
            setReviews(productReviews.data || []);

            // Check if wishlisted
            const isFav = userData.data.wishlist && userData.data.wishlist.some((p: any) => p._id === product._id || p === product._id);
            setIsWishlisted(!!isFav);

        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleToggleWishlist = async () => {
        try {
            setIsWishlisted(!isWishlisted); // Optimistic update
            await toggleWishlist(product._id);
        } catch (error) {
            setIsWishlisted(!isWishlisted); // Revert
            console.error(error);
        }
    };

    const handleSubmitReview = async () => {
        try {
            if (!newReview.comment) {
                Alert.alert('Error', 'Please add a comment');
                return;
            }
            await addReview(product._id, newReview);
            Alert.alert('Success', 'Review added!');
            setNewReview({ rating: 5, comment: '' });
            setShowReviewForm(false);
            // Refresh reviews
            const res = await getReviews(product._id);
            setReviews(res.data);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to add review';
            Alert.alert('Error', message);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, selectedSize, selectedColor);
        Alert.alert("Success", "Added to Cart!");
    };

    if (!product) return null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Gallery */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                            if (slide !== activeSlide) {
                                setActiveSlide(slide);
                            }
                        }}
                        scrollEventThrottle={16}
                    >
                        {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={styles.image}
                            />
                        ))}
                    </ScrollView>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        style={styles.paginationContainer}
                    >
                        <View style={styles.pagination}>
                            {(product.images && product.images.length > 0 ? product.images : [product.image]).map((_: any, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive
                                    ]}
                                />
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {/* Info */}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{product.name}</Text>
                        <TouchableOpacity onPress={handleToggleWishlist}>
                            <Heart
                                size={24}
                                color={Colors.primary}
                                fill={isWishlisted ? Colors.primary : 'transparent'}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ratingRow}>
                        <View style={styles.ratingContainer}>
                            <Star fill={Colors.accent} stroke={Colors.accent} size={16} />
                            <Text style={styles.ratingText}>{product.rating} ({reviews.length} reviews)</Text>
                        </View>
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
                    <Text style={styles.sectionTitle}>Color</Text>
                    <View style={styles.selectorRow}>
                        {product.colors && product.colors.length > 0 ? (
                            product.colors.map((color: string, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.colorSelected
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))
                        ) : (
                            <Text style={styles.description}>No colors available</Text>
                        )}
                    </View>

                    {/* Size Selector */}
                    <Text style={styles.sectionTitle}>Size</Text>
                    <View style={styles.selectorRow}>
                        {product.sizes && product.sizes.length > 0 ? (
                            product.sizes.map((size: string, index: number) => (
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
                            ))
                        ) : (
                            <Text style={styles.description}>No sizes available</Text>
                        )}
                    </View>

                    {/* Points Info */}
                    <View style={styles.pointsInfo}>
                        <Text style={styles.pointsText}>✨ Buy now and earn +20 points</Text>
                    </View>
                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                            <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
                                <Text style={styles.writeReviewText}>Write a Review</Text>
                            </TouchableOpacity>
                        </View>

                        {showReviewForm && (
                            <View style={styles.reviewForm}>
                                <Text style={styles.formLabel}>Rating: {newReview.rating}/5</Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <TouchableOpacity key={s} onPress={() => setNewReview({ ...newReview, rating: s })}>
                                            <Star
                                                size={24}
                                                fill={s <= newReview.rating ? Colors.accent : 'transparent'}
                                                stroke={Colors.accent}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={styles.reviewInput}
                                    placeholder="Share your thoughts..."
                                    multiline
                                    value={newReview.comment}
                                    onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
                                />
                                <TouchableOpacity style={styles.submitReviewButton} onPress={handleSubmitReview}>
                                    <Text style={styles.submitReviewText}>Submit Review</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* We need Text Input import. Let's add it to the top import first in next step or assume standard React Native import */}
                        {/* Display Reviews */}
                        {reviews.map((review, index) => (
                            <View key={index} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.user?.name || 'User'}</Text>
                                    <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.starRowSmall}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            fill={i < review.rating ? Colors.accent : 'transparent'}
                                            stroke={Colors.accent}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Similar Products */}
                    {relatedProducts.length > 0 && (
                        <View style={styles.similarSection}>
                            <Text style={styles.sectionTitle}>You might also like</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {relatedProducts.map((item) => (
                                    <TouchableOpacity
                                        key={item._id}
                                        style={styles.similarCard}
                                        onPress={() => navigation.push('ProductDetails', { product: item })}
                                    >
                                        <Image source={{ uri: item.image }} style={styles.similarImage} />
                                        <View style={styles.similarInfo}>
                                            <Text style={styles.similarTitle} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.similarPrice}>DA{item.price}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={styles.tryOnButton}
                        onPress={() => navigation.navigate('MainTabs', {
                            screen: 'TryOn',
                            params: {
                                productImage: product.pureImage || product.image
                            }
                        })}
                    >
                        <Text style={styles.tryOnButtonText}>Try it on me</Text>
                        <ArrowRight size={16} color={Colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                    >
                        <ShoppingCart size={20} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        height: height * 0.55,
        backgroundColor: '#eee',
    },
    image: {
        width: width,
        height: '100%',
        resizeMode: 'cover',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    paginationDot: {
        height: 10,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: '#fff',
    },
    paginationDotInactive: {
        width: 8,
    },
    content: {
        padding: 24,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
        marginRight: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
    },
    oldPrice: {
        fontSize: 18,
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    selectorRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    colorSelected: {
        borderWidth: 2,
        borderColor: Colors.text,
    },
    sizeOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sizeSelected: {
        backgroundColor: Colors.text,
        borderColor: Colors.text,
    },
    sizeText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    sizeTextSelected: {
        color: '#fff',
    },
    pointsInfo: {
        backgroundColor: '#FEF4F4',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    pointsText: {
        color: Colors.secondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    similarSection: {
        marginTop: 24,
        marginBottom: 20,
    },
    similarCard: {
        width: 140,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    similarImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
    },
    similarInfo: {
        gap: 4,
    },
    similarTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    similarPrice: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    ratingRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    reviewsSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    writeReviewText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    reviewForm: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    reviewInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    submitReviewButton: {
        backgroundColor: Colors.text,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitReviewText: {
        color: '#fff',
        fontWeight: '600',
    },
    reviewCard: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewerName: {
        fontWeight: '600',
        color: Colors.text,
    },
    reviewDate: {
        fontSize: 12,
        color: Colors.textLight,
    },
    starRowSmall: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 8,
    },
    reviewComment: {
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    tryOnButton: {
        flex: 1,
        backgroundColor: Colors.secondary,
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    tryOnButtonText: {
        color: Colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: Colors.text,
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
