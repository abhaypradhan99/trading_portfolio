
import { useState, useEffect } from 'react';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  large?: string;
}

interface AddTokenModalProps {
  onClose: () => void;
  onAdd: (tokens: { id: string; name: string; symbol: string }[]) => void;
}

const AddTokenModal = ({ onClose, onAdd }: AddTokenModalProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Coin[]>([]);
  const [trending, setTrending] = useState<Coin[]>([]);
  const [selected, setSelected] = useState<{ id: string; name: string; symbol: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
      const data = await res.json();
      setTrending(data.coins.map((c: any) => c.item));
    } catch (err) {
      setError('Failed to load trending');
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await res.json();
      setResults(data.coins);
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  const toggleSelect = (token: Coin) => {
    if (selected.some((s) => s.id === token.id)) {
      setSelected(selected.filter((s) => s.id !== token.id));
    } else {
      setSelected([...selected, { id: token.id, name: token.name, symbol: token.symbol }]);
    }
  };

  const list = search ? results : trending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
        style={{ 
          backgroundColor: '#1a1a1a',
          border: '1px solid #333'
        }}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium text-lg">Search + Add Token Modal</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search tokens (e.g., ETH, SOL)..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="px-4 py-2 bg-gray-850" style={{ backgroundColor: '#1f1f1f' }}>
          <h3 className="text-gray-400 text-sm font-medium">
            {search ? 'Results' : 'Trending'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto max-h-80">
          {error && (
            <div className="p-4 text-red-400 text-sm">{error}</div>
          )}
          
          {loading ? (
            <div className="p-4 text-gray-400 text-sm">Loading...</div>
          ) : (
            <div 
                className="space-y-0"
                style={{
                    maxHeight: '20rem',
                    overflowY: 'auto',
                    scrollbarColor: '#27272A #1f1f1f',
                    scrollbarWidth: 'thin'
                }}
            >
                {list.map((token) => (
                    <div
                        key={token.id}
                        onClick={() => toggleSelect(token)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800 last:border-b-0"
                    >
                        <div className="flex items-center space-x-3">
                            <img 
                                src={token.thumb || token.large} 
                                alt={token.name}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <div>
                                <div className="text-white font-medium text-sm">
                                    {token.name}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {token.symbol.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {selected.some((s) => s.id === token.id) && (
                                <div style={{color:"#A9E851"}} className=" text-lg">★</div>
                            )}
                            <div className="w-5 h-5 border-2 border-gray-600 rounded-full flex items-center justify-center">
                                {selected.some((s) => s.id === token.id) && (
                                    <div style={{backgroundColor:"#A9E851"}} className="w-3 h-3 rounded-full"></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <style>
                    {`
                        .space-y-0::-webkit-scrollbar {
                            width: 8px;
                            background: #1f1f1f;
                        }
                        .space-y-0::-webkit-scrollbar-thumb {
                            background: #27272A;
                            border-radius: 8px;
                        }
                    `}
                </style>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t border-gray-700 flex justify-between items-center"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <div className="text-gray-400 text-sm">
            {selected.length > 0 && `${selected.length} selected`}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => onAdd(selected)} 
              disabled={selected.length === 0}
              className="px-4 py-2 bg-green-500 text-black font-medium rounded-md hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              style={{ backgroundColor: selected.length > 0 ? '#A9E851' : '#666' }}
            >
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AddTokenModal;