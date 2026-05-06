import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Player } from '../../app/types'

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
			dateOfBirth: new Date(2016, 8, 22),
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
		'pl-4': {
			id: 'pl-4',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
		'pl-5': {
			id: 'pl-5',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
		'pl-6': {
			id: 'pl-6',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
		'pl-7': {
			id: 'pl-7',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
		'pl-8': {
			id: 'pl-8',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
		'pl-9': {
			id: 'pl-9',
			firstName: 'Boaz',
			lastName: 'Coart',
		},
	},
	ids: ['pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-7', 'pl-8', 'pl-9'],
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
			prepare(player: Omit<Player, 'id'>) {
          		return { payload: { id: nanoid(), ...player } };
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
