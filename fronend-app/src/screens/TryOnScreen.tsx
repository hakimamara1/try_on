import React, { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator, StatusBar, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ImagePlus, Camera, Star } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { generateTryOn } from '../api/try-on';
import { getLoyaltyInfo } from '../api/loyalty';
import { useSavedTryOn } from '../context/SavedTryOnContext';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Mock user images for selection since we don't have image picker installed
const SAMPLE_USER_IMAGES = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000'
];

// ─── Aperture loading indicator ──────────────────────────
const ApertureSpinner = () => {
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;
    const scan = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const spin1 = Animated.loop(
            Animated.timing(ring1, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
        );
        const spin2 = Animated.loop(
            Animated.timing(ring2, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
        );
        const sweep = Animated.loop(
            Animated.sequence([
                Animated.timing(scan, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(scan, { toValue: 0, duration: 0, useNativeDriver: true }),
            ])
        );
        spin1.start();
        spin2.start();
        sweep.start();
        return () => {
            spin1.stop();
            spin2.stop();
            sweep.stop();
        };
    }, [ring1, ring2, scan]);

    const rotate1 = ring1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const rotate2 = ring2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
    const scanTranslate = scan.interpolate({ inputRange: [0, 1], outputRange: [-90, 90] });

    return (
        <View style={styles.apertureWrap}>
            <Animated.View style={[styles.apertureRingOuter, { transform: [{ rotate: rotate1 }] }]} />
            <Animated.View style={[styles.apertureRingInner, { transform: [{ rotate: rotate2 }] }]} />
            <View style={styles.apertureMask}>
                <Animated.View style={[styles.apertureScanline, { transform: [{ translateY: scanTranslate }] }]}>
                    <LinearGradient
                        colors={['rgba(183,146,78,0)', 'rgba(183,146,78,0.45)', 'rgba(183,146,78,0)']}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

export default function TryOnScreen({ route }: any) {
    const navigation = useNavigation();
    const [userImage, setUserImage] = useState(SAMPLE_USER_IMAGES[2]);
    const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000');
    const [productName, setProductName] = useState('Product Name');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [points, setPoints] = useState(0);
    const [savedToast, setSavedToast] = useState(false);
    const { saveItem } = useSavedTryOn();
    const toastAnim = useRef(new Animated.Value(0)).current;

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

    const pickFrom = async (source: 'library' | 'camera') => {
        const permission = source === 'library'
            ? await ImagePicker.requestMediaLibraryPermissionsAsync()
            : await ImagePicker.requestCameraPermissionsAsync();

        if (permission.status !== 'granted') {
            Alert.alert(
                'Permission needed',
                source === 'library'
                    ? 'We need photo library access to pick a photo.'
                    : 'We need camera access to take a photo.'
            );
            return;
        }

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        };
        const result = source === 'library'
            ? await ImagePicker.launchImageLibraryAsync(options)
            : await ImagePicker.launchCameraAsync(options);

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

    const handleRetake = () => {
        setGeneratedImage(null);
    };

    const showToast = () => {
        setSavedToast(true);
        toastAnim.setValue(0);
        Animated.timing(toastAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
        setTimeout(() => {
            Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSavedToast(false));
        }, 1400);
    };

    const handleSave = async () => {
        if (!generatedImage) return;
        try {
            await saveItem({
                generatedImage,
                originalImage: userImage,
                productImage,
            });
            showToast();
            setTimeout(() => navigation.navigate('SavedTryOn' as never), 1200);
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

            {/* Top Header */}
            <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
                <View style={styles.topBarFull}>
                    <View style={styles.glassPill}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassPillTouch}>
                            <ArrowLeft size={20} color={Colors.darkText} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productInfoContainer}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <Image source={{ uri: productImage }} style={styles.headerProductImage} />
                        <Text style={styles.headerProductName} numberOfLines={1}>{productName}</Text>
                    </View>

                    <TouchableOpacity style={styles.pointsBadge} onPress={() => navigation.navigate('Points' as never)}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.pointsDot} />
                        <Text style={styles.pointsText}>{points}</Text>
                    </TouchableOpacity>
                </View>

                {!generatedImage && !loading && (
                    <Text style={styles.instructionText}>
                        Center yourself in frame, or upload a photo
                    </Text>
                )}
                {loading && (
                    <Text style={styles.instructionText}>Crafting your fit…</Text>
                )}
            </SafeAreaView>

            {/* Loading / Processing State */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                    <ApertureSpinner />
                </View>
            )}

            {/* Bottom Controls — live/idle view */}
            {!generatedImage && (
                <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.sideButton} onPress={() => pickFrom('library')} disabled={loading}>
                            <View style={styles.sideButtonBlur}>
                                <ImagePlus size={22} color={Colors.darkText} />
                            </View>
                            <Text style={styles.sideButtonLabel}>Upload</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mainActionButton} onPress={handleGenerate} disabled={loading}>
                            <View style={styles.shutterOuter}>
                                <View style={styles.shutterInner}>
                                    {loading ? (
                                        <ActivityIndicator color={Colors.text} />
                                    ) : (
                                        <Text style={styles.shutterText}>Try On</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sideButton} onPress={() => pickFrom('camera')} disabled={loading}>
                            <View style={styles.sideButtonBlur}>
                                <Camera size={22} color={Colors.darkText} />
                            </View>
                            <Text style={styles.sideButtonLabel}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            {/* Bottom Controls — result view */}
            {generatedImage && !loading && (
                <LinearGradient
                    colors={['rgba(14,13,12,0)', 'rgba(14,13,12,0.85)']}
                    style={styles.resultBar}
                >
                    <SafeAreaView edges={['bottom']}>
                        <View style={styles.resultButtonsRow}>
                            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                                <Text style={styles.retakeButtonText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save Look</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            )}

            {savedToast && (
                <Animated.View
                    style={[
                        styles.toast,
                        {
                            opacity: toastAnim,
                            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                        },
                    ]}
                >
                    <Star size={14} fill={Colors.primary} color={Colors.primary} />
                    <Text style={styles.toastText}>Saved to your Looks</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
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
        backgroundColor: 'rgba(247,243,236,0.06)',
        left: '33.33%',
    },
    gridLineHorizontal: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(247,243,236,0.06)',
        top: '33.33%',
    },
    safeAreaTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 10,
        paddingBottom: 10,
    },
    topBarFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        width: '100%',
        gap: 8,
    },
    glassPill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(247,243,236,0.12)',
    },
    glassPillTouch: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        maxWidth: width * 0.42,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(247,243,236,0.12)',
    },
    headerProductImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.surfaceSunken,
    },
    headerProductName: {
        fontFamily: Fonts.sansMedium,
        fontSize: 13,
        color: Colors.darkText,
        maxWidth: 110,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(183,146,78,0.4)',
    },
    pointsDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    pointsText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.primaryLight,
    },
    instructionText: {
        color: Colors.darkText,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: Fonts.sansMedium,
        fontSize: 13,
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
    apertureWrap: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    apertureRingOuter: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 2,
        borderColor: 'rgba(183,146,78,0.5)',
        borderStyle: 'dashed',
    },
    apertureRingInner: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1.5,
        borderColor: 'rgba(247,243,236,0.35)',
    },
    apertureMask: {
        width: 180,
        height: 180,
        borderRadius: 90,
        overflow: 'hidden',
    },
    apertureScanline: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '45%',
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
        alignItems: 'flex-start',
        paddingHorizontal: 30,
    },
    sideButton: {
        width: 60,
        alignItems: 'center',
        gap: 6,
    },
    sideButtonBlur: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(247,243,236,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(247,243,236,0.25)',
    },
    sideButtonLabel: {
        fontFamily: Fonts.sansSemiBold,
        fontSize: 11,
        color: 'rgba(247,243,236,0.7)',
    },
    mainActionButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterOuter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 3,
        borderColor: Colors.darkText,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: Colors.darkText,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterText: {
        fontFamily: Fonts.sansBold,
        fontSize: 13,
        color: Colors.text,
    },
    resultBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 30,
        zIndex: 10,
    },
    resultButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 4,
    },
    retakeButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: 'rgba(247,243,236,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    retakeButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.darkText,
    },
    saveButton: {
        flex: 1.3,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: Fonts.sansBold,
        fontSize: 14,
        color: Colors.text,
    },
    toast: {
        position: 'absolute',
        bottom: 130,
        left: '50%',
        marginLeft: -100,
        width: 200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.darkText,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        zIndex: 30,
    },
    toastText: {
        fontFamily: Fonts.sansBold,
        fontSize: 12,
        color: Colors.text,
    },
});
