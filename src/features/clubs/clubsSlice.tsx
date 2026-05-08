import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Club } from '../../app/types'

interface ClubsState {
	entities: Record<string, Club>;
	ids: string[];
}

const initialState: ClubsState = {
	entities: {
		'cl-1': {
			id: 'cl-1',
			name: 'Guco Lier',
			registrationNumber: '1518',
		},
		'cl-2': {
			id: 'cl-2',
			name: 'Bonheiden',
			registrationNumber: '1310',
		},
	},
	ids: ['cl-1', 'cl-2'],
};

const slice = createSlice({
	name: 'clubs',
	initialState,
	reducers: {
		addClub: {
			reducer(state, action: PayloadAction<Club>) {	
				const cl = action.payload;
				state.entities[cl.id] = cl;
				state.ids.push(cl.id);
			},
			prepare(club: Omit<Club, 'id'>) {
          		return { payload: { id: nanoid(), ...club } };
      		},
		},
		updateClub(state, action: PayloadAction<{ id: string; changes: Partial<Club> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removeClub(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addClub, updateClub, removeClub } = slice.actions;
export default slice.reducer;