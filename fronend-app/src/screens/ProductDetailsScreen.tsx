import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

const SIZES = ['S', 'M', 'L', 'XL'];
const COLORS = ['#DDA0DD', '#FFC1CC', '#000000', '#F5F5DC']; // Muted Rose, Pink, Black, Beige

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { product } = route.params || {};
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const { addToCart } = useCart();

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
                    <Image source={{ uri: product.image }} style={styles.image} />
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
                        Elevate your wardrobe with this stunning piece designed for the modern elegant woman.
                        Crafted from high-quality fabrics offering both comfort and luxury.
                    </Text>

                    {/* Color Selector */}
                    <Text style={styles.sectionTitle}>Color</Text>
                    <View style={styles.selectorRow}>
                        {COLORS.map((color, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorSelected
                                ]}
                                onPress={() => setSelectedColor(color)}
                            />
                        ))}
                    </View>

                    {/* Size Selector */}
                    <Text style={styles.sectionTitle}>Size</Text>
                    <View style={styles.selectorRow}>
                        {SIZES.map((size, index) => (
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

                    {/* Points Info */}
                    <View style={styles.pointsInfo}>
                        <Text style={styles.pointsText}>✨ Buy now and earn +20 points</Text>
                    </View>
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
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
