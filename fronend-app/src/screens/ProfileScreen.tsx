import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Star, Heart, MapPin, Users, HelpCircle, LogOut, ChevronRight, Edit2, LogIn, Camera } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
    { icon: ShoppingBag, label: 'My Orders', route: 'Orders' },
    { icon: Star, label: 'My Points & Rewards', badge: '120 pts', route: 'Points' },
    { icon: Heart, label: 'Saved Try-Ons', route: 'SavedTryOn' },
    { icon: MapPin, label: 'Address Book', action: 'address' },
    { icon: Camera, label: 'Scan Product Origin', route: 'ScanQR', highlight: true },
    { icon: Users, label: 'Invite Friends', action: 'share' },
    { icon: HelpCircle, label: 'Help & Support', action: 'help' },
];

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const handleMenuPress = async (item: any) => {
        if (item.route) {
            navigation.navigate(item.route);
        } else if (item.action === 'share') {
            try {
                await Share.share({
                    message: 'Check out this amazing fashion app! ZED DREAM - Elegant Modesty.',
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            // Placeholder actions
            const messages: Record<string, string> = {
                rewards: 'You have 120 points! Redeem them on checkout.',
                address: 'Manage your shipping addresses here.',
                help: 'Contact support at support@zeddream.com'
            };
            Alert.alert(item.label, messages[item.action] || 'Feature coming soon!');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    const handleEditProfile = () => {
        Alert.alert("Edit Profile", "Profile editing is currently disabled.");
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Info */}
            <View style={styles.profileHeader}>
                {user ? (
                    <>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100' }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
                                <Edit2 size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View style={[styles.avatarContainer, styles.guestAvatar]}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100&auto=format&fit=crop' }}
                                style={styles.avatar}
                            />
                        </View>
                        <Text style={styles.name}>Guest User</Text>
                        <Text style={styles.email}>Sign in to access your profile</Text>
                        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginBtnText}>Log In / Sign Up</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer}>
                {MENU_ITEMS.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => handleMenuPress(item)}
                    >
                        <View style={[styles.iconBox, item.highlight && styles.iconBoxHighlight]}>
                            <item.icon size={20} color={item.highlight ? Colors.text : Colors.textSecondary} />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>

                        {item.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                        )}

                        <ChevronRight size={16} color={Colors.textLight} />
                    </TouchableOpacity>
                ))}

                {user && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogOut size={20} color={Colors.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    guestAvatar: {
        opacity: 0.8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.text,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 16,
    },
    loginBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 8,
    },
    loginBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconBoxHighlight: {
        backgroundColor: Colors.secondary,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
        gap: 8,
    },
    logoutText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: '600',
    }
});
