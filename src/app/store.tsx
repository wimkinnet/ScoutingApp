import { configureStore } from '@reduxjs/toolkit';
import playerReducer from '../features/players/playersSlice';
import clubReducer from '../features/clubs/clubsSlice';
import seasonReducer from '../features/seasons/seasonsSlice';
import teamReducer from '../features/teams/teamsSlice';
import gameReducer from '../features/games/gamesSlice';
import actionReducer from '../features/actions/actionsSlice'
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
	  players: playerReducer,
    clubs: clubReducer,
    seasons: seasonReducer,
    teams: teamReducer,
    games: gameReducer,
    actions: actionReducer,
    ui: uiReducer,
 }
});

export type RootState = ReturnType<typeof store.getState>;
