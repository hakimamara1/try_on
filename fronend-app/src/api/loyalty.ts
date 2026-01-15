import client from './client';

export const getLoyaltyInfo = async () => {
    try {
        const [balanceRes, rewardsRes] = await Promise.all([
            client.get('/loyalty/balance'),
            client.get('/loyalty/rewards')
        ]);

        const points = balanceRes.data.balance || 0;
        let tier = 'Bronze';
        if (points >= 300) tier = 'Gold';
        else if (points >= 100) tier = 'Silver';

        return {
            points,
            tier,
            rewards: rewardsRes.data.data || [],
            history: balanceRes.data.history || []
        };
    } catch (error) {
        console.error('Error fetching loyalty info:', error);
        throw error;
    }
};

export const redeemReward = async (rewardId: string) => {
    try {
        const response = await client.post('/loyalty/redeem', { rewardId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const claimProfileBonus = async () => {
    try {
        const response = await client.post('/loyalty/profile-bonus');
        return response.data;
    } catch (error) {
        throw error;
    }
};
