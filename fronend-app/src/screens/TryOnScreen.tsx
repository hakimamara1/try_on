import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, RotateCcw, ZoomIn, Check, Sparkles } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { generateTryOn } from '../api/try-on';
import { useSavedTryOn } from '../context/SavedTryOnContext';

const { width } = Dimensions.get('window');

// Mock user images for selection since we don't have image picker installed
const SAMPLE_USER_IMAGES = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000'
];

export default function TryOnScreen({ route }: any) {
    const [mode, setMode] = useState<'split' | 'overlay'>('overlay');
    const [userImage, setUserImage] = useState(SAMPLE_USER_IMAGES[0]);
    const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { saveItem } = useSavedTryOn();

    useEffect(() => {
        if (route?.params?.productImage) {
            setProductImage(route.params.productImage);
            // Optionally clear generated image if product changes
            setGeneratedImage(null);
        }
    }, [route?.params]);

    const handleNewPhoto = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setUserImage(result.assets[0].uri);
            setGeneratedImage(null);
        }
    };

    const handleProductPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProductImage(result.assets[0].uri);
            // setGeneratedImage(null); // Optional: reset generated look if product changes
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Real Call:
            const res = await generateTryOn(userImage, productImage);

            if (res.success && res.data.generatedImage) {
                setGeneratedImage(res.data.generatedImage);
                Alert.alert('Try-On Complete', 'AI has generated your look!');
            } else {
                Alert.alert('Try-On Failed', 'Could not generate image.');
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to generate try-on.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedImage) return;
        try {
            await saveItem({
                generatedImage,
                originalImage: userImage,
                productImage,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Virtual Try-On</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={handleNewPhoto}>
                    <Camera size={20} color={Colors.text} />
                    <Text style={styles.uploadText}>Change Photo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.viewerContainer}>
                {/* Visualization */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: generatedImage || userImage }}
                        style={styles.mainImage}
                    />

                    {loading && (
                        <View style={[styles.aiBadge, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.aiText}>Generating...</Text>
                        </View>
                    )}

                    {generatedImage && !loading && (
                        <View style={styles.aiBadge}>
                            <Sparkles size={14} color="#fff" />
                            <Text style={styles.aiText}>AI Generated Look</Text>
                        </View>
                    )}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.controlButton} onPress={() => setGeneratedImage(null)}>
                        <RotateCcw size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlButton, { backgroundColor: Colors.primary }]} onPress={handleGenerate} disabled={loading}>
                        <Sparkles size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.modeSwitch}>
                        <TouchableOpacity
                            style={[styles.switchOption, mode === 'overlay' && styles.switchActive]}
                            onPress={() => setMode('overlay')}
                        >
                            <Text style={[styles.switchText, mode === 'overlay' && styles.switchTextActive]}>Overlay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.switchOption, mode === 'split' && styles.switchActive]}
                            onPress={() => setMode('split')}
                        >
                            <Text style={[styles.switchText, mode === 'split' && styles.switchTextActive]}>Split</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.productSnippet}>
                    <TouchableOpacity onPress={handleProductPhoto}>
                        <Image
                            source={{ uri: productImage }}
                            style={styles.snippetImage}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.snippetTitle}>Select Product Image</Text>
                        <Text style={styles.snippetPrice}>Tap image to change</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.ctaButton, !generatedImage && { backgroundColor: Colors.border }]}
                    onPress={handleSave}
                    disabled={!generatedImage}
                >
                    <Check size={20} color="#fff" />
                    <Text style={styles.ctaText}>Save Look</Text>
                </TouchableOpacity>
            </View>
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
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    viewerContainer: {
        flex: 1,
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    imageWrapper: {
        flex: 1,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    aiBadge: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    aiText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    controls: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeSwitch: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 25,
        padding: 4,
    },
    switchOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    switchActive: {
        backgroundColor: Colors.text,
    },
    switchText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    switchTextActive: {
        color: '#fff',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    productSnippet: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    snippetImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    snippetTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    snippetPrice: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    ctaButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    ctaText: {
        color: Colors.text,
        fontWeight: '700',
        fontSize: 16,
    }
});
