import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Search, Printer, QrCode, RefreshCw, ChevronDown } from 'lucide-react';


interface Order {
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    status: string;
    isPaid: boolean;
    createdAt: string;
    qrCode: string;
    trackingNumber?: string;
    orderItems: any[];
}

const statusConfig: any = {
    'Preparing': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    'Shipped': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    'Out for Delivery': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    'Delivered': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    'Cancelled': { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' }
};

const Orders = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.get('/orders');
            return res.data.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await api.put(`/orders/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });

    const generateInvoice = (order: Order) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('INVOICE', 14, 22);

        doc.setFontSize(10);
        doc.text(`Order ID: ${order._id}`, 14, 32);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);
        doc.text(`Customer: ${order.user.name}`, 14, 44);

        const tableData = order.orderItems.map((item: any) => [
            item.name,
            item.quantity,
            `$${item.price.toFixed(2)}`,
            `$${(item.price * item.quantity).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [['Item', 'Qty', 'Price', 'Total']],
            body: tableData,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(`Total: $${order.totalPrice.toFixed(2)}`, 14, finalY);

        doc.save(`invoice-${order._id}.pdf`);
    };

    const showQRCode = async (order: Order) => {
        try {
            const url = await QRCode.toDataURL(order.qrCode);
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(`
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                        <img src="${url}" style="width:300px;height:300px;"/>
                        <h2 style="margin-top:20px;">${order._id}</h2>
                        <p>Scan to confirm delivery</p>
                    </div>
                `);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredOrders = orders?.filter((o: Order) => {
        const matchesSearch = o._id.includes(search) || o.user.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <RefreshCw className="animate-spin" /> Loading orders...
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Order Management</h2>
                    <p className="text-gray-400 mt-1">Track and manage customer orders</p>
                </div>

                <div className="flex gap-3 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                    {['All', 'Preparing', 'Shipped', 'Delivered'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            className="w-full bg-gray-950/50 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {filteredOrders?.length || 0} orders
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-gray-900/40">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredOrders?.map((order: Order) => (
                                <tr
                                    key={order._id}
                                    className="hover:bg-gray-800/30 transition-all group"
                                >
                                    <td className="px-6 py-4 font-mono text-sm text-gray-300">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                                {order.user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-gray-200">{order.user?.name || 'Guest'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group/select">
                                            <select
                                                className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500/50 transition-all ${statusConfig[order.status]?.color || 'text-gray-400'
                                                    } ${statusConfig[order.status]?.bg || 'bg-gray-800'} ${statusConfig[order.status]?.border || 'border-gray-700'}`}
                                                value={order.status}
                                                onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                                            >
                                                {Object.keys(statusConfig).map(status => (
                                                    <option key={status} value={status} className="bg-gray-900 text-white">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig[order.status]?.color}`} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => generateInvoice(order)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                                title="Print Invoice"
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button
                                                onClick={() => showQRCode(order)}
                                                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all"
                                                title="Generate QR"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                        </div>
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

export default Orders;
