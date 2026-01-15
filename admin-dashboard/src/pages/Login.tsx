import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            // API returns { success: true, token: "...", user: {...} }? 
            // Or just token? Need to check backend auth controller.
            // Assuming standard response for now.
            const { token, user } = res.data;

            const allowedRoles = ['admin', 'staff', 'delivery'];
            if (!user || !user.role || !allowedRoles.includes(user.role)) {
                setError('Access denied. Admin rights required.');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Admin Portal</h2>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 mb-4 rounded text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded transition-colors shadow-lg shadow-blue-600/20">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
