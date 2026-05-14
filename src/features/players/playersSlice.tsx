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
			firstName: 'Cas',
			lastName: 'Olyslaegers',
		},
		'pl-5': {
			id: 'pl-5',
			firstName: 'Cis',
			lastName: 'Van Den Bogaert',
		},
		'pl-6': {
			id: 'pl-6',
			firstName: 'Bas',
			lastName: 'Breynaert',
		},
		'pl-7': {
			id: 'pl-7',
			firstName: 'Lex',
			lastName: 'Van Haevermaet',
		},
		'pl-8': {
			id: 'pl-8',
			firstName: 'Jerome',
			lastName: 'Vermeylen',
		},
		'pl-9': {
			id: 'pl-9',
			firstName: 'Jasper',
			lastName: 'Ceulemans',
		},
		'pl-10': {
			id: 'pl-10',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-11': {
			id: 'pl-11',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-12': {
			id: 'pl-12',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-13': {
			id: 'pl-13',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-14': {
			id: 'pl-14',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-15': {
			id: 'pl-15',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-16': {
			id: 'pl-16',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-17': {
			id: 'pl-17',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-18': {
			id: 'pl-18',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-19': {
			id: 'pl-19',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-20': {
			id: 'pl-20',
			firstName: 'Dummy',
			lastName: 'Player',
		},
		'pl-21': {
			id: 'pl-21',
			firstName: 'Dummy',
			lastName: 'Player',
		},
	},
	ids: ['pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-7', 'pl-8', 'pl-9',
		  'pl-10', 'pl-11', 'pl-12', 'pl-13', 'pl-14', 'pl-15', 'pl-16', 'pl-17', 'pl-18', 'pl-19', 'pl-20', 'pl-21',
	],
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
