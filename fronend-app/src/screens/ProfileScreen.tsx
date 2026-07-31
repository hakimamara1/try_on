import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Star, Heart, MapPin, Users, HelpCircle, LogOut, ChevronRight, Edit2, Camera, Shirt } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/Styles';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
    { icon: ShoppingBag, label: 'My Orders', route: 'Orders' },
    { icon: Star, label: 'My Points & Rewards', badge: '120 pts', route: 'Points' },
    { icon: Heart, label: 'Wishlist & Favorites', route: 'Wishlist' },
    { icon: Shirt, label: 'Saved Try-Ons', route: 'SavedTryOn' },
    { icon: MapPin, label: 'Address Book', action: 'address' },
    { icon: Camera, label: 'Scan Product Origin', route: 'ScanQR', highlight: true },
    { icon: Users, label: 'Invite Friends', action: 'share' },
    { icon: HelpCircle, label: 'Help & Support', action: 'help' },
];

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    // Routes that live inside the bottom-tab navigator need to be targeted
    // explicitly via MainTabs — navigating to their name directly only works
    // by accident of where the caller happens to sit in the navigation tree.
    const TAB_ROUTES = ['Wishlist'];

    const handleMenuPress = async (item: any) => {
        if (item.route) {
            if (TAB_ROUTES.includes(item.route)) {
                navigation.navigate('MainTabs', { screen: item.route });
            } else {
                navigation.navigate(item.route);
            }
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

    const initial = user?.name?.trim()?.[0]?.toUpperCase() || '?';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Info */}
            <View style={styles.profileHeader}>
                {user ? (
                    <>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarInitial}>{initial}</Text>
                            </View>
                            <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('EditProfile')}>
                                <Edit2 size={13} color={Colors.darkText} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View style={[styles.avatar, styles.guestAvatar]}>
                            <Text style={styles.avatarInitial}>?</Text>
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
                            <item.icon size={19} color={item.highlight ? Colors.text : Colors.textSecondary} />
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
        marginBottom: 14,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestAvatar: {
        marginBottom: 14,
        opacity: 0.7,
    },
    avatarInitial: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 30,
        color: Colors.primaryDark,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.text,
        padding: 8,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: Colors.background,
    },
    name: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 21,
        color: Colors.text,
        marginBottom: 4,
    },
    email: {
        fontFamily: Fonts.sansRegular,
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 16,
    },
    loginBtn: {
        backgroundColor: Colors.text,
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 23,
        marginTop: 8,
    },
    loginBtnText: {
        fontFamily: Fonts.sansBold,
        color: Colors.darkText,
        fontSize: 14,
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 14,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconBoxHighlight: {
        backgroundColor: Colors.primaryLight,
    },
    menuLabel: {
        flex: 1,
        fontFamily: Fonts.sansMedium,
        fontSize: 15,
        color: Colors.text,
    },
    badge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        fontFamily: Fonts.sansBold,
        color: Colors.text,
        fontSize: 11,
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
        fontFamily: Fonts.sansBold,
        color: Colors.error,
        fontSize: 15,
    }
});
