import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Season } from '../../app/types'

interface SeasonsState {
	entities: Record<string, Season>;
	ids: string[];
}

const initialState: SeasonsState = {
	entities: {
		'se-1': {
			id: 'se-1',
			name: '2026-2027',
		},
	},
	ids: ['se-1'],
};

const slice = createSlice({
	name: 'seasons',
	initialState,
	reducers: {
		addSeason: {
			reducer(state, action: PayloadAction<Season>) {	
				const se = action.payload;
				state.entities[se.id] = se;
				state.ids.push(se.id);
			},
			prepare(season: Omit<Season, 'id'>) {
          		return { payload: { id: nanoid(), ...season } };
      		},
		},
		updateSeason(state, action: PayloadAction<{ id: string; changes: Partial<Season> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removeSeason(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addSeason, updateSeason, removeSeason } = slice.actions;
export default slice.reducer;