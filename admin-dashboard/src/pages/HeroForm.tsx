import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Loader } from 'lucide-react';
import { getHeroes, createHero, updateHero, type Hero } from '../api/heroService';

const HeroForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Hero>>({
        title: '',
        subtitle: '',
        image: '',
        ctaText: 'Shop Collection',
        linkType: 'none',
        linkValue: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchHero();
        }
    }, [id]);

    const fetchHero = async () => {
        try {
            setLoading(true);
            const data = await getHeroes();
            const hero = data.data.find((h: Hero) => h._id === id);
            if (hero) {
                setFormData(hero);
            }
        } catch (error) {
            console.error('Failed to fetch hero', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEditMode && id) {
                await updateHero(id, formData);
            } else {
                await createHero(formData);
            }
            navigate('/heroes');
        } catch (error) {
            console.error('Failed to save hero', error);
            alert('Failed to save hero slide');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/heroes')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Back to Heroes
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Edit Slide' : 'New Slide'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-400">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Summer Collection"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-400">Subtitle</label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. New arrivals for the season"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-400">Image URL</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                        />
                        {formData.image && (
                            <div className="mt-2 h-40 rounded-lg overflow-hidden bg-gray-900">
                                <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">CTA Text</label>
                        <input
                            type="text"
                            name="ctaText"
                            value={formData.ctaText}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Order</label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Link Type</label>
                        <select
                            name="linkType"
                            value={formData.linkType}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="none">None</option>
                            <option value="product">Product</option>
                            <option value="category">Category</option>
                            <option value="external">External Link</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Link Value</label>
                        <input
                            type="text"
                            name="linkValue"
                            value={formData.linkValue}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder={formData.linkType === 'product' ? 'Product ID' : formData.linkType === 'category' ? 'Category Name' : 'URL or ID'}
                        />
                    </div>

                    <div className="col-span-2 flex items-center space-x-3 pt-4">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-300">Active (Visible in app)</label>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{isEditMode ? 'Update Slide' : 'Create Slide'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HeroForm;
