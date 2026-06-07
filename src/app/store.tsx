import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import { scoutingApi } from '../services/ScoutingApi';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [scoutingApi.reducerPath]: scoutingApi.reducer,
 },
 middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(scoutingApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
