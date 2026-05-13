import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Game, GamePlayer } from '../../app/types'

interface GamesState {
	entities: Record<string, Game>;
	ids: string[];
}

const initialState: GamesState = {
	entities: {
		'ga-1': {
			id: 'ga-1',
			scoutTeamId: 't-1',
			otherTeamId: 't-2',
			date: new Date(2026, 8, 30),
			scoutHome: true,
			scoutPlayers: [
                {
                    playerId: 'pl-1',
                    shirtNumber: 4,
                },
                {
                    playerId: 'pl-2',
                    shirtNumber: 5,
                },
                {
                    playerId: 'pl-3',
                    shirtNumber: 6,
                },
                {
                    playerId: 'pl-4',
                    shirtNumber: 7,
                },
                {
                    playerId: 'pl-5',
                    shirtNumber: 8,
                },
                {
                    playerId: 'pl-6',
                    shirtNumber: 9,
                },
            ],
		},
	},
	ids: ['ga-1'],
};

const slice = createSlice({
	name: 'games',
	initialState,
	reducers: {
		addGame: {
			reducer(state, action: PayloadAction<Game>) {	
				const ga = action.payload;
				state.entities[ga.id] = ga;
				state.ids.push(ga.id);
			},
			prepare(game: Omit<Game, 'id'>) {
          		return { payload: { id: nanoid(), ...game } };
      		},
		},
		updateGame(state, action: PayloadAction<{ id: string; changes: Partial<Game> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removeGame(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addGame, updateGame, removeGame } = slice.actions;
export default slice.reducer;