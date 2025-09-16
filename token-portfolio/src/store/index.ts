import { createSlice, type PayloadAction, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

interface Token {
  id: string;
  name: string;
  symbol: string;
  holdings: number;
}

interface PortfolioState {
  watchlist: Token[];
}

const initialState: PortfolioState = {
  watchlist: [],
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addTokens: (state, action: PayloadAction<Token[]>) => {
      const newTokens = action.payload.filter(
        (token) => !state.watchlist.some((item) => item.id === token.id)
      );
      state.watchlist = [...state.watchlist, ...newTokens.map((t) => ({ ...t, holdings: 0 }))];
    },
    updateHoldings: (state, action: PayloadAction<{ id: string; holdings: number }>) => {
      const { id, holdings } = action.payload;
      const item = state.watchlist.find((item) => item.id === id);
      if (item) item.holdings = holdings;
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addTokens, updateHoldings, removeToken } = portfolioSlice.actions;

const persistConfig = { key: 'root', storage };
const persistedReducer = persistReducer(persistConfig, portfolioSlice.reducer);

export const store = configureStore({ reducer: { portfolio: persistedReducer } });
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;