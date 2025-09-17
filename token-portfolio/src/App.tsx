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
import logo from './assets/reacta.svg';
import refreshIcon from './assets/refresh.svg';
import plusIcon from './assets/plus.svg';
const App = () => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state: RootState) => state.portfolio.watchlist);
  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number; sparkline: number[]; image: string; symbol: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const data = response.data.reduce((acc: { [x: string]: { price: any; change24h: any; sparkline: any; image: any; symbol: any; name: any; }; }, coin: any) => {
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

  // Reset to first page if current page is empty after removing tokens
  useEffect(() => {
    const totalPages = Math.ceil(watchlist.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [watchlist.length, currentPage, itemsPerPage]);

  const handleAddTokens = (tokens: { id: string; name: string; symbol: string }[]) => {
    const tokensWithHoldings = tokens.map(token => ({
      ...token,
      holdings: 0
    }));
    dispatch(addTokens(tokensWithHoldings));
    setIsModalOpen(false);
    setCurrentPage(1); // Reset to first page when adding tokens
    fetchPrices();
  };

  const totalValue = watchlist.reduce(
    (sum, item) => sum + (prices[item.id]?.price || 0) * item.holdings,
    0
  );

  // Pagination logic
  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWatchlist = watchlist.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
        <header className="flex  sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
          <span className="text-xl font-bold flex items-center">
            <div style={{height:'28px',width:"32px",padding:"5px",borderRadius:"9px"}} className="bg-accent mr-2"> <img src={logo} alt="Logo" className="w-full h-full object-contain" /> </div> <span className="text sm:text-base align-middle">Token Portfolio</span> 
          </span>
          <WalletButton />
        </header>
        <PortfolioTotal
          total={totalValue}
          allocations={allocations}
          lastUpdated={lastUpdated}
        />
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg font-bold flex items-center">
              <Star className="mr-2" color='#A9E851' fill='#A9E851' size={20} /> Watchlist
            </h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button
                onClick={fetchPrices}
                className="flex gap-2 text-white px-4 py-2 rounded-md hover:bg-gray-600 shadow-lg justify-center sm:justify-start"
                style={{  }}
                >
                  <img src={refreshIcon} width={20} alt="Refresh" />
                Refresh Prices
                </button>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{backgroundColor:"#A9E851"}}
                className="bg-accent flex gap-2 text-black px-4 py-2 rounded-md hover:opacity-90 justify-center sm:justify-start"
              >
                  <img src={plusIcon} width={20} alt="Plus" />
                Add Token
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
              watchlist={paginatedWatchlist}
              prices={prices}
              onUpdateHoldings={(id, holdings) => dispatch(updateHoldings({ id, holdings }))}
              onRemove={(id) => dispatch(removeToken(id))}
            />
          )}
          <div className="mt-4 text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <span>{startIndex + 1} – {Math.min(endIndex, watchlist.length)} of {watchlist.length}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-accent hover:bg-gray-700'}`}
              >
                Prev
              </button>
              <span>{currentPage} of {totalPages} pages</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-accent hover:bg-gray-700'}`}
              >
                Next
              </button>
            </div>
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