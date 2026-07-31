import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { getMe, toggleWishlist } from '../api/auth';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 54) / 2;

export default function WishlistScreen() {
    const navigation = useNavigation<any>();

    const queryClient = useQueryClient();


    const { data: user, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            const response = await getMe();
            return response.data;
        },
    });

    const wishlist = user?.wishlist || [];

    const toggleWishlistMutation = useMutation({
        mutationFn: toggleWishlist,
        onMutate: async (productId) => {
            await queryClient.cancelQueries({ queryKey: ['user', 'me'] });
            const previousUser = queryClient.getQueryData(['user', 'me']);

            queryClient.setQueryData(['user', 'me'], (old: any) => {
                if (!old) return old;
                const exists = old.wishlist.some((item: any) => item._id === productId);
                return {
                    ...old,
                    wishlist: exists
                        ? old.wishlist.filter((item: any) => item._id !== productId)
                        : old.wishlist // We can't easily add without the full product object, so we imply removal is optimistic, addition might need invalidation
                };
            });

            return { previousUser };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData(['user', 'me'], context.previousUser);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });

    const handleRemoveFromWishlist = (productId: string) => {
        toggleWishlistMutation.mutate(productId);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item._id);
                    }}
                >
                    <Heart size={13} fill={Colors.secondary} color={Colors.secondary} />
                </TouchableOpacity>
            </View>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
        </TouchableOpacity>
    );

    if (isLoading && !wishlist.length) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Wishlist</Text>
            </View>

            {wishlist.length === 0 ? (
                <View style={styles.emptyState}>
                    {isRefetching && <ActivityIndicator size="large" color={Colors.primary} />}
                    <Heart size={40} color={Colors.borderStrong} />
                    <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                    <Text style={styles.emptyText}>Tap the heart on any piece to save it here.</Text>
                    <TouchableOpacity
                        style={styles.startShoppingButton}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={styles.startShoppingText}>Browse Products</Text>
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
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
                    }
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
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: COLUMN_WIDTH,
        marginBottom: 18,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1 / 1.15,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: Colors.surfaceSunken,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productName: {
        fontFamily: Fonts.sansMedium,
        fontSize: 13,
        color: Colors.text,
        marginTop: 8,
    },
    productPrice: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: -40,
        gap: 14,
    },
    emptyTitle: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
    },
    emptyText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    startShoppingButton: {
        backgroundColor: Colors.text,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 23,
        marginTop: 6,
    },
    startShoppingText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 13,
    }
});
