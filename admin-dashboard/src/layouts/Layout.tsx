import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const Layout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />
                    <SidebarItem icon={Package} label="Products" path="/products" />
                    <SidebarItem icon={ShoppingCart} label="Orders" path="/orders" />
                    <SidebarItem icon={Users} label="Users" path="/users" />
                    <SidebarItem icon={Package} label="Heroes" path="/heroes" />
                    <SidebarItem icon={Settings} label="Settings" path="/settings" />
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-gray-900">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
