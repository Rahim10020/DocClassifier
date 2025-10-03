export default function TestTailwind() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Test Tailwind CSS
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Card 1
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Ceci est un test pour vérifier que les classes Tailwind s'appliquent correctement.
                        </p>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                            Bouton Test
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Card 2
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Si vous voyez ce contenu stylé, Tailwind fonctionne correctement.
                        </p>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
                            Autre Bouton
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Card 3
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Les classes personnalisées devraient également fonctionner.
                        </p>
                        <button className="bg-gradient-to-r from-primary to-primary-gradient text-white px-4 py-2 rounded-md transition-colors">
                            Bouton Custom
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <div className="inline-block bg-white rounded-lg shadow-lg p-6">
                        <p className="text-gray-800">
                            Si cette page s'affiche correctement avec tous les styles, 
                            Tailwind CSS est configuré et fonctionne parfaitement !
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

