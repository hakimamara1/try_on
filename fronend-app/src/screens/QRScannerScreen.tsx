import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Styles';
import { scanOrderQR } from '../api/orders';

export default function QRScannerScreen() {
    const navigation = useNavigation<any>();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        try {
            const result = await scanOrderQR(data);
            if (result.success) {
                navigation.replace('ProductOrigin', {
                    product: result.data,
                    points: 200 // Could come from API too
                });
            }
        } catch (error: any) {
            // Allow retry
            const msg = error.response?.data?.error || "Could not verify QR code.";
            Alert.alert(
                "Scanning Failed",
                msg,
                [{ text: "Try Again", onPress: () => setScanned(false) }]
            );
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting for camera permission</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>No access to camera</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={flash}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan Product QR</Text>
                    <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.iconButton}>
                        {flash ? <Zap color="#FFD700" size={24} /> : <ZapOff color="#fff" size={24} />}
                    </TouchableOpacity>
                </View>

                <View style={styles.scanAreaContainer}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.instruction}>Align QR code within the frame</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    iconButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
        borderRadius: 20,
    },
    instruction: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    }
});
