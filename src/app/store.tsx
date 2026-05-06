import { configureStore } from '@reduxjs/toolkit';
import playerReducer from '../features/players/playersSlice';
import clubReducer from '../features/clubs/clubsSlice';
import seasonReducer from '../features/seasons/seasonsSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
	  players: playerReducer,
    clubs: clubReducer,
    seasons: seasonReducer,
    ui: uiReducer,
 }
});

export type RootState = ReturnType<typeof store.getState>;
