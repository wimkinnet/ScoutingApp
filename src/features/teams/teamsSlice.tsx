import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Team } from '../../app/types'

interface TeamsState {
	entities: Record<string, Team>;
	ids: string[];
}

const initialState: TeamsState = {
	entities: {
		't-1': {
			id: 't-1',
			name: 'G12 C',
			clubId: 'cl-1',
			seasonId: 'se-1',
			playerIds: ['pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-7', 'pl-8', 'pl-9'],
		},
		't-2': {
			id: 't-2',
			name: 'G12 A',
			clubId: 'cl-2',
			seasonId: 'se-1',
			playerIds: ['pl-10', 'pl-11', 'pl-12', 'pl-13', 'pl-14', 'pl-15', 'pl-16', 'pl-17', 'pl-18', 'pl-19', 'pl-20', 'pl-21'],
		},
	},
	ids: ['t-1', 't-2'],
};

const slice = createSlice({
	name: 'teams',
	initialState,
	reducers: {
		addTeam: {
			reducer(state, action: PayloadAction<Team>) {	
				const team = action.payload;
				state.entities[team.id] = team;
				state.ids.push(team.id);
			},
			prepare(team: Omit<Team, 'id'>) {
          		return { payload: { id: nanoid(), ...team } };
      		},
		},
		updateTeam(state, action: PayloadAction<{ id: string; changes: Partial<Team> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removeTeam(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addTeam, updateTeam, removeTeam } = slice.actions;
export default slice.reducer;