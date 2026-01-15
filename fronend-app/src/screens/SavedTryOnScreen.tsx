import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, Share2, Download, X, Maximize2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Styles';
import { useSavedTryOn } from '../context/SavedTryOnContext';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 16;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

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
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardOverlay}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>
                        {new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>My Collection</Text>
                <View style={{ width: 40 }} />
            </View>

            {savedItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/743/743224.png' }}
                        style={{ width: 80, height: 80, marginBottom: 20, opacity: 0.5 }}
                    />
                    <Text style={styles.emptyText}>Empty Gallery</Text>
                    <Text style={styles.emptySubtext}>Your generated looks will be saved here.</Text>
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
                                <X size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalImageContainer}>
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage.image }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => selectedImage && handleShare(selectedImage.image)}
                            >
                                <Share2 size={24} color="#fff" />
                                <Text style={styles.actionText}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={() => selectedImage && handleSave(selectedImage.image)}
                            >
                                {downloading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Download size={24} color="#000" />
                                        <Text style={[styles.actionText, { color: '#000' }]}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteAction]}
                                onPress={() => selectedImage && handleDelete(selectedImage.id)}
                            >
                                <Trash2 size={24} color={Colors.error} />
                                <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
        backgroundColor: Colors.surface,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: 0.5,
    },
    listContainer: {
        padding: SPACING,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: SPACING,
    },
    card: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 10,
    },
    dateBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        // backdropFilter: 'blur(10px)', // Not supported in React Native natively
    },
    dateText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
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
        backgroundColor: 'rgba(255,255,255,0.1)',
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
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        minWidth: 120,
        justifyContent: 'center',
    },
    deleteAction: {
        opacity: 0.9,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    }
});
