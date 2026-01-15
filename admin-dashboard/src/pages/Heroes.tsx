import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHeroes, deleteHero, type Hero } from '../api/heroService';

const Heroes = () => {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        try {
            const data = await getHeroes();
            setHeroes(data.data);
        } catch (error) {
            console.error('Failed to fetch heroes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this slide?')) {
            try {
                await deleteHero(id);
                fetchHeroes();
            } catch (error) {
                console.error('Failed to delete hero', error);
                alert('Failed to delete hero slide');
            }
        }
    };

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Hero Slides
                </h2>
                <Link
                    to="/heroes/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add New Slide</span>
                </Link>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-750 border-b border-gray-700">
                        <tr>
                            <th className="p-4 text-gray-400 font-medium">Image</th>
                            <th className="p-4 text-gray-400 font-medium">Title</th>
                            <th className="p-4 text-gray-400 font-medium">CTA</th>
                            <th className="p-4 text-gray-400 font-medium">Link</th>
                            <th className="p-4 text-gray-400 font-medium">Order</th>
                            <th className="p-4 text-gray-400 font-medium">Status</th>
                            <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {heroes.map((hero) => (
                            <tr key={hero._id} className="hover:bg-gray-750/50">
                                <td className="p-4">
                                    <img
                                        src={hero.image}
                                        alt={hero.title}
                                        className="w-20 h-10 object-cover rounded"
                                    />
                                </td>
                                <td className="p-4 font-medium text-white">
                                    {hero.title}
                                    <div className="text-xs text-gray-500">{hero.subtitle}</div>
                                </td>
                                <td className="p-4 text-gray-300">{hero.ctaText}</td>
                                <td className="p-4 text-gray-300">
                                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                                        {hero.linkType}: {hero.linkValue}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-300">{hero.order}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${hero.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {hero.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            to={`/heroes/${hero._id}/edit`}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(hero._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {heroes.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No hero slides found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Heroes;
