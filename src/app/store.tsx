//
//  store.ts
//  
//
//  Created by Wim Kinnet on 03/05/2026.
//

import { configureStore } from '@reduxjs/toolkit';
import playerReducer from '../features/players/playersSlice';

export const store = configureStore({
    reducer: {
			players: playerReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
