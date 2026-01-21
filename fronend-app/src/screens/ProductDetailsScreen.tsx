import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Styles';
import { getProducts, getCategories, getProduct, getRelatedProducts } from '../api/products';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { product } = route.params || {};
    const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
    const [activeSlide, setActiveSlide] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    const { addToCart } = useCart();

    useEffect(() => {
        if (product?._id) {
            fetchRelatedProducts();
        }
    }, [product?._id]);

    const fetchRelatedProducts = async () => {
        try {
            const data = await getRelatedProducts(product._id);
            setRelatedProducts(data.data || []);
        } catch (error) {
            console.error('Failed to fetch related products', error);
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
                        <View style={styles.ratingContainer}>
                            <Star fill={Colors.accent} stroke={Colors.accent} size={16} />
                            <Text style={styles.ratingText}>{product.rating} ({product.reviews})</Text>
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
