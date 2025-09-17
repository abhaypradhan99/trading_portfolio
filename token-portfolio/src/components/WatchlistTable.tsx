import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Edit, Trash } from 'lucide-react';

interface PriceData {
  price: number;
  change24h: number;
  sparkline: number[];
  image: string;
  symbol: string;
  name: string;
}

interface WatchlistTableProps {
  watchlist: { id: string; name: string; symbol: string; holdings: number }[];
  prices: Record<string, PriceData>;
  onUpdateHoldings: (id: string, holdings: number) => void;
  onRemove: (id: string) => void;
}

const WatchlistTable = ({ watchlist, prices, onUpdateHoldings, onRemove }: WatchlistTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempHoldings, setTempHoldings] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = (id: string, holdings: number) => {
    setEditingId(id);
    setTempHoldings(holdings.toString());
  };

  const handleSave = (id: string) => {
    onUpdateHoldings(id, parseFloat(tempHoldings) || 0);
    setEditingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-white rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
        <thead style={{ backgroundColor: '#27272A' }} className="text-gray-400">
          <tr>
            <th className="py-3 px-4 text-left">Token</th>
            <th className="py-3 px-4 text-left">Price</th>
            <th className="py-3 px-4 text-left">24h %</th>
            <th className="py-3 px-4 text-left">Sparkline</th>
            <th className="py-3 px-4 text-left">Holdings</th>
            <th className="py-3 px-4 text-left">Value</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {watchlist.map((item) => {
            const data = prices[item.id] || {};
            const value = (data.price || 0) * item.holdings;
            const changeColor = data.change24h > 0 ? 'text-green-500' : 'text-red-500';
            return (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-3 px-4 flex items-center">
                  <img src={data.image} alt="" className="w-6 h-6 mr-2 rounded-full" />
                  {item.name} <span className="text-gray-400 ml-1">({item.symbol})</span>
                </td>
                <td className="py-3 px-4">${data.price?.toLocaleString() || '--'}</td>
                <td className={`py-3 px-4 ${changeColor}`}>{data.change24h?.toFixed(2) || '--'}%</td>
                <td className="py-3 px-4 w-24 h-12">
                  {data.sparkline && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.sparkline.map((p) => ({ price: p }))}>
                        <Line type="monotone" dataKey="price" stroke={data.change24h > 0 ? '#00ff00' : '#ff0000'} dot={false} strokeWidth={1} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === item.id ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={tempHoldings}
                        onChange={(e) => setTempHoldings(e.target.value)}
                        className="w-20 bg-gray-700 text-white border border-gray-500 rounded px-2 py-1"
                      />
                      <button onClick={() => handleSave(item.id)} className="ml-2 text-accent hover:underline">Save</button>
                    </div>
                  ) : (
                    <span onClick={() => handleEdit(item.id, item.holdings)} className="cursor-pointer hover:underline">{item.holdings.toFixed(4)}</span>
                  )}
                </td>
                <td className="py-3 px-4">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 relative">
                  {/* Desktop buttons */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <button onClick={() => handleEdit(item.id, item.holdings)} className="hover:text-accent"><Edit size={16} /></button>
                    <button onClick={() => onRemove(item.id)} className="hover:text-red-500"><Trash size={16} /></button>
                  </div>
                  {/* Mobile dropdown */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                    >
                      ⋮
                    </button>
                    {dropdownOpen === item.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 bottom-8 w-32 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 py-1"
                      >
                        <button
                          onClick={() => {
                            handleEdit(item.id, item.holdings);
                            setDropdownOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center text-white"
                        >
                          <Edit size={14} className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onRemove(item.id);
                            setDropdownOpen(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center text-red-400"
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTable;
