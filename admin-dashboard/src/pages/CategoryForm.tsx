import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';

const CategoryForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    // Fetch category data if in edit mode
    const { data: categoryData, isLoading: isLoadingData } = useQuery({
        queryKey: ['category', id],
        queryFn: async () => {
            const res = await api.get(`/categories/${id}`);
            return res.data.data;
        },
        enabled: isEditMode
    });

    useEffect(() => {
        if (categoryData) {
            setName(categoryData.name);
            setPreview(categoryData.image);
        }
    }, [categoryData]);

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            if (isEditMode) {
                await api.put(`/categories/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate('/categories');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (image) {
            formData.append('image', image);
        }

        mutation.mutate(formData);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    if (isEditMode && isLoadingData) return (
        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="animate-spin" /> Loading category...
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/categories')}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Edit Category' : 'New Category'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isEditMode ? 'Update existing category details' : 'Create a new product category'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-6 shadow-xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-950/50 text-white px-4 py-2.5 rounded-lg border border-gray-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-600"
                        placeholder="e.g. Summer Collection"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category Image</label>
                    <div className="flex flex-col gap-4">
                        {preview && (
                            <div className="relative w-full h-48 bg-gray-950/50 rounded-lg overflow-hidden border border-gray-800 group">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setPreview('');
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-gray-950/30 hover:bg-gray-900/50 hover:border-blue-500/50 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                <p className="text-sm text-gray-500 group-hover:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-600">SVG, PNG, JPG or GIF</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Category
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
