import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { MoreVertical, Edit, Trash } from 'lucide-react';

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

  const handleEdit = (id: string, holdings: number) => {
    setEditingId(id);
    setTempHoldings(holdings.toString());
  };

  const handleSave = (id: string) => {
    onUpdateHoldings(id, parseFloat(tempHoldings) || 0);
    setEditingId(null);
  };

  return (
 <table className="w-full text-sm text-white">
  <thead className="text-gray-400 border-b border-gray-700">
    <tr>
      <th className="py-2 text-left">Token</th>
      <th className="py-2 text-left">Price</th>
      <th className="py-2 text-left">24h %</th>
      <th className="py-2 text-left">Sparkline</th>
      <th className="py-2 text-left">Holdings</th>
      <th className="py-2 text-left">Value</th>
      <th className="py-2"></th>
    </tr>
  </thead>
  <tbody>
    {watchlist.map((item) => {
      const data = prices[item.id] || {};
      const value = (data.price || 0) * item.holdings;
      const changeColor = data.change24h > 0 ? 'text-green-500' : 'text-red-500';
      return (
        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
          <td className="py-2 flex items-center">
            <img src={data.image} alt="" className="w-6 h-6 mr-2 rounded-full" />
            {item.name} <span className="text-gray-400 ml-1">({item.symbol})</span>
          </td>
          <td className="py-2">${data.price?.toLocaleString() || '--'}</td>
          <td className={`py-2 ${changeColor}`}>{data.change24h?.toFixed(2) || '--'}%</td>
          <td className="py-2 w-24 h-12">
            {data.sparkline && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sparkline.map((p) => ({ price: p }))}>
                  <Line type="monotone" dataKey="price" stroke={data.change24h > 0 ? '#00ff00' : '#ff0000'} dot={false} strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </td>
          <td className="py-2">
            {editingId === item.id ? (
              <div className="flex items-center">
                <input
                  type="number"
                  value={tempHoldings}
                  onChange={(e) => setTempHoldings(e.target.value)}
                  className="w-20 bg-card text-white border border-gray-500 rounded px-2 py-1"
                />
                <button onClick={() => handleSave(item.id)} className="ml-2 text-accent hover:underline">Save</button>
              </div>
            ) : (
              <span onClick={() => handleEdit(item.id, item.holdings)} className="cursor-pointer hover:underline">{item.holdings.toFixed(4)}</span>
            )}
          </td>
          <td className="py-2">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td className="py-2">
            <div className="relative flex items-center space-x-2">
              <button onClick={() => handleEdit(item.id, item.holdings)} className="hover:text-accent"><Edit size={16} /></button>
              <button onClick={() => onRemove(item.id)} className="hover:text-red-500"><Trash size={16} /></button>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

  );
};

export default WatchlistTable;
