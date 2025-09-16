import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PortfolioTotal from './components/PortfolioTotal';
import WatchlistTable from './components/WatchlistTable';
import AddTokenModal from './components/AddTokenModal';
import WalletButton from './components/WalletButton';
import axios from 'axios';
import { addTokens, updateHoldings, removeToken } from './store';
import type { RootState } from './store';
import { Star } from 'lucide-react';

const App = () => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state: RootState) => state.portfolio.watchlist);
  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number; sparkline: number[]; image: string; symbol: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchPrices = async () => {
    if (!watchlist.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ids = watchlist.map((item) => item.id).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=24h`
      );
      const data = response.data.reduce((acc, coin: any) => {
        acc[coin.id] = {
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          sparkline: coin.sparkline_in_7d.price,
          image: coin.image,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
        };
        return acc;
      }, {} as Record<string, { price: number; change24h: number; sparkline: number[]; image: string; symbol: string; name: string }>);
      setPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch prices');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
  }, [watchlist]);

  const handleAddTokens = (tokens: { id: string; name: string; symbol: string }[]) => {
    dispatch(addTokens(tokens));
    setIsModalOpen(false);
    fetchPrices();
  };

  const totalValue = watchlist.reduce(
    (sum, item) => sum + (prices[item.id]?.price || 0) * item.holdings,
    0
  );

  const allocations = watchlist.map((item) => ({
    name: prices[item.id]?.name || item.name,
    symbol: prices[item.id]?.symbol || item.symbol,
    value: (prices[item.id]?.price || 0) * item.holdings,
    color: getPieColor(item.id),
  })).filter((a) => a.value > 0);

  function getPieColor(id: string) {
    const colors = ['#ff7f50', '#9370db', '#00ffff', '#32cd32', '#4169e1'];
    return colors[watchlist.findIndex((item) => item.id === id) % colors.length];
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold flex items-center">
            <div className="w-4 h-4 bg-accent mr-2"></div> Token Portfolio
          </span>
          <WalletButton />
        </header>
        <PortfolioTotal
          total={totalValue}
          allocations={allocations}
          lastUpdated={lastUpdated}
        />
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center">
              <Star className="mr-2 text-yellow-400" size={20} /> Watchlist
            </h2>
            <div className="flex space-x-2">
                <button
                onClick={fetchPrices}
                className="bg-card text-white px-4 py-2 rounded-md hover:bg-gray-600 shadow-lg"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.90)' }}
                >
                Refresh Prices
                </button>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{backgroundColor:"#A9E851"}}
                className="bg-accent text-black px-4 py-2 rounded-md hover:opacity-90"
              >
                + Add Token
              </button>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : watchlist.length === 0 ? (
            <p className="text-gray-400">Watchlist is empty. Add tokens to get started.</p>
          ) : (
            <WatchlistTable
              watchlist={watchlist}
              prices={prices}
              onUpdateHoldings={(id, holdings) => dispatch(updateHoldings({ id, holdings }))}
              onRemove={(id) => dispatch(removeToken(id))}
            />
          )}
          <div className="mt-4 text-sm text-gray-400 flex justify-between">
            <span>1 – 10 of {watchlist.length}</span>
            <div>1 of {Math.ceil(watchlist.length / 10)} pages Prev Next</div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddTokenModal onClose={() => setIsModalOpen(false)} onAdd={handleAddTokens} />
      )}
    </div>
  );
};

export default App;