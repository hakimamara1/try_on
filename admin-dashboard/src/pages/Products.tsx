import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Plus, Search, Edit, Trash2, Tag, Layers, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface Product {
    _id: string;
    name: string;
    price: number;
    category: { name: string };
    image: string;
    sizes: string[];
    colors: string[];
    description?: string;
}

const Products = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data.data;
        }
    });

    const filteredProducts = products?.filter((p: Product) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <RefreshCw className="animate-spin" /> Loading products...
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center h-full text-red-400 gap-2">
            Failed to load products. Please try again.
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Products</h2>
                    <p className="text-gray-400 mt-1">Manage your inventory and catalog</p>
                </div>
                <button
                    onClick={() => navigate('/products/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-gray-950/50 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {filteredProducts?.length || 0} products
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-gray-900/40">
                        <thead>
                            <tr className="bg-gray-750 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Details</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Variants</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredProducts?.map((product: Product) => (
                                <tr
                                    key={product._id}
                                    className="hover:bg-gray-800/30 transition-all group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-gray-800 overflow-hidden border border-gray-700">
                                                <img
                                                    src={product.image?.startsWith('http') ? product.image : `http://localhost:5000/uploads/${product.image || 'placeholder.png'}`}
                                                    alt={product.name || 'Product'}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-200">{product.name || 'Unnamed Product'}</div>
                                                <div className="text-xs text-gray-500 font-mono">#{product._id?.slice(-6) || '???'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-400 font-medium">${(product.price || 0).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                            <Tag size={12} />
                                            {product.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <Layers size={10} /> {product.sizes.length} Sizes
                                                </span>
                                            )}
                                            {Array.isArray(product.colors) && product.colors.length > 0 && (
                                                <div className="flex -space-x-1">
                                                    {product.colors.slice(0, 3).map((color, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-4 h-4 rounded-full border border-gray-700 ring-2 ring-gray-900"
                                                            style={{ backgroundColor: color }}
                                                            title={color}
                                                        />
                                                    ))}
                                                    {product.colors.length > 3 && (
                                                        <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-700 ring-2 ring-gray-900 flex items-center justify-center text-[8px] text-gray-400">
                                                            +{product.colors.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/products/${product._id}/edit`)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
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

export default Products;
