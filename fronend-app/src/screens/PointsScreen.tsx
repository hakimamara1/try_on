import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Gift, ChevronRight, Lock, Unlock, Share2, CheckCircle, Clock, Ticket } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { LinearGradient } from 'expo-linear-gradient';
import { getLoyaltyInfo, redeemReward, claimProfileBonus } from '../api/loyalty';
import { useAuth } from '../context/AuthContext';

const MISSIONS_LIST = [
    { id: '1', title: 'Complete Profile', points: '+30', icon: CheckCircle, action: 'profile' },
    { id: '2', title: 'Invite a friend', points: '+50', icon: Share2, action: 'invite' },
    { id: '3', title: 'Order & Scan QR', points: '+200', icon: Star, action: 'order' },
    { id: '4', title: 'Try on a product', points: '+20', icon: Ticket, action: 'tryon' },
    { id: '5', title: 'Write a review', points: '+40', icon: Star, action: 'review' },
];

export default function PointsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [balance, setBalance] = useState({ points: 0, tier: 'Bronze' });
    const [rewards, setRewards] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const fetchLoyaltyData = async () => {
        try {
            const data = await getLoyaltyInfo();
            setBalance({ points: data.points, tier: data.tier });
            setRewards(data.rewards);
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to fetch loyalty data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (rewardId: string) => {
        try {
            await redeemReward(rewardId);
            Alert.alert('Success', 'Reward redeemed successfully!');
            fetchLoyaltyData(); // Refresh points
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to redeem reward');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Points & Rewards</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>Earn points and unlock exclusive discounts</Text>

                {/* Hero Card */}
                <LinearGradient
                    colors={[Colors.primary, '#E6C9C9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroContent}>
                        <View>
                            <Text style={styles.pointsLabel}>Total Balance</Text>
                            <Text style={styles.pointsValue}>{balance.points}</Text>
                        </View>
                        <View style={styles.starIconContainer}>
                            <Star fill="#C5B358" stroke="#C5B358" size={32} />
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '73%' }]} />
                        </View>
                        <Text style={styles.progressText}>Current Tier: {balance.tier}</Text>
                    </View>
                </LinearGradient>

                {/* Earn More (Missions) */}
                <Text style={styles.sectionTitle}>Earn More Points</Text>
                <View style={styles.missionsContainer}>
                    {MISSIONS_LIST.map((mission) => (
                        <TouchableOpacity
                            key={mission.id}
                            style={styles.missionCard}
                            onPress={() => {
                                if (mission.action === 'profile') {
                                    Alert.alert(
                                        'Complete Profile',
                                        'Claim your 30 points for completing your profile!',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Claim Bonus', onPress: async () => {
                                                    try {
                                                        await claimProfileBonus();
                                                        Alert.alert('Success', '+30 Points Added!');
                                                        fetchLoyaltyData();
                                                    } catch (err: any) {
                                                        Alert.alert('Info', err.response?.data?.error || 'Could not claim bonus');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            }}
                        >
                            <View style={styles.missionIconBox}>
                                <mission.icon size={20} color={Colors.text} />
                            </View>
                            <View style={styles.missionInfo}>
                                <Text style={styles.missionTitle}>{mission.title}</Text>
                                <Text style={styles.missionPoints}>{mission.points}</Text>
                            </View>
                            <ChevronRight size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Invite Friends Highlight */}
                <LinearGradient
                    colors={['#FFF5F5', '#FFF0F0']}
                    style={styles.inviteCard}
                >
                    <View style={styles.inviteContent}>
                        <Text style={styles.inviteTitle}>Invite Friends</Text>
                        <Text style={styles.inviteSubtitle}>
                            Share your code and earn <Text style={{ fontWeight: '700' }}>100 points</Text> when they sign up!
                            They get 50 points.
                        </Text>

                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>YOUR CODE:</Text>
                            <Text style={styles.codeValue}>{user?.inviteCode || 'LOADING...'}</Text>
                        </View>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1529139574466-a302d27f60d0?q=80&w=200' }}
                        style={styles.inviteImage}
                    />
                </LinearGradient>

                {/* History */}
                <Text style={styles.sectionTitle}>Points History</Text>
                <View style={styles.historyContainer}>
                    {history.map((item: any, index: number) => (
                        <View key={item._id || index} style={styles.historyItem}>
                            <View style={styles.historyLeft}>
                                <Clock size={16} color={Colors.textLight} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.historyAction}>{item.description || item.action}</Text>
                                    <Text style={styles.historyDate}>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.historyPoints,
                                (item.points > 0) ? { color: Colors.success } : { color: Colors.error }
                            ]}>{item.points > 0 ? '+' : ''}{item.points}</Text>
                        </View>
                    ))}
                    {history.length === 0 && (
                        <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 10 }}>No history yet.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    headerSubtitle: {
        textAlign: 'center',
        color: Colors.textSecondary,
        marginBottom: 20,
        fontSize: 14,
    },
    heroCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    pointsLabel: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 4,
    },
    pointsValue: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '800',
    },
    starIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 50,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressText: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: 20,
        marginBottom: 16,
    },
    rewardsContainer: {
        paddingLeft: 20,
        marginBottom: 30,
    },
    rewardCard: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rewardCardDisabled: {
        opacity: 0.7,
        backgroundColor: '#FAFAFA',
    },
    rewardBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rewardBadgeText: {
        color: Colors.text,
        fontSize: 10,
        fontWeight: '700',
    },
    rewardIcon: {
        marginBottom: 12,
        marginTop: 4,
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    rewardSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    redeemButton: {
        backgroundColor: Colors.text,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
    },
    redeemText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    missionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    missionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    missionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    missionInfo: {
        flex: 1,
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    missionPoints: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    inviteCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    inviteContent: {
        flex: 1,
        paddingRight: 10,
    },
    inviteTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
    },
    inviteSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    inviteButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: 'flex-start',
    },
    inviteButtonText: {
        color: Colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    inviteImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    historyContainer: {
        paddingHorizontal: 20,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyAction: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    historyDate: {
        fontSize: 12,
        color: Colors.textLight,
    },
    historyPoints: {
        fontSize: 16,
        fontWeight: '700',
    },
    redeemButtonDisabled: {
        backgroundColor: Colors.border,
    },
    codeContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed'
    },
    codeLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '700',
        marginBottom: 2
    },
    codeValue: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '800',
        letterSpacing: 1
    }
});
