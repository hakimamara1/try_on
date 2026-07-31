import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Share2, Download, X, Shirt } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '../constants/Styles';
import { useSavedTryOn } from '../context/SavedTryOnContext';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 20;
const GAP = 14;
const ITEM_WIDTH = (width - SPACING * 2 - GAP) / COLUMN_COUNT;

export default function SavedTryOnScreen() {
    const navigation = useNavigation();
    const { savedItems, removeSavedItem } = useSavedTryOn();
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    const handleShare = async (imageUrl: string) => {
        try {
            setDownloading(true);
            const filename = imageUrl.split('/').pop() || 'shared_look.jpg';
            const fileUri = FileSystem.cacheDirectory + filename;

            const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing not available", "Sharing is not available on this device");
                return;
            }

            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to share image');
        } finally {
            setDownloading(false);
        }
    };

    const handleSave = async (imageUrl: string) => {
        try {
            setDownloading(true);

            if (permissionResponse?.status !== 'granted') {
                const { status } = await requestPermission();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Please grant permission to save photos');
                    setDownloading(false);
                    return;
                }
            }

            const filename = imageUrl.split('/').pop() || 'saved_look.jpg';
            const fileUri = FileSystem.documentDirectory + filename;
            const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('ZED DREAM', asset, false);

            Alert.alert('Saved!', 'Image saved to your gallery');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save image');
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Look',
            'Are you sure you want to remove this look?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        removeSavedItem(id);
                        if (selectedImage?.id === id) setSelectedImage(null);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => setSelectedImage(item)}
        >
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            <Text style={styles.dateText}>
                {new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>My Looks</Text>
            </View>

            {savedItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Shirt size={20} color={Colors.primaryDark} />
                    </View>
                    <Text style={styles.emptyText}>No looks saved yet</Text>
                    <Text style={styles.emptySubtext}>Try something on and save your favorite fits here.</Text>
                    <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('TryOn' as never)}>
                        <Text style={styles.emptyCtaText}>Try It On Me</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={savedItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id || item._id}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Full Screen Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setSelectedImage(null)}
                                style={styles.closeButton}
                            >
                                <X size={22} color={Colors.darkText} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalImageContainer}>
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage.image }}
                                    style={styles.modalImage}
                                    contentFit="contain"
                                />
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => selectedImage && handleShare(selectedImage.image)}
                            >
                                <Share2 size={22} color={Colors.darkText} />
                                <Text style={styles.actionText}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={() => selectedImage && handleSave(selectedImage.image)}
                            >
                                {downloading ? (
                                    <ActivityIndicator color={Colors.text} />
                                ) : (
                                    <>
                                        <Download size={20} color={Colors.text} />
                                        <Text style={[styles.actionText, { color: Colors.text }]}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => selectedImage && handleDelete(selectedImage.id)}
                            >
                                <Trash2 size={22} color="#E5695F" />
                                <Text style={[styles.actionText, { color: '#E5695F' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
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
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    listContainer: {
        paddingHorizontal: SPACING,
        paddingBottom: SPACING,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: GAP,
    },
    card: {
        width: ITEM_WIDTH,
    },
    image: {
        width: '100%',
        height: ITEM_WIDTH * 1.33,
        borderRadius: 14,
        backgroundColor: Colors.surfaceSunken,
    },
    dateText: {
        fontFamily: Fonts.sansRegular,
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 18,
        color: Colors.text,
    },
    emptySubtext: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textLight,
        textAlign: 'center',
    },
    emptyCta: {
        backgroundColor: Colors.text,
        paddingHorizontal: 22,
        paddingVertical: 13,
        borderRadius: 23,
        marginTop: 4,
    },
    emptyCtaText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.darkText,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(14,13,12,0.96)',
        justifyContent: 'center',
    },
    modalSafeArea: {
        flex: 1,
        justifyContent: 'space-between',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20,
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'rgba(247,243,236,0.12)',
        borderRadius: 30,
    },
    modalImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: height * 0.6,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
        minWidth: 70,
    },
    saveButton: {
        backgroundColor: Colors.darkText,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        minWidth: 120,
        justifyContent: 'center',
    },
    actionText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 12,
    }
});
