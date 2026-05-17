import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Game } from '../../app/types'

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
			homePlayers: [
                {
                    playerId: 'pl-1',
                    shirtNumber: 4,
					homeTeam: true,
                },
                {
                    playerId: 'pl-2',
                    shirtNumber: 17,
					homeTeam: true,
                },
                {
                    playerId: 'pl-3',
                    shirtNumber: 99,
					homeTeam: true,
                },
                {
                    playerId: 'pl-4',
                    shirtNumber: 23,
					homeTeam: true,
                },
                {
                    playerId: 'pl-5',
                    shirtNumber: 8,
					homeTeam: true,
                },
                {
                    playerId: 'pl-6',
                    shirtNumber: 77,
					homeTeam: true,
                },
            ],
			awayPlayers: [
                {
                    playerId: 'pl-10',
                    shirtNumber: 4,
					homeTeam: false,
                },
                {
                    playerId: 'pl-11',
                    shirtNumber: 17,
					homeTeam: false,
                },
                {
                    playerId: 'pl-12',
                    shirtNumber: 99,
					homeTeam: false,
                },
                {
                    playerId: 'pl-13',
                    shirtNumber: 23,
					homeTeam: false,
                },
                {
                    playerId: 'pl-14',
                    shirtNumber: 8,
					homeTeam: false,
                },
                {
                    playerId: 'pl-15',
                    shirtNumber: 77,
					homeTeam: false,
                },
				{
                    playerId: 'pl-16',
                    shirtNumber: 1,
					homeTeam: false,
                },
				{
                    playerId: 'pl-17',
                    shirtNumber: 9,
					homeTeam: false,
                },
				{
                    playerId: 'pl-18',
                    shirtNumber: 14,
					homeTeam: false,
                },
				{
                    playerId: 'pl-19',
                    shirtNumber: 81,
					homeTeam: false,
                },
				{
                    playerId: 'pl-20',
                    shirtNumber: 37,
					homeTeam: false,
                },
				{
                    playerId: 'pl-21',
                    shirtNumber: 45,
					homeTeam: false,
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