import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/search/trending');
      setTrending(res.data.coins.map((c: any) => c.item));
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
      const res = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`);
      setResults(res.data.coins);
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
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
  <div className="bg-card p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
    <h2 className="text-lg font-bold text-white mb-4">Search + Add Token</h2>
    <input
      type="text"
      placeholder="Search tokens (e.g., ETH, SOL)..."
      value={search}
      onChange={handleSearch}
      className="w-full bg-background text-white border border-gray-600 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
    />
    {error && <p className="text-red-500 mb-2">{error}</p>}
    <div className="text-gray-400 text-xs mb-2">{search ? 'Results' : 'Trending'}</div>
    <ul className="space-y-2">
      {list.map((token) => (
        <li key={token.id} onClick={() => toggleSelect(token)} className="flex items-center justify-between p-2 rounded hover:bg-gray-700 cursor-pointer">
          <div className="flex items-center">
            <img src={token.thumb || token.large} alt="" className="w-8 h-8 mr-2 rounded-full" />
            <div>
              <p className="text-white">{token.name}</p>
              <p className="text-gray-400 text-xs">{token.symbol.toUpperCase()}</p>
            </div>
          </div>
          <input
            type="radio"
            checked={selected.some((s) => s.id === token.id)}
            readOnly
            className="accent-accent"
          />
        </li>
      ))}
    </ul>
    <div className="mt-4 flex justify-end space-x-2">
      <button onClick={onClose}   className="bg-card text-white px-4 py-2 rounded-md hover:bg-gray-600 shadow-lg"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>Cancel</button>
      <button onClick={() => onAdd(selected)} disabled={selected.length === 0} className="bg-accent text-black px-4 py-2 rounded hover:opacity-90 disabled:opacity-50" style={{backgroundColor:"#A9E851"}}>Add to Watchlist</button>
    </div>
  </div>
</div>

  );
};

export default AddTokenModal;