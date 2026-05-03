//
//  playersSlice.ts
//  
//
//  Created by Wim Kinnet on 03/05/2026.
//

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type Player from '../../app/types'

interface PlayersState {
	entities: Record<string, Player>;
	ids: string[];
}

const initialState: PlayersState = {
	entities: {
		'pl-1': {
			id: 'pl-1',
			firstName: 'Laurens',
			lastName: 'Kinnet',
			dateOfBirth: '22/09/2016',
		},
		'pl-2': {
			id: 'pl-2',
			firstName: 'Fernand',
			lastName: 'Marien',
		},
		'pl-3': {
			id: 'pl-3',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
	},
	ids: ['pl-1', 'pl-2', 'pl-3'],
};

const slice = createSlice({
	name: 'players',
	initialState,
	reducers: {
		addPlayer: {
			reducer(state, action: PayloadAction<Player>) {
				const pl = action.payload;
				state.entities[pl.id] = pl;
				state.ids.push(pl.id);
			},
		},
		updatePlayer(state, action: PayloadAction<{ id: string; changes: Partial<Player> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removePlayer(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addPlayer, updatePlayer, removePlayer } = slice.actions;
export default slice.reducer;
