import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    process.env.NODE_ENV !== 'production' 
      ? getDefaultMiddleware().concat(logger)
      : getDefaultMiddleware(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;