import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, prefix = '' }: any) => (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 transition-all">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { data: analytics, isLoading, isError } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics');
            return res.data.data;
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <Activity className="animate-spin" /> Loading analytics...
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center h-full text-red-400">
            Failed to load analytics data.
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Dashboard Overview
                </h2>
                <p className="text-gray-400 mt-1">Real-time business insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={analytics?.totalRevenue || 0}
                    prefix="DA"
                    icon={DollarSign}
                    color="bg-emerald-500 text-emerald-400"
                />
                <StatCard
                    title="Total Orders"
                    value={analytics?.totalOrders || 0}
                    icon={ShoppingBag}
                    color="bg-blue-500 text-blue-400"
                />
                <StatCard
                    title="Active Users"
                    value={analytics?.totalUsers || 0}
                    icon={Users}
                    color="bg-purple-500 text-purple-400"
                />
                <StatCard
                    title="Products"
                    value={analytics?.totalProducts || 0}
                    icon={Package}
                    color="bg-orange-500 text-orange-400"
                />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-blue-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Order Status</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(analytics?.ordersByStatus || {}).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <span className="text-gray-300 font-medium capitalize">{status}</span>
                                <span className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded-md text-sm font-bold">
                                    {count}
                                </span>
                            </div>
                        ))}
                        {Object.keys(analytics?.ordersByStatus || {}).length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">No orders yet.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/10">
                    <h3 className="text-lg font-bold text-white mb-4">Quick Tips</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            Review "Pending" orders to ensure timely shipping.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            Check "User Points" periodically to reward top customers manually.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            Ensure product variants (sizes/colors) are up to date.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
