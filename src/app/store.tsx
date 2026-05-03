//
//  store.ts
//  
//
//  Created by Wim Kinnet on 03/05/2026.
//

import { configureStore } from '@reduxjs/toolkit';
import playerReducer from '../features/players/playersSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
	players: playerReducer,
    ui: uiReducer,
 }
});

export type RootState = ReturnType<typeof store.getState>;
