import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Search, User as UserIcon, Award, Shield, Truck, Edit } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    points_balance: number;
    avatar_url?: string;
    createdAt: string;
}

const Users = () => {
    const [search, setSearch] = useState('');
    const [editingPoints, setEditingPoints] = useState<string | null>(null);
    const [pointsValue, setPointsValue] = useState<number>(0);

    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data.data;
        }
    });

    const updatePointsMutation = useMutation({
        mutationFn: async ({ id, points }: { id: string; points: number }) => {
            await api.put(`/admin/users/${id}/points`, { points });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingPoints(null);
        }
    });

    const filteredUsers = users?.filter((u: User) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const config: Record<string, string> = {
            admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            staff: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            delivery: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            user: 'bg-gray-800 text-gray-400 border-gray-700'
        };
        return config[role] || config.user;
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            Loading users...
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center h-full text-red-400 gap-2">
            Failed to load users. Please check your connection.
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Users</h2>
                    <p className="text-gray-400 mt-1">Manage customer base and loyalty points</p>
                </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-950/50 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {filteredUsers?.length || 0} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-gray-900/40">
                        <thead className="bg-gray-750 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Joined</th>
                                <th className="px-6 py-4 font-semibold">Points</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredUsers?.map((user: User) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-800/30 transition-all group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="text-gray-500" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-200">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadge(user.role)} capitalize`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role === 'delivery' && <Truck size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingPoints === user._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-20 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-purple-500 outline-none"
                                                    value={pointsValue}
                                                    onChange={(e) => setPointsValue(parseInt(e.target.value) || 0)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            updatePointsMutation.mutate({ id: user._id, points: pointsValue });
                                                        } else if (e.key === 'Escape') {
                                                            setEditingPoints(null);
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => updatePointsMutation.mutate({ id: user._id, points: pointsValue })}
                                                    className="text-xs text-green-400 hover:text-green-300"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-yellow-500 font-medium">
                                                <Award size={16} />
                                                {user.points_balance}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setEditingPoints(user._id);
                                                setPointsValue(user.points_balance);
                                            }}
                                            className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Adjust Points"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
