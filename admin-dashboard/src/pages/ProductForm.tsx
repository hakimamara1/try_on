import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Save, X, Plus, Image as ImageIcon } from 'lucide-react';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string; // ID
    image: string;
    images?: string[];
    sizes: { value: string }[];
    colors: { value: string }[];
}

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            image: '',
            images: [],
            sizes: [],
            colors: []
        }
    });

    const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
        control,
        name: "sizes"
    });

    const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
        control,
        name: "colors"
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/products/categories')).data.data
    });

    // Fetch product if edit mode
    useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await api.get(`/products/${id}`);
            const data = res.data.data;
            // Transform data for form
            if (data.images && data.images.length > 0) {
                setPreviewUrls(data.images);
            } else if (data.image) {
                setPreviewUrls([data.image]);
            }
            reset({
                ...data,
                category: data.category?._id || data.category, // Handle populated or ID
                sizes: data.sizes?.map((s: string) => ({ value: s })) || [],
                colors: data.colors?.map((c: string) => ({ value: c })) || []
            });
            return data;
        },
        enabled: isEditMode
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const config = payload instanceof FormData ? {
                headers: { 'Content-Type': 'multipart/form-data' }
            } : {};

            if (isEditMode) {
                await api.put(`/products/${id}`, payload, config);
            } else {
                await api.post('/products', payload, config);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/products');
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const onSubmit = (data: ProductFormData) => {
        if (selectedFiles.length > 0) {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('price', String(data.price));
            formData.append('category', data.category);

            // Append each file to 'images' field
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });
            // Also append the first image as 'image' for backward compatibility if needed, 
            // OR let the backend handle extracting it from 'images'. 
            // My backend logic handles both, but frontend previously sent 'image'.
            // If I send 'images', backend will populate 'images' array.
            // If I want 'image' field (string) to be populated, I should probably send 'image' too 
            // or let backend pick first one. 
            // Backend Controller: if (req.files.image) ... if (req.files.images) ...
            // So I should send both or one.
            // Let's send 'images'.
            // Wait, I updated backend to look for 'image' AND 'images'. 
            // If i want to set the main 'image' url, I should maybe send the first file as 'image' key too?
            // "if (req.files.image) ... req.body.image = result.secure_url;"
            // "if (req.files.images) ... req.body.images = imageUrls;"
            // So if I only send 'images', 'req.body.image' might not be updated unless I explicitly set it on backend from 'images[0]'.
            // My backend controller does NOT appear to automatically set req.body.image from req.files.images.
            // So I should send the first file as 'image' as well, or update backend.
            // Updating Frontend is safer now.
            if (selectedFiles.length > 0) {
                formData.append('image', selectedFiles[0]);
            }

            // Handle arrays for FormData
            data.sizes.forEach(s => formData.append('sizes', s.value));
            data.colors.forEach(c => formData.append('colors', c.value));

            mutation.mutate(formData);
        } else {
            const payload = {
                ...data,
                sizes: data.sizes.map(s => s.value),
                colors: data.colors.map(c => c.value)
            };
            mutation.mutate(payload);
        }
    };



    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                        {isEditMode ? 'Edit Product' : 'New Product'}
                    </h2>
                    <p className="text-gray-400 mt-1">Fill in the details below</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={mutation.isPending}
                        className={`flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 ${mutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Product
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                placeholder="e.g. Summer Floral Dress"
                            />
                            {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                                placeholder="Product description..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { required: 'Price is required', min: 0 })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                <select
                                    {...register('category')}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Variants</h3>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Sizes */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-400">Sizes</label>
                                    <button
                                        type="button"
                                        onClick={() => appendSize({ value: '' })}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {sizeFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            <input
                                                {...register(`sizes.${index}.value` as const)}
                                                className="flex-1 bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm text-white focus:border-emerald-500/50 outline-none"
                                                placeholder="e.g. M, L, XL"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSize(index)}
                                                className="text-gray-500 hover:text-red-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-400">Colors</label>
                                    <button
                                        type="button"
                                        onClick={() => appendColor({ value: '#000000' })}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {colorFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                {...register(`colors.${index}.value` as const)}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                            />
                                            <input
                                                {...register(`colors.${index}.value` as const)}
                                                className="flex-1 bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm text-white focus:border-emerald-500/50 outline-none uppercase font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeColor(index)}
                                                className="text-gray-500 hover:text-red-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Image */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Existing/Preview Images */}
                            {previewUrls.map((url, index) => (
                                <div key={index} className="aspect-square bg-gray-950 rounded-lg border border-gray-800 overflow-hidden relative group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                                setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            className="text-white bg-red-500 p-1 rounded-full hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Upload Button Block */}
                            <div className="aspect-square bg-gray-950 rounded-lg border-2 border-dashed border-gray-800 flex items-center justify-center hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                                <div className="text-center text-gray-500">
                                    <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Add Images</p>
                                </div>
                            </div>
                        </div>

                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                            <input
                                {...register('image')}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-sm mb-2"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-gray-500">
                                Enter a direct link or upload from your computer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
