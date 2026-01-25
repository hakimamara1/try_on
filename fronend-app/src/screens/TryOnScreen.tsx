import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ArrowLeft, Sparkles, MoreHorizontal, Image as ImageIcon, Star } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { generateTryOn } from '../api/try-on';
import { getLoyaltyInfo } from '../api/loyalty';
import { useSavedTryOn } from '../context/SavedTryOnContext';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Mock user images for selection since we don't have image picker installed
const SAMPLE_USER_IMAGES = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000'
];

export default function TryOnScreen({ route }: any) {
    const navigation = useNavigation();
    const [userImage, setUserImage] = useState(SAMPLE_USER_IMAGES[2]);
    const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000');
    const [productName, setProductName] = useState('Product Name');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [points, setPoints] = useState(0);
    const { saveItem } = useSavedTryOn();

    useEffect(() => {
        if (route?.params?.productImage) {
            setProductImage(route.params.productImage);
            setGeneratedImage(null);
        }
        if (route?.params?.productName) {
            setProductName(route.params.productName);
        }
        fetchPoints();
    }, [route?.params]);

    const fetchPoints = async () => {
        try {
            const data = await getLoyaltyInfo();
            setPoints(data.points);
        } catch (error) {
            console.error('Failed to fetch points', error);
        }
    };

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

    const handleGenerate = async () => {
        if (points < 20) {
            Alert.alert(
                "Insufficient Points",
                "You need 20 points for a regular try-on. Complete missions to earn more!",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Earn Points", onPress: () => navigation.navigate('Points' as never) }
                ]
            );
            return;
        }

        setLoading(true);
        try {
            // Real Call:
            const res = await generateTryOn(userImage, productImage);

            if (res.success && res.data.generatedImage) {
                setGeneratedImage(res.data.generatedImage);
                setPoints(prev => Math.max(0, prev - 20)); // Update local state
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
            Alert.alert("Saved", "Look saved to your collection!");
            navigation.navigate('SavedTryOn' as never);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Image / Main View */}
            <Image
                source={{ uri: generatedImage || userImage }}
                style={styles.backgroundImage}
            />

            {/* Grid Overlay */}
            {!generatedImage && (
                <View style={styles.gridContainer}>
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineHorizontal} />
                    <View style={styles.gridLineHorizontal} />
                </View>
            )}

            {/* Top Header Full Width */}
            <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
                <View style={styles.topBarFull}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonCircle}>
                        <ArrowLeft size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.productInfoContainer}>
                        <Image source={{ uri: productImage }} style={styles.headerProductImage} />
                        <Text style={styles.headerProductName} numberOfLines={1}>{productName}</Text>
                    </View>

                    <TouchableOpacity style={styles.pointsBadge} onPress={() => navigation.navigate('Points' as never)}>
                        <Star size={16} fill={Colors.primary} color={Colors.primary} />
                        <Text style={styles.pointsText}>{points}</Text>
                    </TouchableOpacity>
                </View>

                {!generatedImage && !loading && (
                    <Text style={styles.instructionText}>
                        Step back and position yourself in the frame.
                    </Text>
                )}
            </SafeAreaView>

            {/* Loading / Processing State */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <BlurView intensity={30} tint="light" style={styles.loadingBlur}>
                        <ActivityIndicator size="large" color={Colors.text} />
                        <Text style={styles.loadingText}>Fitting garment...</Text>
                    </BlurView>
                </View>
            )}

            {/* Bottom Controls */}
            <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
                <View style={styles.controlsRow}>
                    {/* Left: Gallery/Camera */}
                    <TouchableOpacity style={styles.sideButton} onPress={handleNewPhoto}>
                        <View style={styles.sideButtonBlur}>
                            <ImageIcon size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Center: Action Button */}
                    {generatedImage ? (
                        <TouchableOpacity style={styles.mainActionButton} onPress={handleSave}>
                            <View style={[styles.mainActionInner, { backgroundColor: '#fff' }]}>
                                <Text style={styles.mainActionText}>Save</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.mainActionButton} onPress={handleGenerate} disabled={loading}>
                            <View style={styles.shutterOuter}>
                                <View style={styles.shutterInner}>
                                    <Text style={styles.shutterText}>Try On</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Right: More Options */}
                    <TouchableOpacity style={styles.sideButton} onPress={() => { }}>
                        <View style={styles.sideButtonBlur}>
                            <MoreHorizontal size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
        resizeMode: 'cover',
        opacity: 0.9,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLineVertical: {
        position: 'absolute',
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        left: '33.33%',
    },
    gridLineHorizontal: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: '33.33%',
    },
    safeAreaTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background for header visibility
        paddingBottom: 10,
    },
    topBarFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        width: '100%',
    },
    backButtonCircle: {
        width: 45,
        height: 45,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        maxWidth: width * 0.5,
    },
    headerProductImage: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    headerProductName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        maxWidth: 100,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 7,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    instructionText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingBlur: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        overflow: 'hidden',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
        zIndex: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    sideButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sideButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    mainActionButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    mainActionInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    mainActionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    }
});
